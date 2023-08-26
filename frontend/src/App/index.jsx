import "bootstrap/dist/css/bootstrap.min.css";

import {
  Button,
  Card,
  Col,
  Container,
  FormControl,
  InputGroup,
  ListGroup,
  ListGroupItem,
  Row,
} from "react-bootstrap";
import { useCallback, useEffect, useState } from "react";

import API from "../api";
import { Pages } from "../Pagination";

const N = 10;

function Viewer({ src, onClose }) {
  let viewerComponent = null;

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
    viewerComponent = <div>Not supported</div>;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
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
  const [currentFile, setCurrentFile] = useState(null);
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

  function handleCardClick(filename) {
    setCurrentFile(`/downloaded/${filename}`);
  }

  return (
    <div className="app">
      <Container style={{ maxWidth: "800px" }}>
        <h1>Downloader</h1>
        <InputGroup>
          <FormControl
            placeholder="Enter URL"
            autoComplete="off"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => {
              e.key === "Enter" && handleDownload();
            }}
          ></FormControl>
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
        <Row xs={1} md={2} className="g-4">
          {downloaded.map(({ filename, date }) => {
            return (
              <Col key={filename}>
                <Card
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCardClick(filename)}
                >
                  <Card.Img
                    variant="top"
                    src={`/thumbnail/${filename}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/error.png";
                    }}
                  />
                  <Card.Body>
                    <Card.Title>{filename}</Card.Title>
                    <Card.Text>{date}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
        <Pages max={pageMax} value={page} onChange={setPage} />
        <div className="mt-4 d-flex justify-content-center">
          <Button variant="outline-secondary" onClick={API.updateFiles}>
            Update
          </Button>
        </div>
      </Container>
      {currentFile && (
        <Viewer src={currentFile} onClose={() => setCurrentFile(null)} />
      )}
    </div>
  );
}

export default App;
