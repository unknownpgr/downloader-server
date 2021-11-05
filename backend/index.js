const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const logger = require('./config/winston');
const crypto = require('crypto');
const mime = require('mime-types');

// Constants
const DIR_DOWNLOAD = path.join(__dirname, 'download');
const DIR_PUBLIC = path.join(__dirname, 'public');
const PORT = 80;

// Variables
const taskQueue = [];
const processingSet = new Set();

// Router
const app = express();

app.use(morgan('common'));

app.use(express.static(DIR_PUBLIC));
app.use('/downloaded', express.static(DIR_DOWNLOAD));

app.use('/api/v1', require('./api/v1')(taskQueue, processingSet, DIR_DOWNLOAD));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {

    const { protocol } = new URL(url);
    const downloadModule = { 'http:': http, 'https:': https }[protocol];
    if (!downloadModule) reject();

    const file = fs.createWriteStream(dest);
    const req = downloadModule.get(url, (res) => {
      const contentType = res.headers['content-type'];
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve({ url, dest, contentType })));
    });

    req.on('error', (err) => {
      fs.unlink(dest, (err) => err && reject(err));
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(dest, (err) => err && reject(err));
      return reject(err);
    });
  });
};

function checksumFile(path, hashName = 'sha1') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(hashName);
    const stream = fs.createReadStream(path);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

// Worker
setInterval(async () => {
  if (taskQueue.length === 0) return;
  const [url, filename] = taskQueue.pop();

  try {
    let index = 1;
    let dest = path.join(DIR_DOWNLOAD, filename);
    while (fs.existsSync(dest)) {
      const { name, ext } = path.parse(filename);
      dest = path.join(DIR_DOWNLOAD, `${name}_[${index}]${ext}`);
      index += 1;
    }

    logger.info(`Save url ${url} to file ${dest}`);
    const { contentType } = await downloadUrl(url, dest);
    const fileHash = await checksumFile(dest);
    const ext = mime.extension(contentType);
    fs.renameSync(dest, path.join(DIR_DOWNLOAD, `${fileHash}.${ext}`));

    logger.info(`Download finished : ${url}`);
  } catch (e) {
    console.error(e);
  }

  processingSet.delete(url);
}, 1000);

app.listen(PORT, () => {
  console.log(`Server opened at port ${PORT}`);
});
