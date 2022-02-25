const express = require("express");
const path = require("path");
const fs = require("fs");
const logger = require("../../config/winston");
const FileType = require("file-type");
const { getFileHash } = require("../../libs/utils");

function error(res, message, code = 400) {
  logger.error(message);
  res.status(code).send("No url");
}

function v1(taskQueue, processingSet, saveDir) {
  const app = express.Router();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.post("/download", (req, res) => {
    logger.info(`Download : ${req.body.url}`);

    if (!req.body.url) {
      error(res, "No url");
      return;
    }

    let url = null;
    try {
      url = new URL(req.body.url);
    } catch {
      error(res, "Wrong url");
      return;
    }

    if (!url.protocol) {
      error(res, "No protocol");
      return;
    }

    if (!url.hostname) {
      error(res, "No host");
      return;
    }

    const download = url.protocol + url.hostname + url.pathname + url.search;
    const filename = path.basename(url.pathname);

    if (processingSet.has(download)) {
      error(res, "Already processing");
      return;
    }

    processingSet.add(download);
    taskQueue.push([download, filename]);
    logger.info("URL added to task queue");

    res.status(200).send([download, filename]);
  });

  app.get("/status", (req, res) => {
    let files = fs
      .readdirSync(saveDir)
      .map((filename) => {
        const stat = fs.statSync(path.join(saveDir, filename));
        return {
          filename,
          date: stat.mtime,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let { offset, limit } = req.query;
    offset = +offset;
    limit = +limit;
    const start = offset ? Math.min(offset, files.length) : 0;
    const end = limit
      ? Math.min(start + limit, files.length)
      : Math.min(start + 10, files.length);

    const downloaded = files.slice(start, end);

    res.send({
      processing: Array.from(processingSet),
      downloaded,
      totalCount: files.length,
    });
  });

  app.get("/update", async (req, res) => {
    const shaRegex = /\b([a-f0-9]{40})\..+\b/;
    const update = fs
      .readdirSync(saveDir)
      .filter((x) => !x.match(shaRegex))
      .map(async (filename) => {
        const origin = path.join(saveDir, filename);
        const fileHash = await getFileHash(origin);
        const fileType = await FileType.fromFile(origin);
        let ext = "html";
        if (fileType) ext = fileType.ext;
        const updated = path.join(saveDir, `${fileHash}.${ext}`);
        fs.renameSync(origin, updated);
        return { origin, updated };
      });
    res.send(await Promise.all(update));
  });

  return app;
}

module.exports = v1;
