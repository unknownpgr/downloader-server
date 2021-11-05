const get = path => fetch(path).then(x => x.json());
const post = (path, data) => fetch(path, {
  method: "post",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
const postDownload = (url) => post('/api/v1/download', { url });
const getStatus = () => get('/api/v1/status');
const updateFiles = () => get('/api/v1/update');

const API = { get, post, postDownload, getStatus, updateFiles };

export default API;