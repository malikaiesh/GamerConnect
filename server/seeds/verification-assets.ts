import fs from 'fs';
import path from 'path';

/**
 * Seeds verification assets to ensure the custom verification icon is available
 * when the project is cloned to a new workplace.
 */
export async function seedVerificationAssets() {
  console.log('🔗 Seeding verification assets...');
  
  try {
    const sourceIconPath = path.join(process.cwd(), 'attached_assets', 'Halla-play-Verified_1757393495460.png');
    const targetIconPath = path.join(process.cwd(), 'client', 'src', 'assets', 'verification-icon.png');
    
    // Ensure the assets directory exists
    const assetsDir = path.dirname(targetIconPath);
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Copy the verification icon if source exists
    if (fs.existsSync(sourceIconPath)) {
      fs.copyFileSync(sourceIconPath, targetIconPath);
      console.log('✅ Verification icon copied successfully');
    } else {
      // If source doesn't exist, check if target already exists
      if (!fs.existsSync(targetIconPath)) {
        console.log('⚠️  Source verification icon not found, using fallback');
        // Create a placeholder notice file instead of missing icon
        const placeholderMessage = `
# Verification Icon Missing

The custom verification icon (Halla-play-Verified_1757393495460.png) 
was not found in attached_assets folder.

Please:
1. Add your verification icon to client/src/assets/verification-icon.png
2. Restart the application

The system will continue to work with this placeholder until the icon is provided.
`;
        fs.writeFileSync(path.join(assetsDir, 'VERIFICATION_ICON_NEEDED.md'), placeholderMessage);
      } else {
        console.log('ℹ️  Verification icon already exists, skipping');
      }
    }
    
    console.log('🎉 Verification assets seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding verification assets:', error);
  }
}