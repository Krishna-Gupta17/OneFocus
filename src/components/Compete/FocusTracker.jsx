import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const FocusTracker = ({ onFocusChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ringRef = useRef(null);
  const [focusLevel, setFocusLevel] = useState(0);
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    gsap.fromTo(
      ringRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(handleResults);

    let camera;
    if (videoRef.current) {
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 320,
        height: 240,
      });
      camera.start();
    }

    return () => {
      if (camera) camera.stop();
    };
  }, []);

  const handleResults = (results) => {
    const faceDetected = results?.multiFaceLandmarks?.length > 0;
    const level = faceDetected ? 1 : 0;

    setFocusLevel(level);
    onFocusChange?.(level);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = 320;
      canvasRef.current.height = 240;
      ctx.clearRect(0, 0, 320, 240);

      if (faceDetected) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        for (let point of results.multiFaceLandmarks[0]) {
          ctx.beginPath();
          ctx.arc(point.x * 320, point.y * 240, 1, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }

      gsap.to(canvasRef.current, { opacity: faceDetected ? 1 : 0.2, duration: 0.5 });
    }
  };

  const getFocusGradient = (score) => {
    return score >= 1 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500';
  };

  const getFocusMessage = (score) => {
    return score >= 1 ? 'Face Detected 🎯' : 'No Face 😴';
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-6 rounded-2xl border border-white/20 w-full max-w-[320px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-white">AI Focus Tracker</h3>
        <div className={`flex items-center gap-2 ${isTracking ? 'text-green-400' : 'text-gray-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm">{isTracking ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      <div className="text-center mb-6">
        <div
          ref={ringRef}
          className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full border-4 border-purple-400 overflow-hidden"
        >
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover absolute" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        </div>

        <p className="text-white/80 text-sm mb-2">{getFocusMessage(focusLevel)}</p>
        <div className="w-full bg-white/10 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full bg-gradient-to-r ${getFocusGradient(focusLevel)} transition-all duration-1000`}
            style={{ width: `${focusLevel * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="text-xs text-white/60 text-center space-y-1">
        <p>AI detects face presence using MediaPipe</p>
        <p>Focus drops when no face is visible</p>
      </div>
    </div>
  );
};

export default FocusTracker;
