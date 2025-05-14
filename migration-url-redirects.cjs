require('dotenv').config();
const { Pool } = require('pg');

async function createUrlRedirectsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if the table already exists
    const tableExists = await checkTableExists('url_redirects');
    
    if (!tableExists) {
      console.log('Creating url_redirects table...');
      await pool.query(`
        CREATE TABLE url_redirects (
          id SERIAL PRIMARY KEY,
          source_url TEXT NOT NULL,
          target_url TEXT NOT NULL,
          status_code INTEGER NOT NULL DEFAULT 301,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('url_redirects table created successfully.');
    } else {
      console.log('url_redirects table already exists, skipping creation.');
    }
    
    await pool.end();
    return true;
  } catch (error) {
    console.error('Error creating url_redirects table:', error);
    await pool.end();
    return false;
  }
}

async function checkTableExists(tableName) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    throw error;
  }
}

// Run the migration
createUrlRedirectsTable()
  .then(success => {
    if (success) {
      console.log('Migration completed successfully.');
      process.exit(0);
    } else {
      console.error('Migration failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Migration error:', error);
    process.exit(1);
  });