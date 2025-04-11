/**
 * Build Script
 * 
 * This script builds the frontend for production deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Source directory
  srcDir: '.',
  
  // Output directory
  outDir: 'dist',
  
  // Files to copy
  filesToCopy: [
    'css/**/*',
    'images/**/*',
    'fonts/**/*',
    'js/**/*',
    'index.html',
    'examples/**/*'
  ],
  
  // Files to minify
  filesToMinify: [
    'js/**/*.js',
    'css/**/*.css'
  ],
  
  // Environment to set
  environment: 'production'
};

// Create output directory
function createOutputDirectory() {
  console.log('Creating output directory...');
  
  if (fs.existsSync(config.outDir)) {
    fs.rmSync(config.outDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(config.outDir, { recursive: true });
}

// Copy files
function copyFiles() {
  console.log('Copying files...');
  
  config.filesToCopy.forEach(pattern => {
    const files = getFilesFromPattern(pattern);
    
    files.forEach(file => {
      const srcPath = path.join(config.srcDir, file);
      const destPath = path.join(config.outDir, file);
      
      // Create directory if it doesn't exist
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy file
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${file}`);
    });
  });
}

// Minify files
function minifyFiles() {
  console.log('Minifying files...');
  
  // Check if required packages are installed
  try {
    require.resolve('uglify-js');
    require.resolve('clean-css');
  } catch (error) {
    console.log('Installing required packages...');
    execSync('npm install uglify-js clean-css --no-save');
  }
  
  const UglifyJS = require('uglify-js');
  const CleanCSS = require('clean-css');
  
  // Minify JavaScript files
  const jsFiles = config.filesToMinify
    .filter(pattern => pattern.endsWith('.js'))
    .flatMap(pattern => getFilesFromPattern(pattern));
  
  jsFiles.forEach(file => {
    const srcPath = path.join(config.outDir, file);
    const content = fs.readFileSync(srcPath, 'utf8');
    
    try {
      const result = UglifyJS.minify(content);
      
      if (result.error) {
        console.error(`Error minifying ${file}: ${result.error}`);
      } else {
        fs.writeFileSync(srcPath, result.code);
        console.log(`Minified: ${file}`);
      }
    } catch (error) {
      console.error(`Error minifying ${file}: ${error.message}`);
    }
  });
  
  // Minify CSS files
  const cssFiles = config.filesToMinify
    .filter(pattern => pattern.endsWith('.css'))
    .flatMap(pattern => getFilesFromPattern(pattern));
  
  const cleanCSS = new CleanCSS();
  
  cssFiles.forEach(file => {
    const srcPath = path.join(config.outDir, file);
    const content = fs.readFileSync(srcPath, 'utf8');
    
    try {
      const result = cleanCSS.minify(content);
      
      if (result.errors.length > 0) {
        console.error(`Error minifying ${file}: ${result.errors.join(', ')}`);
      } else {
        fs.writeFileSync(srcPath, result.styles);
        console.log(`Minified: ${file}`);
      }
    } catch (error) {
      console.error(`Error minifying ${file}: ${error.message}`);
    }
  });
}

// Set environment
function setEnvironment() {
  console.log(`Setting environment to ${config.environment}...`);
  
  const envFile = path.join(config.outDir, 'js/env.js');
  
  if (fs.existsSync(envFile)) {
    let content = fs.readFileSync(envFile, 'utf8');
    
    // Replace current environment
    content = content.replace(
      /current: ['"].*['"]/,
      `current: '${config.environment}'`
    );
    
    fs.writeFileSync(envFile, content);
    console.log(`Updated environment in ${envFile}`);
  } else {
    console.error(`Environment file not found: ${envFile}`);
  }
}

// Get files from pattern
function getFilesFromPattern(pattern) {
  const baseDir = pattern.split('/')[0];
  const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
  
  return getAllFiles(path.join(config.srcDir, baseDir))
    .filter(file => regex.test(file))
    .map(file => file.replace(config.srcDir + path.sep, '').replace(/\\/g, '/'));
}

// Get all files in directory recursively
function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  });
  
  return files;
}

// Main function
function main() {
  console.log('Building frontend for production...');
  
  createOutputDirectory();
  copyFiles();
  setEnvironment();
  minifyFiles();
  
  console.log('Build completed successfully!');
}

// Run main function
main();
