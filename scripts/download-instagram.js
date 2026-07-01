const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const dataPath = path.join(__dirname, '..', 'src', '_data', 'instagram.json');
const outDir = path.join(__dirname, '..', 'src', 'assets', 'images', 'instagram');

if (!fs.existsSync(dataPath)) {
  console.error('instagram.json not found at', dataPath);
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const posts = data.posts || [];

function download(url, outPath) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return resolve(download(res.headers.location, outPath));
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode));
      }
      const file = fs.createWriteStream(outPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    });
    req.on('error', (err) => reject(err));
  });
}

(async () => {
  for (const post of posts) {
    const id = post.id || post.timestamp || Math.random().toString(36).slice(2,10);
    const candidates = [];
    if (post.sizes) {
      if (post.sizes.large) candidates.push(post.sizes.large);
      if (post.sizes.medium) candidates.push(post.sizes.medium);
      if (post.sizes.small) candidates.push(post.sizes.small);
    }
    if (post.mediaUrl) candidates.push(post.mediaUrl);
    // try each candidate until one downloads
    let downloaded = false;
    for (const url of candidates) {
      const outPath = path.join(outDir, `${id}.jpg`);
      if (fs.existsSync(outPath)) { downloaded = true; break; }
      try {
        process.stdout.write(`Downloading ${url} -> ${outPath}... `);
        await download(url, outPath);
        console.log('OK');
        downloaded = true;
        break;
      } catch (e) {
        console.log('FAILED:', e.message);
      }
    }
    if (!downloaded) console.log(`Could not download images for post ${id}`);
  }
})();
