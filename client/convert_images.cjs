const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'Evolution_collection');
const files = fs.readdirSync(dir);

async function convert() {
  let count = 0;
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const inputPath = path.join(dir, file);
      const filename = path.parse(file).name;
      const outputPath = path.join(dir, `${filename}.webp`);
      
      try {
        await sharp(inputPath)
          .resize({ width: 1024, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outputPath);
        console.log(`Converted ${file} to ${filename}.webp`);
        count++;
      } catch (err) {
        console.error(`Error converting ${file}:`, err);
      }
    }
  }
  console.log(`Finished converting ${count} images.`);
}
convert();
