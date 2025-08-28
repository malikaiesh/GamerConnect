import { db } from '../db';
import { backups, backupLogs, restores } from '@shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { extract } from 'archiver';
import AdmZip from 'adm-zip';
import { BackupService } from './backup-service';

const execAsync = promisify(exec);

export interface RestoreOptions {
  backupId: number;
  name: string;
  description?: string;
  restoreDatabase?: boolean;
  restoreFiles?: boolean;
  restoreSettings?: boolean;
  createBackupBeforeRestore?: boolean;
  userId?: number;
}

export class RestoreService {
  private backupService: BackupService;
  private tempDir = path.join(process.cwd(), 'temp', 'restore');
  private backupsDir = path.join(process.cwd(), 'backups');
  private uploadsDir = path.join(process.cwd(), 'uploads');
  private assetsDir = path.join(process.cwd(), 'public');

  constructor() {
    this.backupService = new BackupService();
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  private async logRestore(restoreId: number, level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any, duration?: number) {
    try {
      await db.insert(backupLogs).values({
        restoreId,
        operationType: 'restore',
        level,
        message,
        data,
        duration
      });
    } catch (error) {
      console.error('Failed to log restore operation:', error);
    }
  }

  private async updateRestoreProgress(restoreId: number, currentStep: string, completedSteps: number, totalSteps: number) {
    await db.update(restores)
      .set({
        currentStep,
        completedSteps,
        totalSteps,
        updatedAt: new Date()
      })
      .where(eq(restores.id, restoreId));
  }

  private async extractBackupArchive(archivePath: string, extractPath: string): Promise<void> {
    try {
      const zip = new AdmZip(archivePath);
      zip.extractAllTo(extractPath, true);
    } catch (error) {
      throw new Error(`Failed to extract backup archive: ${error}`);
    }
  }

  private async restoreDatabase(sqlFilePath: string): Promise<{ tablesRestored: number; recordsRestored: number }> {
    // Get database connection info from environment
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable not found');
    }

    const url = new URL(dbUrl);
    const dbConfig = {
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.slice(1),
      username: url.username,
      password: url.password
    };

    // Execute the SQL file
    const command = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${sqlFilePath}"`;
    
    try {
      const { stdout } = await execAsync(command);
      
      // Parse output to get statistics (simplified)
      const tablesRestored = (stdout.match(/CREATE TABLE/g) || []).length;
      const recordsRestored = (stdout.match(/INSERT/g) || []).length;
      
      return { tablesRestored, recordsRestored };
    } catch (error) {
      throw new Error(`Database restore failed: ${error}`);
    }
  }

  private async restoreDirectory(sourcePath: string, targetPath: string): Promise<number> {
    let filesRestored = 0;
    
    try {
      // Remove existing target directory if it exists
      try {
        await fs.access(targetPath);
        await fs.rm(targetPath, { recursive: true, force: true });
      } catch {
        // Directory doesn't exist, which is fine
      }

      // Copy source directory to target
      await this.copyDirectory(sourcePath, targetPath);
      
      // Count files in restored directory
      filesRestored = await this.countFiles(targetPath);
      
      return filesRestored;
    } catch (error) {
      throw new Error(`Failed to restore directory ${sourcePath}: ${error}`);
    }
  }

