import pg from 'pg';
const { Pool } = pg;

// Create a connection to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Function to create the API keys table
async function createApiKeysTable() {
  try {
    // Check if the api_key_type enum type exists
    const enumExistsQuery = `
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'api_key_type'
      );
    `;
    const enumExists = await pool.query(enumExistsQuery);
    
    // Create the enum type if it doesn't exist
    if (!enumExists.rows[0].exists) {
      console.log('Creating api_key_type enum...');
      await pool.query(`
        CREATE TYPE api_key_type AS ENUM (
          'tinymce', 'game-monetize', 'analytics', 'custom'
        );
      `);
      console.log('api_key_type enum created successfully');
    } else {
      console.log('api_key_type enum already exists');
    }

    // Check if the api_keys table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'api_keys'
      );
    `;
    const tableExists = await pool.query(tableExistsQuery);
    
    // Create the table if it doesn't exist
    if (!tableExists.rows[0].exists) {
      console.log('Creating api_keys table...');
      await pool.query(`
        CREATE TABLE "api_keys" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "type" api_key_type NOT NULL,
          "key" TEXT NOT NULL,
          "description" TEXT,
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
      `);
      console.log('api_keys table created successfully');
      
      // Insert initial TinyMCE API key
      console.log('Adding initial TinyMCE API key...');
      await pool.query(`
        INSERT INTO "api_keys" ("name", "type", "key", "description")
        VALUES ('TinyMCE Editor', 'tinymce', '7m14cqmqt0orpe024qq0jh600cbltgk2kxavr07f92sihixj', 'API key for the rich text editor');
      `);
      console.log('Initial TinyMCE API key added successfully');
    } else {
      console.log('api_keys table already exists');
    }
    
    console.log('API keys migration completed successfully');
  } catch (error) {
    console.error('Error creating API keys table:', error);
    throw error;
  }
}

// Run the migration
createApiKeysTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });