import { useParams } from "react-router-dom";

export function Viewer() {
    const { id } = useParams();
    let viewerComponent: JSX.Element | null = null;

    if (!id) return <div>
        <h1>Id is not provided</h1>
    </div>

    const src = `/api/downloaded/${id}`;
    const ext = src.split(".").pop();

    if (!ext) return <div>
        <h1>Invalid file name</h1>
    </div>

    if (["mp4", "webm", "ogg"].includes(ext)) {
        viewerComponent = (
            <video
                src={src}
                className="max-w-full max-h-full"
                controls
                autoPlay
            ></video>
        );
    } else if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
        viewerComponent = (
            <img
                src={src}
                alt="img"
                className="max-w-full max-h-full"
            />
        );
    } else if (["pdf"].includes(ext)) {
        viewerComponent = (
            <iframe
                src={src}
                className="max-w-full max-h-full"
            ></iframe>
        );
    } else if (["mp3", "wav", "ogg"].includes(ext)) {
        viewerComponent = (
            <audio
                src={src}
                className="max-w-full max-h-full"
                controls
                autoPlay
            ></audio>
        );
    } else if (["txt"].includes(ext)) {
        viewerComponent = (
            <div
                className="max-w-full max-h-full"
            >
                <pre className="whitespace-pre-wrap">
                    {src}
                </pre>
            </div>
        );
    } else {
        viewerComponent = <div
            className="max-s-lg bg-white p-4 rounded-lg shadow-lg"
        >Not supported file type {" "}
            <code>{src.split(".").pop()}</code>.
        </div>;
    }

    return (
        <div className="w-full h-full flex justify-center items-center bg-black bg-opacity-50 fixed top-0 left-0 z-50">
            {viewerComponent}
        </div>
    );
}