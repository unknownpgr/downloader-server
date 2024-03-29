const express = require("express");
const Downloader = require("./core");
const path = require("path");
const morgan = require("morgan");

// Constants
const DIR_DOWNLOAD = path.join(__dirname, "download");
const DIR_PUBLIC = path.join(__dirname, "public");
const PORT = 80;

// Downloader
const downloader = new Downloader(DIR_DOWNLOAD);

// Router
const app = express();

app.use(morgan("dev"));
app.use(express.static(DIR_PUBLIC));
app.use("/api/downloaded", express.static(DIR_DOWNLOAD));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/download", (req, res) => {
  try {
    const [parsedURL, filename] = downloader.add(req.body.url);
    res.status(200).send([parsedURL, filename]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/api/status", (req, res) => {
  let { offset, limit } = req.query;

  const queue = downloader.getQueue();
  const current = downloader.getCurrent();
  const files = downloader.listFiles(offset, limit);

  res.status(200).send({ queue, current, files });
});

app.get("/api/update", async (req, res) => {
  const result = await downloader.updateWrongNamedFiles();
  res.status(200).send(result);
});

app.get("/api/thumbnail/:filename", async (req, res) => {
  const { filename } = req.params;
  try {
    const thumbnail = await downloader.getThumbnail(filename);
    res.sendFile(thumbnail);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server opened at port ${PORT}`);
});
