import { createSlug } from './server/utils/slugify.js';
import { pool } from './db/index.js';

async function addSlugColumnToGamesTable() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Adding slug column to games table...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if the slug column already exists
    const checkColumnResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'games' AND column_name = 'slug'
    `);
    
    if (checkColumnResult.rows.length === 0) {
      // Add the slug column
      await client.query(`
        ALTER TABLE games 
        ADD COLUMN slug TEXT
      `);
      
      console.log('Column "slug" added to games table');
      
      // Get all games
      const gamesResult = await client.query('SELECT id, title FROM games');
      const games = gamesResult.rows;
      
      console.log(`Generating slugs for ${games.length} existing games...`);
      
      // Create slugs for each game
      for (const game of games) {
        // Generate a base slug from the title
        let baseSlug = createSlug(game.title);
        let slug = baseSlug;
        let counter = 1;
        
        // Check if slug already exists
        let slugExists = true;
        while (slugExists) {
          const slugCheckResult = await client.query(
            'SELECT id FROM games WHERE slug = $1 AND id != $2',
            [slug, game.id]
          );
          
          if (slugCheckResult.rows.length === 0) {
            slugExists = false;
          } else {
            // Append a number to make the slug unique
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
        }
        
        // Update the game with the unique slug
        await client.query(
          'UPDATE games SET slug = $1 WHERE id = $2',
          [slug, game.id]
        );
      }
      
      // Make the slug column NOT NULL and add a unique constraint
      await client.query(`
        ALTER TABLE games 
        ALTER COLUMN slug SET NOT NULL,
        ADD CONSTRAINT games_slug_unique UNIQUE (slug)
      `);
      
      console.log('Slugs generated and constraints added');
    } else {
      console.log('Column "slug" already exists in games table');
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

// Run the migration
addSlugColumnToGamesTable()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });