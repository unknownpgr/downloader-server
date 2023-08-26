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
const postDownload = (url) => post("/download", { url });
const getStatus = (option) => get("/status", option);
const updateFiles = () => get("/update");

const API = { get, post, postDownload, getStatus, updateFiles };

export default API;
