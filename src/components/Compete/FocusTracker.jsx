import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const ALERT_SOUND_URL = ' '; // Add your alert sound URL if needed

const FocusTracker = ({ onFocusChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [focusLevel, setFocusLevel] = useState(1);

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
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
        width: 300,
        height: 200,
      });
      camera.start();
    }

    return () => {
      if (camera) camera.stop();
    };
  }, []);

  const handleResults = (results) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      setFocusLevel(0);
      onFocusChange(0);
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];

    // Estimate focus based on eye openness and head position
    const leftEyeTop = landmarks[159];
    const leftEyeBottom = landmarks[145];
    const rightEyeTop = landmarks[386];
    const rightEyeBottom = landmarks[374];

    const leftEyeOpen = Math.abs(leftEyeTop.y - leftEyeBottom.y);
    const rightEyeOpen = Math.abs(rightEyeTop.y - rightEyeBottom.y);

    const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;

    // Heuristic: if eyes are open enough, assume focused
    const threshold = 0.015; // tweak this value for sensitivity
    const level = avgEyeOpen > threshold ? 1 : 0.3;

    setFocusLevel(level);
    onFocusChange(level);

    // Optional: play alert sound if unfocused
    if (level < 0.5 && ALERT_SOUND_URL.trim()) {
      const audio = new Audio(ALERT_SOUND_URL);
      audio.play();
    }

    // Optional: animate canvas with GSAP
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = 300;
      canvasRef.current.height = 200;
      ctx.clearRect(0, 0, 300, 200);
      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 1;

      for (let point of landmarks) {
        ctx.beginPath();
        ctx.arc(point.x * 300, point.y * 200, 1, 0, 2 * Math.PI);
        ctx.stroke();
      }

      gsap.to(canvasRef.current, { opacity: level, duration: 0.5 });
    }
  };

  return (
    <div className="relative w-[300px] h-[200px]">
      <video ref={videoRef} className="absolute top-0 left-0 w-full h-full" autoPlay muted playsInline />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        <CameraIcon className="w-4 h-4" />
        Focus: {focusLevel.toFixed(2)}
      </div>
    </div>
  );
};

export default FocusTracker;