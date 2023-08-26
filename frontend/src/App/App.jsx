import "bootstrap/dist/css/bootstrap.min.css";

import {
  Button,
  Container,
  FormControl,
  InputGroup,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import { useEffect, useState } from "react";

import API from "../API/api";
import { Pages } from "../Pagination/Pagination";

const N = 10;

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState({
    queue:[],
    current:null,
    files:{
      downloaded:[],
      totalCount:0,
    },
  });
  const [page, setPage] = useState(1);

  const { queue, current, files } = status;
  const  { downloaded, totalCount } = files;
  const pageMax = Math.ceil(totalCount / N);

  useEffect(() => {
    const handleCheck = async () => {
      const status = await API.getStatus({ offset: (page - 1) * N });
      setStatus(status);
    };

    handleCheck();
    const intervalId = setInterval(handleCheck, 1000);
    return () => clearInterval(intervalId);
  }, [page]);

  function handleDownload() {
    API.postDownload(url);
    setUrl("");
  }

  return (
    <div className="app">
      <Container>
        <h1>Downloader</h1>
        <InputGroup>
          <FormControl
            placeholder="Enter URL"
            autoComplete="off"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => {
              e.key === "Enter" && handleDownload();
            }}></FormControl>
          <Button variant="outline-secondary" onClick={handleDownload}>
            Download
          </Button>
        </InputGroup>
        {queue.length > 0 && (
          <>
            <hr />
            <h2>Downloading Files</h2>
            <ListGroup>
              {queue.map((x) => (
                <ListGroupItem key={x}>{x}</ListGroupItem>
              ))}
            </ListGroup>
          </>
        )}
        <hr />
        <h2>Downloaded Files</h2>
        <Pages max={pageMax} value={page} onChange={setPage} />
        <ListGroup>
          {downloaded.map(({ filename, date }) => {
            return (
              <ListGroupItem key={filename}>
                <div>
                  <div>
                    <a href={`/downloaded/${filename}`}>{filename}</a>
                  </div>
                </div>
                <div>{date}</div>
              </ListGroupItem>
            );
          })}
        </ListGroup>
        <Pages max={pageMax} value={page} onChange={setPage} />
        <div className="mt-4 d-flex justify-content-center">
          <Button variant="outline-secondary" onClick={API.updateFiles}>
            Update
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default App;
