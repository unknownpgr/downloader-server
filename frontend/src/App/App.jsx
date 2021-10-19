import { useEffect, useState } from "react";
import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  FormControl,
  InputGroup,
  Button,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import API from "../API/api";

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState({ processing: [], downloaded: [] });
  const { processing, downloaded } = status;

  useEffect(() => {
    const handleCheck = async () => {
      const status = await API.getStatus();
      setStatus(status);
    };

    handleCheck();

    const intervalId = setInterval(handleCheck, 1000);
    return () => clearInterval(intervalId);
  }, []);

  function handleDownload() {
    API.postDownload(url);
    setUrl("");
  }

  return (
    <div className="App">
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
        <hr />
        <h2>Downloading Files</h2>
        <ListGroup>
          {processing.map((x) => (
            <ListGroupItem key={x}>{x}</ListGroupItem>
          ))}
        </ListGroup>
        <hr />
        <h2>Downloaded Files</h2>
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
      </Container>
    </div>
  );
}

export default App;
