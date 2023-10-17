import { useCallback, useEffect, useState } from "react";
import API from "../api";
import { Pages } from "../Pagination";
import { Link, useSearchParams } from "react-router-dom";

const N = 10;

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState({
    queue: [],
    files: {
      downloaded: [],
      totalCount: 0,
    },
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [isBlurThumbnail, setIsBlurThumbnail] = useState(true);
  const page = Number(searchParams.get("page")) || 1;
  const setPage = (page: number) => {
    setSearchParams({ page: String(page) });
  };
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
          }}></input>
        <button
          onClick={handleDownload}
          className="bg-slate-600 rounded-full px-4 py-1 text-white font-medium ml-2">
          Download
        </button>
      </div>
      {queue.length > 0 && (
        <>
          <hr className="my-2" />
          <h2 className="text-2xl font-medium mb-2 mt-4">
            Downloading Files ({queue.length})
          </h2>
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
          className="bg-slate-600 rounded-full px-4 py-1 text-white font-medium ml-2">
          {isBlurThumbnail ? "Show" : "Hide"} thumbnail
        </button>
      </div>
      <Pages max={pageMax} value={page} onChange={setPage} />
      <div className="flex flex-row flex-wrap gap-4 justify-around">
        {downloaded.map(({ filename, date }) => {
          return (
            <Link to={`/viewer/${filename}`}>
              <div key={filename} className="w-64 border rounded">
                <div
                  className="bg-gray-200 h-52 flex justify-center"
                  style={{
                    overflow: "hidden",
                  }}>
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
            </Link>
          );
        })}
      </div>
      <Pages max={pageMax} value={page} onChange={setPage} />
      <div className="my-4 flex justify-center">
        <button
          onClick={handleUpdate}
          className="bg-slate-600 rounded-full px-4 py-1 text-white font-medium mb-4">
          Update
        </button>
      </div>
    </div>
  );
}

export default App;
