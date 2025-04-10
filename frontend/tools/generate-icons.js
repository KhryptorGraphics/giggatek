/**
 * GigGatek Icon Generator
 * 
 * This script generates all the necessary icons for the PWA from a source image.
 * It requires the 'sharp' image processing library.
 * 
 * Usage:
 * 1. Install sharp: npm install sharp
 * 2. Place a high-resolution source image (at least 512x512) in the img folder
 * 3. Run: node generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_IMAGE = path.join(__dirname, '../img/logo-source.png');
const OUTPUT_DIR = path.join(__dirname, '../img/icons');
const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
const BADGE_SIZE = 72;

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate standard icons
async function generateIcons() {
  try {
    // Check if source image exists
    if (!fs.existsSync(SOURCE_IMAGE)) {
      console.error(`Source image not found: ${SOURCE_IMAGE}`);
      console.error('Please place a high-resolution image (at least 512x512) at this location.');
      return;
    }

    // Generate icons for each size
    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
      
      await sharp(SOURCE_IMAGE)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated: ${outputPath}`);
    }

    // Generate badge icon (used for notifications)
    const badgeOutputPath = path.join(OUTPUT_DIR, `badge-${BADGE_SIZE}.png`);
    
    await sharp(SOURCE_IMAGE)
      .resize(BADGE_SIZE, BADGE_SIZE)
      .png()
      .toFile(badgeOutputPath);
    
    console.log(`Generated: ${badgeOutputPath}`);

    // Generate feature icons for shortcuts
    const featureIcons = [
      { name: 'products', size: 192 },
      { name: 'dashboard', size: 192 },
      { name: 'cart', size: 192 }
    ];

    for (const icon of featureIcons) {
      const featureSourcePath = path.join(__dirname, `../img/${icon.name}-source.png`);
      
      // Check if feature source image exists
      if (fs.existsSync(featureSourcePath)) {
        const featureOutputPath = path.join(OUTPUT_DIR, `${icon.name}-${icon.size}.png`);
        
        await sharp(featureSourcePath)
          .resize(icon.size, icon.size)
          .png()
          .toFile(featureOutputPath);
        
        console.log(`Generated: ${featureOutputPath}`);
      } else {
        console.warn(`Feature source image not found: ${featureSourcePath}`);
      }
    }

    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Run the icon generation
generateIcons();
