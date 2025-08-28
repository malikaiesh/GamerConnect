import { Router } from 'express';
import { BackupService } from '../services/backup-service';
import { RestoreService } from '../services/restore-service';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from './middleware/validation';

const router = Router();
const backupService = new BackupService();
const restoreService = new RestoreService();

// ==================== BACKUP ENDPOINTS ====================

// Get all backups
router.get('/backups', async (req, res) => {
  try {
    const backups = await backupService.getAllBackups();
    res.json({ backups });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
});

// Get backup by ID
router.get('/backups/:id', 
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const backup = await backupService.getBackupById(req.params.id);
      if (!backup) {
        return res.status(404).json({ error: 'Backup not found' });
      }
      res.json({ backup });
    } catch (error) {
      console.error('Error fetching backup:', error);
      res.status(500).json({ error: 'Failed to fetch backup' });
    }
  }
);

// Get backup files manifest
router.get('/backups/:id/files',
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const files = await backupService.getBackupFiles(req.params.id);
      res.json({ files });
    } catch (error) {
      console.error('Error fetching backup files:', error);
      res.status(500).json({ error: 'Failed to fetch backup files' });
    }
  }
);

// Get backup logs
router.get('/backups/:id/logs',
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const logs = await backupService.getBackupLogs(req.params.id);
      res.json({ logs });
    } catch (error) {
      console.error('Error fetching backup logs:', error);
      res.status(500).json({ error: 'Failed to fetch backup logs' });
    }
  }
);

// Create new backup
router.post('/backups',
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('backupType').isIn(['full', 'database_only', 'files_only', 'settings_only']),
  body('storageLocation').optional().isIn(['local', 'cloud', 'both']),
  body('includeUploads').optional().isBoolean(),
  body('includeAssets').optional().isBoolean(),
  body('includeSettings').optional().isBoolean(),
  body('includeLogs').optional().isBoolean(),
  body('compressionEnabled').optional().isBoolean(),
  body('compressionLevel').optional().isInt({ min: 1, max: 9 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const options = {
        name: req.body.name,
        description: req.body.description,
        backupType: req.body.backupType,
        storageLocation: req.body.storageLocation,
        includeUploads: req.body.includeUploads,
        includeAssets: req.body.includeAssets,
        includeSettings: req.body.includeSettings,
        includeLogs: req.body.includeLogs,
        compressionEnabled: req.body.compressionEnabled,
        compressionLevel: req.body.compressionLevel,
        userId: req.user?.id
      };

      const backupId = await backupService.createBackup(options);
      const backup = await backupService.getBackupById(backupId);
      
      res.status(201).json({ 
        message: 'Backup created successfully', 
        backup 
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      res.status(500).json({ error: 'Failed to create backup' });
    }
  }
);

// Delete backup
router.delete('/backups/:id',
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      await backupService.deleteBackup(req.params.id);
      res.json({ message: 'Backup deleted successfully' });
    } catch (error) {
      console.error('Error deleting backup:', error);
      res.status(500).json({ error: 'Failed to delete backup' });
    }
  }
);

// Validate backup integrity
router.post('/backups/:id/validate',
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const isValid = await backupService.validateBackupIntegrity(req.params.id);
      res.json({ valid: isValid });
    } catch (error) {
      console.error('Error validating backup:', error);
      res.status(500).json({ error: 'Failed to validate backup' });
    }
  }
);

// ==================== RESTORE ENDPOINTS ====================

// Get all restores
router.get('/restores', async (req, res) => {
  try {
    const restores = await restoreService.getAllRestores();
    res.json({ restores });
  } catch (error) {
    console.error('Error fetching restores:', error);
    res.status(500).json({ error: 'Failed to fetch restores' });
  }
});

// Get restore by ID
router.get('/restores/:id',
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const restore = await restoreService.getRestoreById(req.params.id);
      if (!restore) {
        return res.status(404).json({ error: 'Restore not found' });
      }
      res.json({ restore });
    } catch (error) {
      console.error('Error fetching restore:', error);
      res.status(500).json({ error: 'Failed to fetch restore' });
    }
  }
);

// Get restore logs
router.get('/restores/:id/logs',
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const logs = await restoreService.getRestoreLogs(req.params.id);
      res.json({ logs });
    } catch (error) {
      console.error('Error fetching restore logs:', error);
      res.status(500).json({ error: 'Failed to fetch restore logs' });
    }
  }
);

// Validate backup for restore
router.post('/backups/:id/validate-for-restore',
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const validation = await restoreService.validateBackupForRestore(req.params.id);
      res.json(validation);
    } catch (error) {
      console.error('Error validating backup for restore:', error);
      res.status(500).json({ error: 'Failed to validate backup for restore' });
    }
  }
);

