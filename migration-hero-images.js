import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool });

async function createHeroImagesTable() {
  try {
    console.log('Creating hero_images table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS hero_images (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_path TEXT NOT NULL,
        link_url TEXT,
        link_text TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        sort_order INTEGER DEFAULT 0 NOT NULL,
        display_duration INTEGER DEFAULT 5000 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await pool.query(createTableSQL);
    console.log('✓ hero_images table created successfully');

    // Insert the first hero image with the car image
    console.log('Adding initial hero image...');
    
    const insertImageSQL = `
      INSERT INTO hero_images (
        title, 
        description, 
        image_path, 
        link_url, 
        link_text, 
        is_active, 
        sort_order, 
        display_duration
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await pool.query(insertImageSQL, [
      'High-Performance Gaming Cars',
      'Experience the thrill of racing with our latest collection of high-performance gaming cars. Featuring cutting-edge design and unmatched speed.',
      '/attached_assets/car_1756185031476.png',
      '/games/category/racing',
      'Explore Racing Games',
      true, // is_active
      0, // sort_order
      6000 // display_duration (6 seconds)
    ]);

    console.log('✓ Initial hero image added successfully');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createHeroImagesTable().catch(console.error);