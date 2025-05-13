import 'dotenv/config';
import pg from 'pg';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addContentColumnToSitemapsTable() {
  console.log('Adding content column to sitemaps table...');
  
  try {
    await pool.query(`
      SELECT 1 FROM information_schema.tables WHERE table_name = 'sitemaps' LIMIT 1
    `);
    
    // Check if the content column already exists
    const contentColumnExists = await columnExists('sitemaps', 'content');
    
    if (!contentColumnExists) {
      // Add the content column to store the XML
      await pool.query(`
        ALTER TABLE sitemaps
        ADD COLUMN content TEXT DEFAULT NULL
      `);
      
      console.log('Successfully added content column to sitemaps table');
    } else {
      console.log('Content column already exists in sitemaps table');
    }
    
    // Create the client/public/sitemaps directory if it doesn't exist
    try {
      const dirPath = path.join(process.cwd(), 'client/public/sitemaps');
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } catch (error) {
      console.error('Error creating sitemaps directory:', error);
    }
    
  } catch (error) {
    console.error('Error updating sitemaps table:', error);
    throw error;
  }
}

async function columnExists(tableName, columnName) {
  try {
    const result = await pool.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = $1
      AND column_name = $2
    `, [tableName, columnName]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
    throw error;
  }
}

// Self-invoking async function to run the migration
(async () => {
  try {
    await addContentColumnToSitemapsTable();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();