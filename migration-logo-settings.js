// migration-logo-settings.js - Add logo-related columns to site_settings table
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

async function addLogoColumnsToSiteSettings() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting migration: Adding logo columns to site_settings table...');
    
    // Begin transaction
    await pool.query('BEGIN');

    // Check if columns already exist to make the migration idempotent
    const checkResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'site_settings'
      AND column_name IN ('site_logo', 'site_favicon', 'use_text_logo', 'text_logo_color')
    `);

    const existingColumns = checkResult.rows.map(row => row.column_name);
    
    // Add site_logo column if it doesn't exist
    if (!existingColumns.includes('site_logo')) {
      console.log('Adding site_logo column...');
      await pool.query(`
        ALTER TABLE site_settings 
        ADD COLUMN site_logo TEXT
      `);
    }

    // Add site_favicon column if it doesn't exist
    if (!existingColumns.includes('site_favicon')) {
      console.log('Adding site_favicon column...');
      await pool.query(`
        ALTER TABLE site_settings 
        ADD COLUMN site_favicon TEXT
      `);
    }

    // Add use_text_logo column if it doesn't exist
    if (!existingColumns.includes('use_text_logo')) {
      console.log('Adding use_text_logo column...');
      await pool.query(`
        ALTER TABLE site_settings 
        ADD COLUMN use_text_logo BOOLEAN DEFAULT TRUE
      `);
    }

    // Add text_logo_color column if it doesn't exist
    if (!existingColumns.includes('text_logo_color')) {
      console.log('Adding text_logo_color column...');
      await pool.query(`
        ALTER TABLE site_settings 
        ADD COLUMN text_logo_color TEXT DEFAULT '#4f46e5'
      `);
    }

    // Commit transaction
    await pool.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Close pool
    await pool.end();
  }
}

// Execute the migration
addLogoColumnsToSiteSettings()
  .then(() => console.log('Logo columns migration completed.'))
  .catch(err => {
    console.error('Error during migration:', err);
    process.exit(1);
  });

// For ES modules
export { addLogoColumnsToSiteSettings };