import pg from 'pg';
const { Pool } = pg;

// Create a connection to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Function to update the Home Ads table
async function updateHomeAdsTable() {
  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');

    // Check if adCode column exists
    const adCodeExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'home_ads'
        AND column_name = 'ad_code'
      );
    `;
    const adCodeExists = await client.query(adCodeExistsQuery);
    
    // Add adCode column if it doesn't exist
    if (!adCodeExists.rows[0].exists) {
      console.log('Adding ad_code column to home_ads table...');
      await client.query(`
        ALTER TABLE "home_ads" 
        ADD COLUMN "ad_code" TEXT;
      `);
      console.log('ad_code column added successfully');
    } else {
      console.log('ad_code column already exists');
    }

    // Update image_url and target_url to be nullable
    console.log('Updating image_url and target_url to be nullable...');
    await client.query(`
      ALTER TABLE "home_ads" 
      ALTER COLUMN "image_url" DROP NOT NULL,
      ALTER COLUMN "target_url" DROP NOT NULL;
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Home ads table updated successfully');
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error updating home_ads table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
updateHomeAdsTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });