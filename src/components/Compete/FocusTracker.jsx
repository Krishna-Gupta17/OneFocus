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

  // Helper to calculate Eye Aspect Ratio (EAR)
  const calculateEAR = (landmarks, leftIndices, rightIndices) => {
    // EAR formula: (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    // Left eye
    const leftEAR = (
      dist(landmarks[leftIndices[1]], landmarks[leftIndices[5]]) +
      dist(landmarks[leftIndices[2]], landmarks[leftIndices[4]])
    ) / (2 * dist(landmarks[leftIndices[0]], landmarks[leftIndices[3]]));
    // Right eye
    const rightEAR = (
      dist(landmarks[rightIndices[1]], landmarks[rightIndices[5]]) +
      dist(landmarks[rightIndices[2]], landmarks[rightIndices[4]])
    ) / (2 * dist(landmarks[rightIndices[0]], landmarks[rightIndices[3]]));
    return (leftEAR + rightEAR) / 2;
  };

  // Indices for left and right eye landmarks (MediaPipe FaceMesh)
  const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
  const RIGHT_EYE_INDICES = [263, 387, 385, 362, 380, 373];

  const handleResults = (results) => {
    const faceDetected = results?.multiFaceLandmarks?.length > 0;
    let eyesOpen = false;
    let level = -1; // -1: no face, 0: eyes closed, 1: eyes open
    if (faceDetected) {
      const landmarks = results.multiFaceLandmarks[0];
      const ear = calculateEAR(landmarks, LEFT_EYE_INDICES, RIGHT_EYE_INDICES);
      eyesOpen = ear > 0.22;
      level = eyesOpen ? 1 : 0;
    }
    setFocusLevel(level);
    onFocusChange?.(level);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = 320;
      canvasRef.current.height = 240;
      ctx.clearRect(0, 0, 320, 240);

      if (faceDetected) {
        ctx.strokeStyle = eyesOpen ? 'red' : 'yellow';
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
    if (score === 1) return 'from-green-500 to-emerald-500';
    if (score === 0) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getFocusMessage = (score) => {
    if (score === 1) return 'Eyes Open 🎯';
    if (score === 0) return 'Eyes Closed 😴';
    return 'No Face Detected �';
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
            style={{ width: `${focusLevel === 1 ? 100 : focusLevel === 0 ? 50 : 0}%` }}
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