  private async copyDirectory(source: string, target: string): Promise<void> {
    try {
      await fs.mkdir(target, { recursive: true });
      
      const entries = await fs.readdir(source, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(target, entry.name);
        
        if (entry.isDirectory()) {
          await this.copyDirectory(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    } catch (error) {
      throw new Error(`Failed to copy directory: ${error}`);
    }
  }

  private async countFiles(dirPath: string): Promise<number> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      let count = 0;
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          count += await this.countFiles(path.join(dirPath, entry.name));
        } else {
          count++;
        }
      }
      
      return count;
    } catch {
      return 0;
    }
  }

  async validateBackupForRestore(backupId: number): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Check if backup exists and is completed
      const backup = await db.select().from(backups).where(eq(backups.id, backupId));
      if (!backup.length) {
        errors.push('Backup not found');
        return { valid: false, errors };
      }

      const backupRecord = backup[0];
      
      if (backupRecord.status !== 'completed') {
        errors.push('Backup is not in completed status');
      }

      if (!backupRecord.filePath) {
        errors.push('Backup file path not found');
        return { valid: false, errors };
      }

      // Check if backup file exists
      try {
        await fs.access(backupRecord.filePath);
      } catch {
        errors.push('Backup file not found on disk');
      }

      // Validate backup integrity
      const isIntegrityValid = await this.backupService.validateBackupIntegrity(backupId);
      if (!isIntegrityValid) {
        errors.push('Backup file integrity check failed');
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Validation failed: ${error}`);
      return { valid: false, errors };
    }
  }

  async restoreFromBackup(options: RestoreOptions): Promise<number> {
    const startTime = Date.now();
    
    // Validate backup first
    const validation = await this.validateBackupForRestore(options.backupId);
    if (!validation.valid) {
      throw new Error(`Backup validation failed: ${validation.errors.join(', ')}`);
    }

    // Get backup information
    const [backup] = await db.select().from(backups).where(eq(backups.id, options.backupId));
    if (!backup) {
      throw new Error('Backup not found');
    }

    // Create restore record
    const [restore] = await db.insert(restores).values({
      backupId: options.backupId,
      name: options.name,
      description: options.description,
      status: 'in_progress',
      restoreDatabase: options.restoreDatabase !== false,
      restoreFiles: options.restoreFiles !== false,
      restoreSettings: options.restoreSettings !== false,
      createBackupBeforeRestore: options.createBackupBeforeRestore !== false,
      createdBy: options.userId,
      startedAt: new Date(),
      metadata: {
        originalBackupInfo: {
          createdAt: backup.createdAt.toISOString(),
          backupType: backup.backupType,
          fileSize: backup.fileSize
        },
        environment: {
          nodeVersion: process.version
        }
      }
    }).returning();

    const restoreId = restore.id;
    let preRestoreBackupId: number | null = null;

    try {
      await this.logRestore(restoreId, 'info', 'Restore started', { options, backupInfo: backup });
      
      let totalSteps = 1; // Extract step
      if (options.createBackupBeforeRestore) totalSteps++;
      if (options.restoreDatabase) totalSteps++;
      if (options.restoreFiles) totalSteps++;
      let completedSteps = 0;

      // Step 1: Create backup before restore (if requested)
      if (options.createBackupBeforeRestore) {
        await this.updateRestoreProgress(restoreId, 'Creating pre-restore backup', completedSteps, totalSteps);
        await this.logRestore(restoreId, 'info', 'Creating backup before restore');
        
        const preBackupOptions = {
          name: `pre-restore-${options.name}`,
          description: `Automatic backup created before restore of ${backup.name}`,
          backupType: 'full' as const,
          userId: options.userId
        };
        
        preRestoreBackupId = await this.backupService.createBackup(preBackupOptions);
        
        // Update restore record with pre-restore backup ID
        await db.update(restores)
          .set({ preRestoreBackupId })
          .where(eq(restores.id, restoreId));
          
        completedSteps++;
        await this.logRestore(restoreId, 'info', 'Pre-restore backup completed', { backupId: preRestoreBackupId });
      }

      // Step 2: Extract backup archive
      await this.updateRestoreProgress(restoreId, 'Extracting backup archive', completedSteps, totalSteps);
      await this.logRestore(restoreId, 'info', 'Extracting backup archive');
      
      const extractPath = path.join(this.tempDir, `restore-${restoreId}`);
      await fs.mkdir(extractPath, { recursive: true });
      await this.extractBackupArchive(backup.filePath!, extractPath);
      
      completedSteps++;
      await this.logRestore(restoreId, 'info', 'Backup archive extracted', { extractPath });

      let tablesRestored = 0;
      let recordsRestored = 0;
      let filesRestored = 0;

      // Step 3: Restore database (if requested)
      if (options.restoreDatabase) {
        await this.updateRestoreProgress(restoreId, 'Restoring database', completedSteps, totalSteps);
        await this.logRestore(restoreId, 'info', 'Starting database restore');
        
        // Find SQL file in extracted backup
        const files = await fs.readdir(extractPath);
        const sqlFile = files.find(f => f.endsWith('.sql'));
        
        if (sqlFile) {
          const sqlFilePath = path.join(extractPath, sqlFile);
          const dbStats = await this.restoreDatabase(sqlFilePath);
          tablesRestored = dbStats.tablesRestored;
          recordsRestored = dbStats.recordsRestored;
          
          await this.logRestore(restoreId, 'info', 'Database restore completed', dbStats);
        } else {
          await this.logRestore(restoreId, 'warn', 'No database file found in backup');
        }
        
        completedSteps++;
      }

      // Step 4: Restore files (if requested)
      if (options.restoreFiles) {
        await this.updateRestoreProgress(restoreId, 'Restoring files', completedSteps, totalSteps);
        await this.logRestore(restoreId, 'info', 'Starting files restore');
        
        // Restore uploads directory
        const uploadsPath = path.join(extractPath, 'uploads');
        try {
          await fs.access(uploadsPath);
          const uploadCount = await this.restoreDirectory(uploadsPath, this.uploadsDir);
          filesRestored += uploadCount;
          await this.logRestore(restoreId, 'info', 'Uploads restored', { count: uploadCount });
        } catch {
          await this.logRestore(restoreId, 'warn', 'No uploads directory found in backup');
        }

        // Restore assets directory
        const assetsPath = path.join(extractPath, 'public');
        try {
          await fs.access(assetsPath);
          const assetCount = await this.restoreDirectory(assetsPath, this.assetsDir);
          filesRestored += assetCount;
          await this.logRestore(restoreId, 'info', 'Assets restored', { count: assetCount });
        } catch {
          await this.logRestore(restoreId, 'warn', 'No assets directory found in backup');
        }
        
        completedSteps++;
      }

      // Cleanup temp directory
      try {
        await fs.rm(extractPath, { recursive: true, force: true });
      } catch (error) {
        await this.logRestore(restoreId, 'warn', 'Failed to cleanup temp directory', { error });
      }

      // Update restore record with completion
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);
      
      await db.update(restores)
        .set({
          status: 'completed',
          completedAt: new Date(),
          duration,
          totalSteps,
          completedSteps: totalSteps,
          currentStep: 'Completed',
          tablesRestored,
          recordsRestored,
          filesRestored
        })
        .where(eq(restores.id, restoreId));

      await this.logRestore(restoreId, 'info', 'Restore completed successfully', { 
        duration, 
        tablesRestored, 
        recordsRestored, 
        filesRestored 
      });

      return restoreId;

    } catch (error) {
      // Update restore record with error
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      await db.update(restores)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
          duration
        })
        .where(eq(restores.id, restoreId));

      await this.logRestore(restoreId, 'error', 'Restore failed', { error: error instanceof Error ? error.message : error });
      
      // Cleanup temp directory on error
      try {
        const extractPath = path.join(this.tempDir, `restore-${restoreId}`);
        await fs.rm(extractPath, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
      
      throw error;
    }
  }

  async getAllRestores() {
    return await db.select().from(restores).orderBy(eq(restores.createdAt, restores.createdAt)); // Replace with desc when available
  }

  async getRestoreById(id: number) {
    const [restore] = await db.select().from(restores).where(eq(restores.id, id));
    return restore;
  }

  async getRestoreLogs(restoreId: number) {
    return await db.select().from(backupLogs)
      .where(eq(backupLogs.restoreId, restoreId));
  }

  async cancelRestore(restoreId: number): Promise<void> {
    await db.update(restores)
      .set({
        status: 'cancelled',
        completedAt: new Date()
      })
      .where(eq(restores.id, restoreId));
      
    await this.logRestore(restoreId, 'info', 'Restore cancelled by user');
  }
}