// Create new restore
router.post('/restores',
  body('backupId').isInt().withMessage('Backup ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('restoreDatabase').optional().isBoolean(),
  body('restoreFiles').optional().isBoolean(),
  body('restoreSettings').optional().isBoolean(),
  body('createBackupBeforeRestore').optional().isBoolean(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const options = {
        backupId: req.body.backupId,
        name: req.body.name,
        description: req.body.description,
        restoreDatabase: req.body.restoreDatabase,
        restoreFiles: req.body.restoreFiles,
        restoreSettings: req.body.restoreSettings,
        createBackupBeforeRestore: req.body.createBackupBeforeRestore,
        userId: req.user?.id
      };

      const restoreId = await restoreService.restoreFromBackup(options);
      const restore = await restoreService.getRestoreById(restoreId);
      
      res.status(201).json({ 
        message: 'Restore started successfully', 
        restore 
      });
    } catch (error) {
      console.error('Error creating restore:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create restore' });
    }
  }
);

// Cancel restore
router.post('/restores/:id/cancel',
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      await restoreService.cancelRestore(req.params.id);
      res.json({ message: 'Restore cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling restore:', error);
      res.status(500).json({ error: 'Failed to cancel restore' });
    }
  }
);

// ==================== BACKUP CONFIGURATION ENDPOINTS ====================

// Get all backup configurations
router.get('/backup-configs', async (req, res) => {
  try {
    const configs = await backupService.getAllBackupConfigs();
    res.json({ configs });
  } catch (error) {
    console.error('Error fetching backup configs:', error);
    res.status(500).json({ error: 'Failed to fetch backup configs' });
  }
});

// Create backup configuration
router.post('/backup-configs',
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('backupType').isIn(['full', 'database_only', 'files_only', 'settings_only']),
  body('storageLocation').optional().isIn(['local', 'cloud', 'both']),
  body('schedule').optional().isString(),
  body('retentionDays').optional().isInt({ min: 1 }),
  body('maxBackups').optional().isInt({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const config = {
        name: req.body.name,
        description: req.body.description,
        backupType: req.body.backupType,
        storageLocation: req.body.storageLocation || 'local',
        schedule: req.body.schedule,
        isScheduleEnabled: !!req.body.schedule,
        retentionDays: req.body.retentionDays || 30,
        maxBackups: req.body.maxBackups || 10,
        includeDatabaseStructure: req.body.includeDatabaseStructure !== false,
        includeDatabaseData: req.body.includeDatabaseData !== false,
        includeUploads: req.body.includeUploads !== false,
        includeAssets: req.body.includeAssets !== false,
        includeSettings: req.body.includeSettings !== false,
        includeLogs: req.body.includeLogs === true,
        compressionEnabled: req.body.compressionEnabled !== false,
        compressionLevel: req.body.compressionLevel || 6,
        createdBy: req.user?.id
      };

      const newConfig = await backupService.createBackupConfig(config);
      res.status(201).json({ 
        message: 'Backup configuration created successfully', 
        config: newConfig 
      });
    } catch (error) {
      console.error('Error creating backup config:', error);
      res.status(500).json({ error: 'Failed to create backup config' });
    }
  }
);

// Update backup configuration
router.put('/backup-configs/:id',
  param('id').isInt().toInt(),
  body('name').optional().notEmpty(),
  body('description').optional().isString(),
  body('backupType').optional().isIn(['full', 'database_only', 'files_only', 'settings_only']),
  body('storageLocation').optional().isIn(['local', 'cloud', 'both']),
  body('schedule').optional().isString(),
  body('retentionDays').optional().isInt({ min: 1 }),
  body('maxBackups').optional().isInt({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const updates = { ...req.body };
      if (req.body.schedule) {
        updates.isScheduleEnabled = true;
      } else if (req.body.schedule === '') {
        updates.isScheduleEnabled = false;
        updates.schedule = null;
      }

      const config = await backupService.updateBackupConfig(req.params.id, updates);
      res.json({ message: 'Backup configuration updated successfully', config });
    } catch (error) {
      console.error('Error updating backup config:', error);
      res.status(500).json({ error: 'Failed to update backup config' });
    }
  }
);

// Delete backup configuration
router.delete('/backup-configs/:id',
  param('id').isInt().toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      await backupService.deleteBackupConfig(req.params.id);
      res.json({ message: 'Backup configuration deleted successfully' });
    } catch (error) {
      console.error('Error deleting backup config:', error);
      res.status(500).json({ error: 'Failed to delete backup config' });
    }
  }
);

// ==================== MAINTENANCE ENDPOINTS ====================

// Cleanup old backups
router.post('/maintenance/cleanup', async (req, res) => {
  try {
    await backupService.cleanupOldBackups();
    res.json({ message: 'Backup cleanup completed successfully' });
  } catch (error) {
    console.error('Error cleaning up backups:', error);
    res.status(500).json({ error: 'Failed to cleanup backups' });
  }
});

export default router;