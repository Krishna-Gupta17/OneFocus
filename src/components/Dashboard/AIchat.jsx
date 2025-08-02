import React, { useEffect, useRef } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from '@mediapipe/tasks-vision';

const FaceDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const setupFaceLandmarker = async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float32/1/face_landmarker.task',

          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      faceLandmarkerRef.current = faceLandmarker;
      startCamera();
    };

    setupFaceLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    const video = videoRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();

      requestAnimationFrame(processFrame);
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const processFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (
      faceLandmarkerRef.current &&
      video.readyState === 4 // HAVE_ENOUGH_DATA
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const results = faceLandmarkerRef.current.detectForVideo(video, Date.now());

      if (results.faceLandmarks.length > 0) {
        const drawingUtils = new DrawingUtils(canvasRef.current.getContext('2d'));
        for (const landmarks of results.faceLandmarks) {
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
            color: '#00FF00',
            lineWidth: 1,
          });
          drawingUtils.drawLandmarks(landmarks, {
            color: '#FF0000',
            radius: 1,
          });
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-xl border border-green-500"
      />
    </div>
  );
};

export default FaceDetector;
