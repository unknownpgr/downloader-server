const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const logger = require('./config/winston');
const crypto = require('crypto');

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
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });

    req.on('error', (err) => {
      fs.unlink(dest);
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(dest);
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

  let index = 1;
  let dest = path.join(DIR_DOWNLOAD, filename);
  while (fs.existsSync(dest)) {
    const { name, ext } = path.parse(filename);
    dest = path.join(DIR_DOWNLOAD, `${name}_[${index}]${ext}`);
    index += 1;
  }

  logger.info(`Save url ${url} to file ${dest}`);
  await downloadUrl(url, dest);
  const fileHash = await checksumFile(dest);
  fs.renameSync(dest, path.join(DIR_DOWNLOAD, fileHash));

  logger.info(`Download finished : ${url}`);
  processingSet.delete(url);
}, 1000);

app.listen(PORT, () => {
  console.log(`Server opened at port ${PORT}`);
});
