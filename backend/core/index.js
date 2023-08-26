const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const crypto = require("crypto");

const DIR_DOWNLOAD = path.join(__dirname, "download");
const DIR_PUBLIC = path.join(__dirname, "public");

function getDownloadedFileName(filename) {
  let index = 1;
  let dest = path.join(DIR_DOWNLOAD, filename);
  while (fs.existsSync(dest)) {
    const { name, ext } = path.parse(filename);
    dest = path.join(DIR_DOWNLOAD, `${name}_[${index}]${ext}`);
    index += 1;
  }
  return dest;
}

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    const { protocol } = new URL(url);
    const downloadModule = { "http:": http, "https:": https }[protocol];
    if (!downloadModule) reject();

    const file = fs.createWriteStream(dest);
    const req = downloadModule.get(url, (res) => {
      const contentType = res.headers["content-type"];
      res.pipe(file);
      file.on("finish", () =>
        file.close(() => resolve({ url, dest, contentType }))
      );
    });

    req.on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });

    file.on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function getFileHash(path, hashName = "sha1") {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(hashName);
    const stream = fs.createReadStream(path);
    stream.on("error", (err) => reject(err));
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function parseURL(url) {
  if (!url) throw new Error("No url");
  let urlObj = null;
  try {
    urlObj = new URL(url);
  } catch {
    throw new Error("Wrong url");
  }
  if (!urlObj.protocol) throw new Error("No protocol");
  if (!urlObj.hostname) throw new Error("No host");
  const parsedUrl =
    urlObj.protocol + urlObj.hostname + urlObj.pathname + urlObj.search;
  const filename = path.basename(urlObj.pathname);
  return [parsedUrl, filename];
}

class Downloader {
  queue = [];
  current = null;

  constructor() {
    setInterval(() => {
      this.processQueue();
    }, 1000);
  }

  add(url) {
    const [download, filename] = parseURL(url);
    this.queue.push([download, filename]);
    return [download, filename];
  }

  async processQueue() {
    if (this.queue.length === 0) return;
    const [url, filename] = this.queue.shift();
    this.current = { url, filename };
    try {
      const dest = getDownloadedFileName(filename);
      const { contentType } = await downloadUrl(url, dest);
      const fileHash = await getFileHash(dest);
      const ext = mime.extension(contentType);
      fs.renameSync(dest, path.join(DIR_DOWNLOAD, `${fileHash}.${ext}`));
    } catch (err) {
      console.log(err);
    } finally {
      this.current = null;
    }
  }

  getQueue() {
    return this.queue;
  }

  getCurrent() {
    return this.current;
  }
}

module.exports = Downloader;
