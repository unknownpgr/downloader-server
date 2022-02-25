const get = (path, params) =>
  fetch(`${path}?${new URLSearchParams(params)}`).then((x) => x.json());
const post = (path, data) =>
  fetch(path, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
const postDownload = (url) => post("/api/v1/download", { url });
const getStatus = (option) => get("/api/v1/status", option);
const updateFiles = () => get("/api/v1/update");

const API = { get, post, postDownload, getStatus, updateFiles };

export default API;
