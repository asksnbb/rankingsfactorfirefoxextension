import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');        // Final extension output
const VITE_DIR = path.resolve(__dirname, '../dist_assets'); // Vite build output folder
const PUBLIC_DIR = path.resolve(__dirname, '../public');    // Your public/static assets source
const ROOT_DIR = path.resolve(__dirname, '../'); 

// Clean dist folder
fs.removeSync(DIST_DIR);
fs.ensureDirSync(DIST_DIR);

console.log('🔨 Building Chrome Extension...');

// 1. Copy manifest.json
fs.copySync(path.join(PUBLIC_DIR, 'manifest.json'), path.join(DIST_DIR, 'manifest.json'));
console.log('✅ Copied manifest.json');

// 1. Copy logo.svg
fs.copySync(path.join(PUBLIC_DIR, 'logo.svg'), path.join(VITE_DIR, 'logo.svg'));
console.log('✅ Copied logo.svg');

// 2. Copy background scripts, analyzer, and UI manager
['background.js', 'content-script.js', 'analyzer.js'].forEach(file => {
  let src = path.join(PUBLIC_DIR, file);
  if (fs.existsSync(src)) {
    fs.copySync(src, path.join(DIST_DIR, file));
    console.log(`✅ Copied ${file}`);
  }
});

// 3. Copy popup HTML
const popupSrc = path.join(PUBLIC_DIR, 'popup.html');
if (fs.existsSync(popupSrc)) {
  fs.copySync(popupSrc, path.join(DIST_DIR, 'popup.html'));
  console.log('✅ Copied popup.html');
}

// 4. Copy Vite build static assets (JS/CSS bundles)
if (!fs.existsSync(VITE_DIR)) {
  console.error('❌ Vite build output not found in dist_assets/. Run `vite build` first.');
  process.exit(1);
}

// copy dist.crx and dist.pem file to dist
const developerFiles = ['dist.crx'];
developerFiles.forEach(file => {
  const src = path.join(ROOT_DIR, file);
  const dest = path.join(DIST_DIR, file);
  if (fs.existsSync(src)) {
    fs.copySync(src, dest);
    console.log(`✅ Copied ${file} to dist folder`);
  }
});


// Create assets directory
const assetsDir = path.join(DIST_DIR, 'assets');
fs.ensureDirSync(assetsDir);

// Copy only the necessary files from Vite build to assets
const viteFiles = ['index.js', 'index.css','index.html','client.js','main.bundle.js','main.css', "logo.svg"];
viteFiles.forEach(file => {
  const src = path.join(VITE_DIR, file);
  const dest = path.join(assetsDir, file);
  if (fs.existsSync(src)) {
    fs.copySync(src, dest);
    console.log(`✅ Copied ${file} to assets`);
  }
});

// 5. Copy icon files from dist_assets to dist
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
  const iconSrc = path.join(VITE_DIR, `icon${size}.png`);
  const iconDest = path.join(DIST_DIR, `icon${size}.png`);
  if (fs.existsSync(iconSrc)) {
    fs.copySync(iconSrc, iconDest);
    console.log(`✅ Copied icon${size}.png`);
  } else {
    console.log(`⚠️  icon${size}.png not found in dist_assets`);
  }
});

console.log('\n🎉 Extension build complete!');
console.log('📁 Extension files are in /dist');
console.log('📋 To install in Chrome:');
console.log('   1. Open chrome://extensions/');
console.log('   2. Enable "Developer mode"');
console.log('   3. Click "Load unpacked"');
console.log('   4. Select the /dist folder');
