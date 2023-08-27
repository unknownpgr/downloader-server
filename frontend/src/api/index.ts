const get = (path: string, params?: Record<string, any>) =>
  fetch(`${path}?${new URLSearchParams(params)}`).then((x) => x.json());
const post = (path: string, data: any) =>
  fetch(path, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
const postDownload = (url: string) => post("/api/download", { url });
const getStatus = (option: { offset?: number; limit?: number }) => {
  return get("/api/status", option);
};
const updateFiles = () => get("/api/update");

const API = { get, post, postDownload, getStatus, updateFiles };

export default API;
