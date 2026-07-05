const { Jimp } = require('jimp');

async function processImage(file) {
  try {
    const img = await Jimp.read(file);
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Calculate brightness
      const brightness = (r + g + b) / 3;
      
      if (brightness < 40) {
        // Feathering alpha for anti-aliasing
        this.bitmap.data[idx + 3] = Math.max(0, brightness * (255/40)); 
      }
    });
    await img.write(file);
    console.log('Processed', file);
  } catch (err) {
    console.error(err);
  }
}

Promise.all([
  processImage('./public/icons/drone.png'),
  processImage('./public/icons/missile.png'),
  processImage('./public/icons/ballistic.png'),
  processImage('./public/icons/kab.png'),
  processImage('./public/icons/aircraft.png')
]).then(() => console.log('Done'));
