import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

async function createPasswordResetTokensTable() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Check if token_type enum exists
    const typeResult = await client.query(`SELECT EXISTS (
      SELECT FROM pg_type WHERE typname = 'token_type'
    );`);
    
    if (!typeResult.rows[0].exists) {
      console.log('Creating token_type enum type...');
      await client.query(`CREATE TYPE token_type AS ENUM ('password_reset', 'email_verification', 'admin_reset');`);
    }

    // Check if password_reset_tokens table already exists
    const tableResult = await client.query(`SELECT EXISTS (
      SELECT FROM information_schema.tables WHERE table_name = 'password_reset_tokens'
    );`);

    if (!tableResult.rows[0].exists) {
      console.log('Creating password_reset_tokens table...');
      await client.query(`
        CREATE TABLE password_reset_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token TEXT NOT NULL UNIQUE,
          token_hash TEXT NOT NULL,
          type token_type DEFAULT 'password_reset' NOT NULL,
          used_at TIMESTAMP,
          ip_address TEXT,
          user_agent TEXT,
          is_admin BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          expires_at TIMESTAMP NOT NULL
        );
      `);
      
      // Create index on user_id for faster lookup
      await client.query(`CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`);
      // Create index on token for faster lookup during validation
      await client.query(`CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);`);
      // Create index on expires_at for cleanup jobs
      await client.query(`CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);`);
      
      console.log('Password reset tokens table created successfully');
    } else {
      console.log('Password reset tokens table already exists, skipping creation');
    }

  } catch (error) {
    console.error('Error creating password_reset_tokens table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
createPasswordResetTokensTable()
  .then(() => console.log('Migration completed successfully'))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });