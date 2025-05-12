import pg from 'pg';
const { Pool } = pg;

// Create a connection to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Function to create the Home Ads table
async function createHomeAdsTable() {
  try {
    // Check if the ad_position enum type exists
    const enumExistsQuery = `
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'ad_position'
      );
    `;
    const enumExists = await pool.query(enumExistsQuery);
    
    // Create the enum type if it doesn't exist
    if (!enumExists.rows[0].exists) {
      console.log('Creating ad_position enum...');
      await pool.query(`
        CREATE TYPE ad_position AS ENUM (
          'above_featured', 'below_featured', 'above_popular', 'below_popular', 'above_about', 'below_about'
        );
      `);
      console.log('ad_position enum created successfully');
    } else {
      console.log('ad_position enum already exists');
    }

    // Check if the home_ads table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'home_ads'
      );
    `;
    const tableExists = await pool.query(tableExistsQuery);
    
    // Create the table if it doesn't exist
    if (!tableExists.rows[0].exists) {
      console.log('Creating home_ads table...');
      await pool.query(`
        CREATE TABLE "home_ads" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "position" ad_position NOT NULL,
          "image_url" TEXT NOT NULL,
          "target_url" TEXT NOT NULL,
          "status" content_status NOT NULL DEFAULT 'active',
          "start_date" TIMESTAMP,
          "end_date" TIMESTAMP,
          "click_count" INTEGER NOT NULL DEFAULT 0,
          "impression_count" INTEGER NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('home_ads table created successfully');
    } else {
      console.log('home_ads table already exists');
    }
    
    console.log('Home ads migration completed successfully');
  } catch (error) {
    console.error('Error creating home_ads table:', error);
    throw error;
  }
}

// Run the migration
createHomeAdsTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });