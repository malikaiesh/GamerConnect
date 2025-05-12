import process from 'node:process';
import pg from 'pg';

async function addGoogleAdColumns() {
  const { Pool } = pg;
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting home_ads table update...');
    
    // Check if columns already exist
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'home_ads' 
      AND column_name IN ('is_google_ad', 'ad_enabled');
    `;
    
    const { rows } = await pool.query(checkColumnsQuery);
    const existingColumns = rows.map(row => row.column_name);
    
    if (!existingColumns.includes('is_google_ad')) {
      console.log('Adding is_google_ad column...');
      await pool.query(`
        ALTER TABLE home_ads 
        ADD COLUMN is_google_ad BOOLEAN NOT NULL DEFAULT FALSE;
      `);
      console.log('Added is_google_ad column');
    } else {
      console.log('is_google_ad column already exists');
    }
    
    if (!existingColumns.includes('ad_enabled')) {
      console.log('Adding ad_enabled column...');
      await pool.query(`
        ALTER TABLE home_ads 
        ADD COLUMN ad_enabled BOOLEAN NOT NULL DEFAULT TRUE;
      `);
      console.log('Added ad_enabled column');
    } else {
      console.log('ad_enabled column already exists');
    }
    
    console.log('Home ads table update completed successfully');
  } catch (error) {
    console.error('Error updating home_ads table:', error);
  } finally {
    await pool.end();
  }
}

addGoogleAdColumns()
  .then(() => console.log('Migration completed'))
  .catch((err) => console.error('Migration failed:', err));