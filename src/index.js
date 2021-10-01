const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const PORT = 80;
const DOWNLOAD = path.join(__dirname, 'download');

const taskQueue = [];
const processingSet = new Set();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/downloaded', express.static(DOWNLOAD));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/download', (req, res) => {
  if (!req.body.url) {
    res.status(400).send('No url');
    return;
  }

  let url = null;
  try {
    url = new URL(req.body.url);
  } catch {
    res.status(400).send("Wrong url");
    return;
  }

  if (!url.protocol) {
    res.status(400).send('No protocol');
    return;
  }

  if (!url.hostname) {
    res.status(400).send('No host');
    return;
  }

  const download = url.protocol + url.hostname + url.pathname + url.search;
  const filename = path.basename(url.pathname);

  if (processingSet.has(download)) {
    res.status(400).send('Already processing');
    return;
  }

  processingSet.add(download);
  taskQueue.push([download, filename]);

  res.status(200).send([download, filename]);
});

app.get('/status', (req, res) => {
  res.send({
    processingSet: Array.from(processingSet),
    downloaded: fs.readdirSync(DOWNLOAD)
      .map(filename => {
        const stat = fs.statSync(path.join(DOWNLOAD, filename));
        return {
          filename,
          date: stat.mtime
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date))
  });
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
}

setInterval(async () => {
  if (taskQueue.length === 0) return;
  const [url, filename] = taskQueue.pop();

  let index = 1;
  let dest = path.join(DOWNLOAD, filename);
  while (fs.existsSync(dest)) {
    const { name, ext } = path.parse(filename);
    dest = path.join(DOWNLOAD, `${name}_[${index}]${ext}`);
    index += 1;
  }

  await downloadUrl(url, dest);
  processingSet.delete(url);
}, 1000);

app.listen(PORT, () => {
  console.log(`Server opened at port ${PORT}`);
});
