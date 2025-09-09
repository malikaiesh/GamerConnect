const dotenv = require('dotenv');
dotenv.config();
const { Pool } = require('pg');

async function addSendgridApiKeyType() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Checking if sendgrid type exists in api_key_type enum...');
    const enumValuesQuery = `
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'api_key_type';
    `;
    
    const { rows } = await pool.query(enumValuesQuery);
    const existingValues = rows.map(row => row.enumlabel);
    
    if (!existingValues.includes('sendgrid')) {
      console.log('Adding sendgrid type to api_key_type enum...');
      await pool.query(`
        ALTER TYPE api_key_type ADD VALUE IF NOT EXISTS 'sendgrid';
      `);
      console.log('sendgrid type added successfully');
    } else {
      console.log('sendgrid type already exists in api_key_type enum');
    }

    // Add or update SendGrid API key
    const sendgridKey = process.env.SENDGRID_API_KEY;
    
    if (!sendgridKey) {
      console.log('SENDGRID_API_KEY environment variable not set, skipping API key migration');
      await pool.end();
      return;
    }
    
    // Check if a SendGrid API key already exists
    const existingKeyQuery = `
      SELECT id FROM api_keys WHERE type = 'sendgrid';
    `;
    const existingKeyResult = await pool.query(existingKeyQuery);
    
    if (existingKeyResult.rows.length > 0) {
      // Update existing key
      const keyId = existingKeyResult.rows[0].id;
      console.log(`Updating existing SendGrid API key with ID ${keyId}...`);
      
      await pool.query(`
        UPDATE api_keys
        SET key = $1, updated_at = NOW()
        WHERE id = $2;
      `, [sendgridKey, keyId]);
      
      console.log('SendGrid API key updated successfully');
    } else {
      // Insert new key
      console.log('Adding SendGrid API key...');
      
      await pool.query(`
        INSERT INTO api_keys (name, type, key, description, is_active, created_at, updated_at)
        VALUES ('SendGrid Email Service', 'sendgrid', $1, 'API key for sending transactional emails', true, NOW(), NOW());
      `, [sendgridKey]);
      
      console.log('SendGrid API key added successfully');
    }
    
    console.log('Migration completed successfully');
    await pool.end();
  } catch (error) {
    console.error('Error in migration:', error);
    await pool.end();
    throw error;
  }
}

// Run the migration
addSendgridApiKeyType()
  .then(() => {
    console.log('All migration tasks completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });