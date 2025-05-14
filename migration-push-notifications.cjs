require('dotenv').config();
const { Pool } = require('pg');

// Create a pool to connect to PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createPushTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if tables already exist to avoid errors
    const pushNotificationsExists = await tableExists('push_notifications');
    const pushSubscribersExists = await tableExists('push_subscribers');
    const pushCampaignsExists = await tableExists('push_campaigns');
    const pushResponsesExists = await tableExists('push_responses');
    
    // Create push_notifications table if it doesn't exist
    if (!pushNotificationsExists) {
      console.log('Creating push_notifications table...');
      await client.query(`
        CREATE TABLE push_notifications (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          image TEXT,
          link TEXT,
          type TEXT NOT NULL DEFAULT 'toast',
          active BOOLEAN NOT NULL DEFAULT false,
          click_count INTEGER NOT NULL DEFAULT 0,
          impression_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('push_notifications table created successfully');
    } else {
      console.log('push_notifications table already exists, skipping...');
    }
    
    // Create push_subscribers table if it doesn't exist
    if (!pushSubscribersExists) {
      console.log('Creating push_subscribers table...');
      await client.query(`
        CREATE TABLE push_subscribers (
          id SERIAL PRIMARY KEY,
          endpoint TEXT NOT NULL UNIQUE,
          p256dh TEXT NOT NULL,
          auth TEXT NOT NULL,
          user_agent TEXT,
          browser TEXT,
          os TEXT,
          device_type TEXT,
          country TEXT,
          region TEXT,
          city TEXT,
          last_sent TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'active',
          web_push_enabled BOOLEAN NOT NULL DEFAULT true,
          notification_permission TEXT DEFAULT 'default',
          preferred_types TEXT[] DEFAULT ARRAY['toast', 'web-push'],
          frequency_limit INTEGER DEFAULT 5,
          opt_in_date TIMESTAMP DEFAULT NOW(),
          last_interacted TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('push_subscribers table created successfully');
    } else {
      console.log('push_subscribers table already exists, skipping...');
    }
    
    // Create push_campaigns table if it doesn't exist
    if (!pushCampaignsExists) {
      console.log('Creating push_campaigns table...');
      await client.query(`
        CREATE TABLE push_campaigns (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          image TEXT,
          link TEXT,
          action_yes TEXT,
          action_no TEXT,
          notification_type TEXT NOT NULL DEFAULT 'toast',
          is_web_push BOOLEAN NOT NULL DEFAULT false,
          require_interaction BOOLEAN DEFAULT false,
          badge TEXT,
          icon TEXT,
          vibrate TEXT,
          is_survey BOOLEAN DEFAULT false,
          target_all BOOLEAN DEFAULT true,
          target_filters JSONB DEFAULT '{}',
          sent_count INTEGER DEFAULT 0,
          delivered_count INTEGER DEFAULT 0,
          click_count INTEGER DEFAULT 0,
          schedule_date TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'draft',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('push_campaigns table created successfully');
    } else {
      console.log('push_campaigns table already exists, skipping...');
    }
    
    // Create push_responses table if it doesn't exist
    if (!pushResponsesExists) {
      console.log('Creating push_responses table...');
      await client.query(`
        CREATE TABLE push_responses (
          id SERIAL PRIMARY KEY,
          campaign_id INTEGER NOT NULL REFERENCES push_campaigns(id),
          subscriber_id INTEGER NOT NULL REFERENCES push_subscribers(id),
          response TEXT,
          clicked BOOLEAN DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('push_responses table created successfully');
    } else {
      console.log('push_responses table already exists, skipping...');
    }
    
    await client.query('COMMIT');
    console.log('Push notification tables migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during push notification tables migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function tableExists(tableName) {
  const { rows } = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )
  `, [tableName]);
  
  return rows[0].exists;
}

// Run the migration
createPushTables()
  .then(() => {
    console.log('Push notification tables migration completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Push notification tables migration failed:', error);
    process.exit(1);
  });