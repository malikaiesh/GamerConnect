import pg from 'pg';
const { Pool } = pg;

// Create a connection to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createSitemapsTable() {
  try {
    // Check if the sitemap_type enum type exists
    const enumExistsQuery = `
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'sitemap_type'
      );
    `;
    const enumExists = await pool.query(enumExistsQuery);
    
    // Create the enum type if it doesn't exist
    if (!enumExists.rows[0].exists) {
      console.log('Creating sitemap_type enum...');
      await pool.query(`
        CREATE TYPE sitemap_type AS ENUM (
          'games', 'blog', 'pages', 'main'
        );
      `);
      console.log('sitemap_type enum created successfully');
    } else {
      console.log('sitemap_type enum already exists');
    }

    // Check if the sitemaps table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sitemaps'
      );
    `;
    const tableExists = await pool.query(tableExistsQuery);
    
    // Create the table if it doesn't exist
    if (!tableExists.rows[0].exists) {
      console.log('Creating sitemaps table...');
      await pool.query(`
        CREATE TABLE "sitemaps" (
          "id" SERIAL PRIMARY KEY,
          "type" sitemap_type NOT NULL,
          "last_generated" TIMESTAMP NOT NULL DEFAULT NOW(),
          "url" TEXT NOT NULL,
          "item_count" INTEGER NOT NULL DEFAULT 0,
          "is_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('sitemaps table created successfully');
      
      // Insert default sitemaps
      const defaultSitemaps = [
        { type: 'main', url: '/sitemap.xml', name: 'Main Sitemap' },
        { type: 'games', url: '/sitemap-games.xml', name: 'Games Sitemap' },
        { type: 'blog', url: '/sitemap-blog.xml', name: 'Blog Sitemap' },
        { type: 'pages', url: '/sitemap-pages.xml', name: 'Pages Sitemap' }
      ];
      
      for (const sitemap of defaultSitemaps) {
        await pool.query(`
          INSERT INTO sitemaps (type, url) 
          VALUES ($1, $2)
        `, [sitemap.type, sitemap.url]);
        console.log(`Created default sitemap: ${sitemap.type}`);
      }
      
    } else {
      console.log('sitemaps table already exists');
    }
    
    console.log('Sitemaps migration completed successfully.');
  } catch (error) {
    console.error('Error during sitemaps migration:', error);
  } finally {
    await pool.end();
  }
}

createSitemapsTable();