import { seedSignupOptions } from './signup-options';

// Main seeding function that runs all seeds
export async function runSeeds() {
  console.log('🌱 Running database seeds...');
  
  try {
    await seedSignupOptions();
    console.log('✅ All seeds completed successfully');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    throw error;
  }
}