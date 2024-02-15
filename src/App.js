import moment from "moment";
import React, { useRef, useState } from "react";
import { AiOutlineCamera } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import Webcam from "react-webcam";

const App = () => {
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [flashOn, setFlashOn] = useState(false);

  // const handleCapture = () => {
  //   const canvas = document.createElement("canvas");
  //   canvas.width = 1920; // Set the width to the desired resolution
  //   canvas.height = 1080; // Set the height to the desired resolution

  //   const ctx = canvas.getContext("2d");
  //   const image = new Image();
  //   image.src = webcamRef.current.getScreenshot();

  //   image.onload = () => {
  //     ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  //     const svgImage = canvas.toDataURL("image/svg+xml");

  //     const imageSize = getImageSizeInMB(svgImage);

  //     if (imageSize <= 2) {
  //       setCapturedImages([
  //         ...capturedImages,
  //         { src: svgImage, timestamp: new Date(), size: imageSize },
  //       ]);
  //     } else {
  //       alert("Image size exceeds 2 MB. Please capture a smaller image.");
  //     }
  //   };
  // };

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    const video = webcamRef.current.video;

    if (!video) {
      alert("Unable to capture image. Webcam not initialized.");
      return;
    }

    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturedImage = canvas.toDataURL("image/svg+xml");

    const imageSize = getImageSizeInMB(capturedImage);

    if (imageSize <= 2) {
      setCapturedImages([
        ...capturedImages,
        { src: capturedImage, timestamp: new Date(), size: imageSize },
      ]);
    } else {
      alert("Image size exceeds 2 MB. Please capture a smaller image.");
    }
  };

  console.log(capturedImages);

  const getImageSizeInMB = (dataUrl) => {
    const byteString = atob(dataUrl.split(",")[1]);
    const byteStringLength = byteString.length;
    const fileSizeInBytes = byteStringLength + 1024;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    return fileSizeInMB.toFixed(2);
  };

  const cancelCamera = () => {
    setShowCamera(false);
  };

  const handleDelete = (index) => {
    const updatedImages = [...capturedImages];
    updatedImages.splice(index, 1);
    setCapturedImages(updatedImages);
  };

  const handleThumbnailClick = (index) => {
    setSelectedImage(capturedImages[index].src);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);

    // Access the webcam's video element and toggle the flash
    const videoElement = webcamRef.current.video;
    if (videoElement) {
      const tracks = videoElement.getVideoTracks();
      if (tracks && tracks.length > 0) {
        const [track] = tracks;
        const capabilities = track.getCapabilities();
        if (capabilities && "torch" in capabilities) {
          track.applyConstraints({
            advanced: [{ torch: flashOn }],
          });
        }
      }
    }
  };

  return (
    <>
      <div
        className=" headClass algin-item "
        onClick={() => setShowCamera(true)}
      >
        Camera <AiOutlineCamera className="cameraImage" />{" "}
      </div>
      {showCamera && (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={270} // Set the width of the camera
            height={270} // Set the height of the camera
            videoConstraints={{
              facingMode: "environment",
              deviceId: undefined,
              torch: flashOn,
            }}
          />
          <div className="d-flex gap-2 mt-2 mb-2 justify-content-center align-items-center">
            <button
              variant="success"
              className="btn btnSize mr-2"
              onClick={handleCapture}
            >
              Capture
            </button>
            <button
              variant={flashOn ? "danger" : "warning"}
              onClick={toggleFlash}
              className="btn btnSize ml-2"
            >
              {flashOn ? "Flash off" : "Flash on"}
            </button>
            <button
              variant="danger"
              className="btn btnSize ml-2"
              onClick={cancelCamera}
            >
              Cancel
            </button>
          </div>
        </>
      )}
      {capturedImages.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {capturedImages.map((image, index) => (
            <div key={index} style={{ width: "270px", margin: "10px" }}>
              <img
                className="thumbnail-image" // Add a class for styling
                src={image.src}
                alt={`Captured ${index}`}
                onClick={() => handleThumbnailClick(index)}
              />
              <div>
                <div className="d-flex justify-content-between align-items-center">
                  <span
                    style={{ fontSize: "12px", fontWeight: "600" }}
                  >{`Size: ${image.size} MB, `}</span>
                  <span style={{ fontSize: "12px", fontWeight: "600" }}>
                    {moment(image.timestamp).format("DD-MMM-YYYY HH:mm")}
                  </span>
                  <MdDeleteForever
                    style={{ color: "red" }}
                    size={20}
                    onClick={() => handleDelete(index)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* <Modal show={selectedImage !== null} onHide={handleCloseModal}>
        <Modal.Body>
          <Image src={selectedImage} alt="Selected" fluid />
        </Modal.Body>
      </Modal> */}
    </>
  );
};

export default App;
