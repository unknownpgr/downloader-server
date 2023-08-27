import { useCallback, useEffect, useState } from "react";
import API from "../api";
import { Pages } from "../Pagination";

const N = 10;

function Viewer({ src, onClose }: { src: string; onClose: () => void }
) {
  let viewerComponent: JSX.Element | null = null;

  if (src.endsWith(".mp4")) {
    viewerComponent = (
      <video
        src={src}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
        }}
        controls
        autoPlay
      ></video>
    );
  } else if (src.endsWith(".jpg") || src.endsWith(".png")) {
    viewerComponent = (
      <img
        src={src}
        alt="img"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
    );
  } else {
    viewerComponent = <div
      className="max-s-lg bg-white p-4 rounded-lg shadow-lg"
    >Not supported file type {" "}
      <code>{src.split(".").pop()}</code>.
    </div>;
  }

  return (
    <div
      className="w-full h-full flex justify-center items-center bg-black bg-opacity-50 fixed top-0 left-0 z-50"
      onClick={onClose}
    >
      <div
        className="max-w-full-md max-h-full"
      >
        {viewerComponent}
      </div>
    </div>
  );
}

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState({
    queue: [],
    files: {
      downloaded: [],
      totalCount: 0,
    },
  });
  const [page, setPage] = useState(1);
  const [currentFile, setCurrentFile] = useState<null | string>(null);
  const [isBlurThumbnail, setIsBlurThumbnail] = useState(true);
  const load = useCallback(async () => {
    const status = await API.getStatus({ offset: (page - 1) * N });
    setStatus(status);
  }, [page]);

  const { queue, files } = status;
  const { downloaded, totalCount } = files;
  const pageMax = Math.ceil(totalCount / N);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (queue.length === 0) return;
      load();
    }, 1000);
    return () => clearInterval(timer);
  }, [load, queue]);

  function handleDownload() {
    API.postDownload(url);
    setUrl("");
    load();
  }

  function handleCardClick(filename: string) {
    setCurrentFile(`/api/downloaded/${filename}`);
  }

  async function handleUpdate() {
    await API.updateFiles();
    await load();
    alert("Update finished");
  }

  return (
    <div className="container max-w-screen-md mx-auto my-4 px-4">
      <h1 className="text-3xl font-bold mb-2">Downloader</h1>
      <div className="flex flex-row">
        <input
          className="grow"
          type="text"
          placeholder="Enter URL"
          autoComplete="off"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            e.key === "Enter" && handleDownload();
          }}
        ></input>
        <button onClick={handleDownload}
          className="bg-slate-600 rounded-full px-4 py-1 text-white font-medium ml-2"
        >
          Download
        </button>
      </div>
      {queue.length > 0 && (
        <>
          <hr className="my-2" />
          <h2 className="text-2xl font-medium mb-2 mt-4">Downloading Files ({queue.length})</h2>
          <div>
            {queue.map((x) => (
              <div key={x}>{x}</div>
            ))}
          </div>
        </>
      )}
      <hr className="my-4" />
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-2xl font-medium">Downloaded Files</h2>
        <button
          onClick={() => setIsBlurThumbnail((x) => !x)}
          className="bg-slate-600 rounded-full px-4 py-1 text-white font-medium ml-2"
        >
          {isBlurThumbnail ? "Show" : "Hide"} thumbnail
        </button>
      </div>
      <Pages max={pageMax} value={page} onChange={setPage} />
      <div className="flex flex-row flex-wrap gap-4 justify-around">
        {downloaded.map(({ filename, date }) => {
          return (
            <div
              key={filename}
              className="w-64 border rounded"
            >
              <div
                style={{ cursor: "pointer", overflow: "hidden" }}
                onClick={() => handleCardClick(filename)}
              >
                <div
                  className="bg-gray-200 h-52 flex justify-center"
                  style={{
                    overflow: "hidden"
                  }}
                >
                  <img
                    src={`/api/thumbnail/${filename}`}
                    alt="thumbnail"
                    className="h-full duration-150"
                    style={{
                      filter: isBlurThumbnail ? "blur(10px)" : "none",
                      transform: isBlurThumbnail ? "scale(1.1)" : "none",
                      objectFit: "scale-down",
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/error.png";
                    }}
                  />
                </div>
                <div className="font-medium text-center p-2">{date}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Pages max={pageMax} value={page} onChange={setPage} />
      <div className="my-4 flex justify-center">
        <button onClick={handleUpdate}
          className="bg-slate-600 rounded-full px-4 py-1 text-white font-medium mb-4"
        >
          Update
        </button>
      </div>
      {currentFile && (
        <Viewer src={currentFile} onClose={() => setCurrentFile(null)} />
      )}
    </div>
  );
}

export default App;
