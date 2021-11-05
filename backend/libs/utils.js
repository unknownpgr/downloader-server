const fs = require('fs');
const crypto = require('crypto');

function getFileHash(path, hashName = 'sha1') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(hashName);
    const stream = fs.createReadStream(path);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

exports.getFileHash = getFileHash;
