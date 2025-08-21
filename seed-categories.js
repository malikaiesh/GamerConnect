import { neon } from '@neondatabase/serverless';

async function seedCategories() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Sample categories to insert
  const categories = [
    {
      name: 'Action',
      slug: 'action',
      description: 'Fast-paced games with exciting combat and adventure',
      icon: 'ri-sword-line',
      display_order: 1,
      is_active: true
    },
    {
      name: 'Puzzle',
      slug: 'puzzle', 
      description: 'Mind-bending challenges and brain teasers',
      icon: 'ri-puzzle-line',
      display_order: 2,
      is_active: true
    },
    {
      name: 'Strategy',
      slug: 'strategy',
      description: 'Plan your moves and outsmart your opponents',
      icon: 'ri-chess-line', 
      display_order: 3,
      is_active: true
    },
    {
      name: 'Adventure',
      slug: 'adventure',
      description: 'Explore vast worlds and uncover mysteries',
      icon: 'ri-compass-line',
      display_order: 4,
      is_active: true
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Athletic competitions and sports simulations',
      icon: 'ri-football-line',
      display_order: 5,
      is_active: true
    }
  ];

  try {
    console.log('Starting to seed categories...');
    
    for (const category of categories) {
      // Check if category already exists
      const existing = await sql`
        SELECT id FROM game_categories WHERE slug = ${category.slug}
      `;
      
      if (existing.length === 0) {
        await sql`
          INSERT INTO game_categories (name, slug, description, icon, display_order, is_active, created_at, updated_at)
          VALUES (${category.name}, ${category.slug}, ${category.description}, ${category.icon}, ${category.display_order}, ${category.is_active}, NOW(), NOW())
        `;
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }
    
    console.log('Categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}

seedCategories();