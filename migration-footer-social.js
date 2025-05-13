// migration-footer-social.js - Add footer and social links columns to site_settings table
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function addFooterSocialColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting migration: Adding footer and social links columns to site_settings table...');
    
    // Begin transaction
    await pool.query('BEGIN');

    // Check if columns already exist to make the migration idempotent
    const checkResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'site_settings'
      AND column_name IN (
        'footer_copyright',
        'footer_app_store_link',
        'footer_google_play_link',
        'footer_amazon_link',
        'social_facebook',
        'social_twitter',
        'social_instagram',
        'social_youtube',
        'social_discord',
        'social_whatsapp',
        'social_tiktok'
      )
    `);

    const existingColumns = checkResult.rows.map(row => row.column_name);
    
    // Add footer_copyright column if it doesn't exist
    if (!existingColumns.includes('footer_copyright')) {
      console.log('Adding footer_copyright column...');
      await pool.query(`
        ALTER TABLE site_settings 
        ADD COLUMN footer_copyright TEXT
      `);
    }

    // Add footer_app_store_link column if it doesn't exist
    if (!existingColumns.includes('footer_app_store_link')) {
      console.log('Adding footer_app_store_link column...');
      await pool.query(`
        ALTER TABLE site_settings 
        ADD COLUMN footer_app_store_link TEXT
      `);
    }

    // Add footer_google_play_link column if it doesn't exist
    if (!existingColumns.includes('footer_google_play_link')) {
      console.log('Adding footer_google_play_link column...');
      await pool.query(`
        ALTER TABLE site_settings 
        ADD COLUMN footer_google_play_link TEXT
      `);
    }

    // Add footer_amazon_link column if it doesn't exist
    if (!existingColumns.includes('footer_amazon_link')) {
      console.log('Adding footer_amazon_link column...');
      await pool.query(`
        ALTER TABLE site_settings 
        ADD COLUMN footer_amazon_link TEXT
      `);
    }

    // Add social media columns if they don't exist
    const socialColumns = [
      'social_facebook',
      'social_twitter',
      'social_instagram',
      'social_youtube',
      'social_discord',
      'social_whatsapp',
      'social_tiktok'
    ];

    for (const column of socialColumns) {
      if (!existingColumns.includes(column)) {
        console.log(`Adding ${column} column...`);
        await pool.query(`
          ALTER TABLE site_settings 
          ADD COLUMN ${column} TEXT
        `);
      }
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
addFooterSocialColumns()
  .then(() => console.log('Footer and social links columns migration completed.'))
  .catch(err => {
    console.error('Error during migration:', err);
    process.exit(1);
  });

// For ES modules
export { addFooterSocialColumns };