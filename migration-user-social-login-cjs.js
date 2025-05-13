const { db, pool } = require('./db');
const { sql } = require('drizzle-orm');

async function updateUsersTable() {
  console.log('Starting migration: Updating users table for social login and profile data...');
  try {
    // Create new enums
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE user_account_type AS ENUM ('local', 'google', 'facebook');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE user_status AS ENUM ('active', 'blocked');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Check if email column exists
    const emailColumnExists = await columnExists('users', 'email');
    if (!emailColumnExists) {
      console.log('Adding email column to users table...');
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
      `);
    }

    // Update password to be nullable
    const passwordNullable = await columnIsNullable('users', 'password');
    if (!passwordNullable) {
      console.log('Updating password column to be nullable...');
      await db.execute(sql`
        ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
      `);
    }

    // Check and add new columns
    const columnsToAdd = [
      { name: 'profile_picture', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' },
      { name: 'country', type: 'TEXT' },
      { name: 'account_type', type: 'user_account_type', default: "'local'" },
      { name: 'social_id', type: 'TEXT' },
      { name: 'status', type: 'user_status', default: "'active'" },
      { name: 'last_login', type: 'TIMESTAMP' },
      { name: 'location', type: 'JSONB' },
      { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()' }
    ];

    for (const column of columnsToAdd) {
      const exists = await columnExists('users', column.name);
      if (!exists) {
        console.log(`Adding ${column.name} column to users table...`);
        let query = `ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`;
        if (column.default) {
          query += ` DEFAULT ${column.default}`;
        }
        await db.execute(sql([query]));
      }
    }

    // Update existing users to have the new account_type value
    console.log('Updating existing users to have account_type = local...');
    await db.execute(sql`
      UPDATE users 
      SET account_type = 'local' 
      WHERE account_type IS NULL;
    `);

    // Update existing users to have the new status value
    console.log('Updating existing users to have status = active...');
    await db.execute(sql`
      UPDATE users 
      SET status = 'active' 
      WHERE status IS NULL;
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

async function tableExists(tableName) {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ${tableName}
    );
  `);
  return result[0].exists;
}

async function columnExists(tableName, columnName) {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = ${tableName} 
      AND column_name = ${columnName}
    );
  `);
  return result[0].exists;
}

async function columnIsNullable(tableName, columnName) {
  const result = await db.execute(sql`
    SELECT is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = ${tableName} 
    AND column_name = ${columnName}
  `);
  return result[0]?.is_nullable === 'YES';
}

updateUsersTable();