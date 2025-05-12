import { pool } from './db/index.js';

async function createStaticPagesTable() {
  try {
    // Create page type enum if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'page_type') THEN
          CREATE TYPE page_type AS ENUM ('about', 'contact', 'privacy', 'terms', 'cookie-policy', 'faq', 'custom');
        END IF;
      END
      $$;
    `);

    // Create content status enum if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
          CREATE TYPE content_status AS ENUM ('active', 'inactive');
        END IF;
      END
      $$;
    `);

    // Create the static_pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS static_pages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        page_type page_type NOT NULL DEFAULT 'custom',
        status content_status NOT NULL DEFAULT 'active',
        meta_title TEXT,
        meta_description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Static pages table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating static pages table:', error);
    process.exit(1);
  }
}

createStaticPagesTable();