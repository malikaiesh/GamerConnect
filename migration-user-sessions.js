import { db, pool } from './db/index.js';
import { sql } from 'drizzle-orm';

async function createUserSessionsTable() {
  try {
    console.log('Starting user sessions table migration...');

    // Check if session_status type exists
    const typeResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_type WHERE typname = 'session_status'
      );
    `);
    
    if (!typeResult.rows[0]?.exists) {
      console.log('Creating session_status enum type...');
      await db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE session_status AS ENUM ('active', 'expired', 'revoked');
          EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
    }

    // Check if user_sessions table already exists
    const tableResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'user_sessions'
      );
    `);
    
    if (!tableResult.rows[0]?.exists) {
      console.log('Creating user_sessions table...');
      await db.execute(sql`
        CREATE TABLE user_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          device_info JSONB,
          last_activity TIMESTAMP DEFAULT NOW() NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          status session_status DEFAULT 'active' NOT NULL,
          location JSONB,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      
      // Create index on user_id for faster lookup
      await db.execute(sql`CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);`);
      // Create index on token for faster lookup during validation
      await db.execute(sql`CREATE INDEX idx_user_sessions_token ON user_sessions(token);`);
      // Create index on status + expires_at for cleanup jobs
      await db.execute(sql`CREATE INDEX idx_user_sessions_status_expires ON user_sessions(status, expires_at);`);
      
      console.log('User sessions table created successfully');
    } else {
      console.log('User sessions table already exists, skipping creation');
    }

  } catch (error) {
    console.error('Error creating user_sessions table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createUserSessionsTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });