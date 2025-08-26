import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import { config } from 'dotenv';

config({ path: '.env.local' });
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updateImagePath() {
  try {
    await pool.query(
      "UPDATE hero_images SET image_path = $1 WHERE id = 1",
      ['/uploads/hero/car_1756185031476.png']
    );
    console.log('✓ Hero image path updated successfully');
  } catch (error) {
    console.error('Failed to update image path:', error);
  } finally {
    await pool.end();
  }
}

updateImagePath();