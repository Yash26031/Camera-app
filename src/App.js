import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [flashOn, setFlashOn] = useState(false);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert image to SVG format
      const imgElement = new Image();
      imgElement.src = imageSrc;
      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

        const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="${
          imgElement.width
        }" height="${
          imgElement.height
        }"><image href="${canvas.toDataURL()}" width="${
          imgElement.width
        }" height="${imgElement.height}" /></svg>`;

        setCapturedImages([...capturedImages, svgImage]);
      };
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
    // Implement torch functionality here for mobile devices
    if (
      navigator.mediaDevices &&
      navigator.mediaDevices.getSupportedConstraints().torch
    ) {
      const track = webcamRef.current.video.srcObject.getTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        track.applyConstraints({
          advanced: [{ torch: flashOn }],
        });
      }
    }
  };

  const switchCamera = () => {
    // Switch to back camera if it's a mobile device
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      const userFacing = webcamRef.current.videoConstraints.facingMode;
      const newFacingMode = userFacing === "user" ? "environment" : "user";
      webcamRef.current.videoConstraints.facingMode = newFacingMode;
    }
  };

  const cancelCamera = () => {
    // Close the camera
    const tracks = webcamRef.current.video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    webcamRef.current.video.srcObject = null;
  };

  useEffect(() => {
    // Switch to back camera on mobile devices
    switchCamera();
  }, []); // Run only on mount

  const deleteImage = (index) => {
    const newImages = [...capturedImages];
    newImages.splice(index, 1);
    setCapturedImages(newImages);
  };

  return (
    <div className="App">
      <div>
        <button onClick={captureImage}>Capture</button>
        <button onClick={toggleFlash}>
          {flashOn ? "Flash Off" : "Flash On"}
        </button>
        <button onClick={cancelCamera}>Cancel</button>
      </div>
      <div>
        <Webcam
          audio={false}
          ref={webcamRef}
          videoConstraints={{
            facingMode: "user", // 'user' for front camera, 'environment' for back camera
          }}
        />
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {capturedImages.map((image, index) => (
              <tr key={index}>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: image }} />
                </td>
                <td>
                  <button onClick={() => deleteImage(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
