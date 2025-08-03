import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Simulate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const folderToZip = path.join(__dirname, '../dist');
const outputZipPath = path.join(__dirname, '../extension.zip');

// ✅ Delete existing ZIP if it exists
if (fs.existsSync(outputZipPath)) {
  fs.unlinkSync(outputZipPath);
  console.log('🗑️  Deleted existing extension.zip');
}

const output = fs.createWriteStream(outputZipPath);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  console.log(`✅ ZIP created: ${archive.pointer()} bytes`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(folderToZip, false);
archive.finalize();
