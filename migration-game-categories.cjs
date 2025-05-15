// Importing pool using CommonJS since migration scripts are run with Node.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createGameCategoriesTable() {
  console.log('Starting game categories migration...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Available' : 'Not available');
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if game_categories table exists
    const checkTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_categories'
      );
    `);
    
    if (!checkTableExists.rows[0].exists) {
      console.log('Creating game_categories table...');
      
      // Create game_categories table
      await client.query(`
        CREATE TABLE game_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          icon TEXT DEFAULT 'ri-gamepad-line',
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);
      
      console.log('Game categories table created successfully');
    } else {
      console.log('Game categories table already exists');
    }
    
    // Check if category_id column exists in games table
    const checkColumnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'games' 
        AND column_name = 'category_id'
      );
    `);
    
    if (!checkColumnExists.rows[0].exists) {
      console.log('Adding category_id column to games table...');
      
      // Add category_id to games table
      await client.query(`
        ALTER TABLE games 
        ADD COLUMN category_id INTEGER REFERENCES game_categories(id);
      `);
      
      console.log('Added category_id column to games table');
    } else {
      console.log('category_id column already exists in games table');
    }
    
    // Add default categories
    console.log('Adding default categories...');
    
    const defaultCategories = [
      { name: 'Action', slug: 'action', description: 'Action games', icon: 'ri-sword-line' },
      { name: 'Adventure', slug: 'adventure', description: 'Adventure games', icon: 'ri-treasure-map-line' },
      { name: 'Arcade', slug: 'arcade', description: 'Arcade games', icon: 'ri-gamepad-line' },
      { name: 'Puzzle', slug: 'puzzle', description: 'Puzzle games', icon: 'ri-puzzle-line' },
      { name: 'Racing', slug: 'racing', description: 'Racing games', icon: 'ri-steering-2-line' },
      { name: 'Sports', slug: 'sports', description: 'Sports games', icon: 'ri-basketball-line' },
      { name: 'Strategy', slug: 'strategy', description: 'Strategy games', icon: 'ri-chess-line' }
    ];
    
    for (const category of defaultCategories) {
      // Check if the category already exists
      const checkCategory = await client.query(`
        SELECT id FROM game_categories WHERE slug = $1
      `, [category.slug]);
      
      if (checkCategory.rows.length === 0) {
        await client.query(`
          INSERT INTO game_categories (name, slug, description, icon)
          VALUES ($1, $2, $3, $4)
        `, [category.name, category.slug, category.description, category.icon]);
        console.log(`Added category: ${category.name}`);
      } else {
        console.log(`Category ${category.name} already exists`);
      }
    }
    
    // Update existing games to match their categories
    console.log('Updating existing games to match their category IDs...');
    
    const games = await client.query('SELECT id, category FROM games');
    
    for (const game of games.rows) {
      if (game.category) {
        // Find the category that most closely matches the game's category text
        const categoryResult = await client.query(`
          SELECT id FROM game_categories
          WHERE LOWER(name) = LOWER($1)
          OR LOWER($1) LIKE '%' || LOWER(name) || '%'
          OR LOWER(name) LIKE '%' || LOWER($1) || '%'
          LIMIT 1
        `, [game.category]);
        
        if (categoryResult.rows.length > 0) {
          const categoryId = categoryResult.rows[0].id;
          await client.query(`
            UPDATE games SET category_id = $1 WHERE id = $2
          `, [categoryId, game.id]);
          console.log(`Updated game ID ${game.id} with category ID ${categoryId}`);
        } else {
          console.log(`Could not find a matching category for game ID ${game.id} with category "${game.category}"`);
        }
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

createGameCategoriesTable()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });