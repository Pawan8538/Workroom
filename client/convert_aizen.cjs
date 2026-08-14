const sharp = require('sharp');
const path = require('path');
const dir = path.join(__dirname, 'public', 'Evolution_collection');
sharp(path.join(dir, 'aizen.png'))
  .webp({ quality: 95 })
  .toFile(path.join(dir, 'aizen.webp'))
  .then(() => console.log('Fixed Aizen!'))
  .catch(err => console.error(err));
