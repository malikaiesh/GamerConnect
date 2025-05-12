import { createSlug } from './server/utils/slugify.js';
import { db } from './db/index.js';

async function addSlugColumnToGamesTable() {
  try {
    console.log('Starting migration: Adding slug column to games table...');
    
    // Use direct SQL via the db.execute method
    
    // Check if the slug column already exists
    const checkColumnResult = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'games' AND column_name = 'slug'
    `);
    
    if (checkColumnResult.length === 0) {
      // Add the slug column
      await db.execute(`
        ALTER TABLE games 
        ADD COLUMN slug TEXT
      `);
      
      console.log('Column "slug" added to games table');
      
      // Get all games
      const games = await db.execute('SELECT id, title FROM games');
      
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
          const slugCheckResult = await db.execute(
            'SELECT id FROM games WHERE slug = $1 AND id != $2',
            [slug, game.id]
          );
          
          if (slugCheckResult.length === 0) {
            slugExists = false;
          } else {
            // Append a number to make the slug unique
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
        }
        
        // Update the game with the unique slug
        await db.execute(
          'UPDATE games SET slug = $1 WHERE id = $2',
          [slug, game.id]
        );
      }
      
      // Make the slug column NOT NULL and add a unique constraint
      await db.execute(`
        ALTER TABLE games 
        ALTER COLUMN slug SET NOT NULL,
        ADD CONSTRAINT games_slug_unique UNIQUE (slug)
      `);
      
      console.log('Slugs generated and constraints added');
    } else {
      console.log('Column "slug" already exists in games table');
    }
    
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
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