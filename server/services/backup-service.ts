import { db } from '../db';
import { backupConfigs, backups, backupFiles, backupLogs, restores } from '@shared/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import archiver from 'archiver';
import { createReadStream, createWriteStream } from 'fs';

const execAsync = promisify(exec);

export interface BackupOptions {
  configId?: number;
  name: string;
  description?: string;
  backupType: 'full' | 'database_only' | 'files_only' | 'settings_only';
  storageLocation?: 'local' | 'cloud' | 'both';
  includeUploads?: boolean;
  includeAssets?: boolean;
  includeSettings?: boolean;
  includeLogs?: boolean;
  compressionEnabled?: boolean;
  compressionLevel?: number;
  userId?: number;
}

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

export class BackupService {
  private backupsDir = path.join(process.cwd(), 'backups');
  private uploadsDir = path.join(process.cwd(), 'uploads');
  private assetsDir = path.join(process.cwd(), 'public');

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.backupsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create backups directory:', error);
    }
  }

  private async log(backupId: number, level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any, duration?: number) {
    try {
      await db.insert(backupLogs).values({
        backupId,
        operationType: 'backup',
        level,
        message,
        data,
        duration
      });
    } catch (error) {
      console.error('Failed to log backup operation:', error);
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

  private calculateChecksum(filePath: string, algorithm: 'md5' | 'sha256' = 'md5'): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async getDatabaseDump(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpFile = path.join(this.backupsDir, `database-${timestamp}.sql`);
    
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

    // Create pg_dump command
    const command = `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${dumpFile}" --clean --if-exists --create`;
    
    try {
      await execAsync(command);
      return dumpFile;
    } catch (error) {
      throw new Error(`Database dump failed: ${error}`);
    }
  }

  private async createArchive(sourceFiles: string[], outputPath: string, compressionLevel: number = 6): Promise<number> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: compressionLevel } });

      let totalSize = 0;

      output.on('close', () => {
        resolve(archive.pointer());
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      sourceFiles.forEach(filePath => {
        if (filePath.endsWith('.sql')) {
          archive.file(filePath, { name: path.basename(filePath) });
        } else {
          // For directories, add them recursively
          archive.directory(filePath, path.basename(filePath));
        }
      });

      archive.finalize();
    });
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const stats = await fs.stat(dirPath);
      if (stats.isFile()) {
        return stats.size;
      }
      
      if (stats.isDirectory()) {
        const files = await fs.readdir(dirPath);
        let totalSize = 0;
        
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          totalSize += await this.getDirectorySize(filePath);
        }
        
        return totalSize;
      }
      
      return 0;
    } catch (error) {
      return 0;
    }
  }

  private async getTableStats() {
    try {
      // Get table count and record estimates
      // This is a simplified version - in a real implementation, you'd query system tables
      return {
        tableCount: 50, // Placeholder - would query information_schema.tables
        totalRecords: 10000 // Placeholder - would sum all table row counts
      };
    } catch (error) {
      return { tableCount: 0, totalRecords: 0 };
    }
  }

  async createBackup(options: BackupOptions): Promise<number> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${options.name}-${timestamp}`;
    
    // Create backup record
    const [backup] = await db.insert(backups).values({
      configId: options.configId,
      name: backupName,
      description: options.description,
      backupType: options.backupType,
      status: 'in_progress',
      triggeredBy: 'manual',
      createdBy: options.userId,
      startedAt: new Date()
    }).returning();

    const backupId = backup.id;

    try {
      await this.log(backupId, 'info', 'Backup started', { options });

      const filesToBackup: string[] = [];
      const filesToInclude: any[] = [];
      let totalFileCount = 0;

      // Database backup
      if (options.backupType === 'full' || options.backupType === 'database_only') {
        await this.log(backupId, 'info', 'Starting database backup');
        const dbDumpFile = await this.getDatabaseDump();
        filesToBackup.push(dbDumpFile);
        
        const dbFileSize = await this.getDirectorySize(dbDumpFile);
        filesToInclude.push({
          backupId,
          filePath: path.relative(this.backupsDir, dbDumpFile),
          fileName: path.basename(dbDumpFile),
          fileType: 'database',
          fileSize: dbFileSize,
          checksumMd5: await this.calculateChecksum(dbDumpFile),
          lastModified: new Date()
        });
        
        totalFileCount++;
        await this.log(backupId, 'info', 'Database backup completed', { size: dbFileSize });
      }

      // Files backup
      if (options.backupType === 'full' || options.backupType === 'files_only') {
        // Include uploads if requested
        if (options.includeUploads !== false) {
          try {
            await fs.access(this.uploadsDir);
            filesToBackup.push(this.uploadsDir);
            
            const uploadsSize = await this.getDirectorySize(this.uploadsDir);
            filesToInclude.push({
              backupId,
              filePath: 'uploads',
              fileName: 'uploads',
              fileType: 'upload',
              fileSize: uploadsSize,
              lastModified: new Date()
            });
            
            totalFileCount++;
            await this.log(backupId, 'info', 'Uploads directory added to backup', { size: uploadsSize });
          } catch {
            await this.log(backupId, 'warn', 'Uploads directory not found, skipping');
          }
        }

        // Include assets if requested
        if (options.includeAssets !== false) {
          try {
            await fs.access(this.assetsDir);
            filesToBackup.push(this.assetsDir);
            
            const assetsSize = await this.getDirectorySize(this.assetsDir);
            filesToInclude.push({
              backupId,
              filePath: 'public',
              fileName: 'public',
              fileType: 'asset',
              fileSize: assetsSize,
              lastModified: new Date()
            });
            
            totalFileCount++;
            await this.log(backupId, 'info', 'Assets directory added to backup', { size: assetsSize });
          } catch {
            await this.log(backupId, 'warn', 'Assets directory not found, skipping');
          }
        }
      }

      // Create archive
      const archiveFile = path.join(this.backupsDir, `${backupName}.zip`);
      await this.log(backupId, 'info', 'Creating backup archive', { files: filesToBackup.length });
      
      const compressionLevel = options.compressionEnabled !== false ? (options.compressionLevel || 6) : 0;
      const archiveSize = await this.createArchive(filesToBackup, archiveFile, compressionLevel);
      
      // Calculate checksums
      const md5Checksum = await this.calculateChecksum(archiveFile, 'md5');
      const sha256Checksum = await this.calculateChecksum(archiveFile, 'sha256');

      // Get table statistics
      const tableStats = await this.getTableStats();

      // Save backup files manifest
      if (filesToInclude.length > 0) {
        await db.insert(backupFiles).values(filesToInclude);
      }

      // Update backup record
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);
      
      await db.update(backups)
        .set({
          status: 'completed',
          fileName: path.basename(archiveFile),
          filePath: archiveFile,
          fileSize: archiveSize,
          checksumMd5: md5Checksum,
          checksumSha256: sha256Checksum,
          databaseTableCount: tableStats.tableCount,
          totalRecords: tableStats.totalRecords,
          fileCount: totalFileCount,
          completedAt: new Date(),
          duration,
          metadata: {
            includes: filesToBackup.map(f => path.basename(f)),
            compression: {
              enabled: options.compressionEnabled !== false,
              level: compressionLevel,
              compressedSize: archiveSize
            },
            environment: {
              nodeVersion: process.version,
              serverInfo: process.platform
            }
          }
        })
        .where(eq(backups.id, backupId));

      await this.log(backupId, 'info', 'Backup completed successfully', { 
        duration, 
        fileSize: archiveSize, 
        checksum: md5Checksum 
      });

      // Cleanup temporary database dump
      if (filesToBackup.some(f => f.endsWith('.sql'))) {
        try {
          const sqlFiles = filesToBackup.filter(f => f.endsWith('.sql'));
          for (const sqlFile of sqlFiles) {
            await fs.unlink(sqlFile);
          }
        } catch (error) {
          await this.log(backupId, 'warn', 'Failed to cleanup temporary database dump', { error });
        }
      }

      return backupId;

    } catch (error) {
      // Update backup record with error
      await db.update(backups)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
          duration: Math.floor((Date.now() - startTime) / 1000)
        })
        .where(eq(backups.id, backupId));

      await this.log(backupId, 'error', 'Backup failed', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  async getAllBackups() {
    return await db.select().from(backups).orderBy(desc(backups.createdAt));
  }

  async getBackupById(id: number) {
    const [backup] = await db.select().from(backups).where(eq(backups.id, id));
    return backup;
  }

  async getBackupFiles(backupId: number) {
    return await db.select().from(backupFiles).where(eq(backupFiles.backupId, backupId));
  }

  async getBackupLogs(backupId: number) {
    return await db.select().from(backupLogs).where(eq(backupLogs.backupId, backupId));
  }

  async deleteBackup(id: number): Promise<void> {
    const backup = await this.getBackupById(id);
    if (!backup) {
      throw new Error('Backup not found');
    }

    try {
      // Delete physical file
      if (backup.filePath) {
        await fs.unlink(backup.filePath);
      }
    } catch (error) {
      console.warn('Failed to delete backup file:', error);
    }

    // Delete database records (cascade will handle related records)
    await db.delete(backups).where(eq(backups.id, id));
  }

  async validateBackupIntegrity(id: number): Promise<boolean> {
    const backup = await this.getBackupById(id);
    if (!backup || !backup.filePath) {
      return false;
    }

    try {
      // Check if file exists
      await fs.access(backup.filePath);
      
      // Verify checksum
      const currentChecksum = await this.calculateChecksum(backup.filePath, 'md5');
      return currentChecksum === backup.checksumMd5;
    } catch {
      return false;
    }
  }

  // Backup Configuration Management
  async createBackupConfig(config: any) {
    const [newConfig] = await db.insert(backupConfigs).values(config).returning();
    return newConfig;
  }

  async getAllBackupConfigs() {
    return await db.select().from(backupConfigs).where(eq(backupConfigs.isActive, true));
  }

  async updateBackupConfig(id: number, updates: any) {
    const [updated] = await db.update(backupConfigs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(backupConfigs.id, id))
      .returning();
    return updated;
  }

  async deleteBackupConfig(id: number) {
    await db.update(backupConfigs)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(backupConfigs.id, id));
  }

  // Cleanup old backups based on retention policy
  async cleanupOldBackups(): Promise<void> {
    const configs = await this.getAllBackupConfigs();
    
    for (const config of configs) {
      try {
        // Get backups for this config that are older than retention period
        const cutoffDate = new Date(Date.now() - (config.retentionDays * 24 * 60 * 60 * 1000));
        
        const oldBackups = await db.select()
          .from(backups)
          .where(
            and(
              eq(backups.configId, config.id),
              lte(backups.createdAt, cutoffDate),
              eq(backups.status, 'completed')
            )
          )
          .orderBy(desc(backups.createdAt));

        // Keep at least the specified number of backups
        const backupsToDelete = oldBackups.slice(config.maxBackups);
        
        for (const backup of backupsToDelete) {
          await this.deleteBackup(backup.id);
        }
      } catch (error) {
        console.error(`Failed to cleanup backups for config ${config.id}:`, error);
      }
    }
  }
}