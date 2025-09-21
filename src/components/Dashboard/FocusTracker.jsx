import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const ALERT_SOUND_URL = '/sounds/alert.mp3';

const FocusTracker = ({ onFocusChange, focusThreshold = 75 }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [focusScore, setFocusScore] = useState(85);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 50, y: 50 });
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [consecutiveNoFaceDetections, setConsecutiveNoFaceDetections] = useState(0);
  const [noEyesStartTime, setNoEyesStartTime] = useState(null);
  const [focusTime, setFocusTime] = useState(0); // Timer in seconds
  const [eyesDetected, setEyesDetected] = useState(true);
  const [eyesNotDetectedSeconds, setEyesNotDetectedSeconds] = useState(0);

  const videoRef = useRef(null);
  const trackerRef = useRef(null);
  const ringRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const alertAudioRef = useRef(null);
  const pauseTimeoutRef = useRef(null);
  const visibilityChangeRef = useRef(null);
  const timerRef = useRef(null);

  // Constants for detection thresholds
  const NO_FACE_THRESHOLD = 3; // Pause after 3 consecutive no-face detections
  const NO_EYES_THRESHOLD_MS = 20000; // Pause after 20 seconds of no eyes
  const NO_EYES_THRESHOLD_SECONDS = Math.floor(NO_EYES_THRESHOLD_MS / 1000);
  const RESUME_DELAY = 1000; // 1 second delay before resuming after activity

  useEffect(() => {
    gsap.fromTo(
      trackerRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
    
    alertAudioRef.current = new Audio(ALERT_SOUND_URL);
    alertAudioRef.current.loop = true;
    alertAudioRef.current.volume = 0.6;

    // Setup visibility change listener for tab switching
    const handleVisibilityChange = () => {
      if (document.hidden && isTracking && !isPaused) {
        pauseTracking('tab');
      } else if (!document.hidden && isPaused && pauseReason === 'tab') {
        resumeTracking();
      }
    };

    visibilityChangeRef.current = handleVisibilityChange;
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(pauseTimeoutRef.current);
      clearInterval(timerRef.current);
    };
  }, [isTracking, isPaused, pauseReason]);

  // Handle window blur/focus for additional tab detection
  useEffect(() => {
    const handleFocus = () => {
      if (isPaused && pauseReason === 'tab') {
        resumeTracking();
      }
    };

    const handleBlur = () => {
      if (isTracking && !isPaused) {
        pauseTracking('tab');
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isTracking, isPaused, pauseReason]);

  // Timer logic
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerRef.current = setInterval(() => {
        setFocusTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTracking, isPaused]);

  // Eyes-not-detected countdown logic for UI and pause trigger
  useEffect(() => {
    let intervalId;
    if (isTracking && !isPaused) {
      if (!eyesDetected) {
        intervalId = setInterval(() => {
          setEyesNotDetectedSeconds((prev) => {
            const next = prev + 1;
            if (next >= NO_EYES_THRESHOLD_SECONDS) {
              if (!isPaused) pauseTracking('no-eyes');
              return NO_EYES_THRESHOLD_SECONDS;
            }
            return next;
          });
        }, 1000);
      } else {
        setEyesNotDetectedSeconds(0);
      }
    } else {
      setEyesNotDetectedSeconds(0);
    }
    return () => clearInterval(intervalId);
  }, [isTracking, isPaused, eyesDetected]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const drawLandmarks = (landmarks, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!Array.isArray(landmarks)) return;
    
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    for (let point of landmarks) {
      if (point && typeof point.x === 'number' && typeof point.y === 'number') {
        ctx.fillRect(point.x * canvas.width, point.y * canvas.height, 1, 1);
      }
    }

    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    const eyeLandmarks = [33, 7, 163, 144, 145, 153, 154, 155, 133, 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    
    for (let index of eyeLandmarks) {
      if (landmarks[index] && typeof landmarks[index].x === 'number' && typeof landmarks[index].y === 'number') {
        ctx.fillRect(
          landmarks[index].x * canvas.width, 
          landmarks[index].y * canvas.height, 
          2, 2
        );
      }
    }
  };

  // Helper: Euclidean distance in normalized coordinates
  const dist = (a, b) => {
    if (!a || !b) return 0;
    const dx = (a.x || 0) - (b.x || 0);
    const dy = (a.y || 0) - (b.y || 0);
    return Math.hypot(dx, dy);
  };

  // Compute Eye Aspect Ratio (EAR) for both eyes and average
  // Using MediaPipe FaceMesh indices
  // Left eye: horizontal 33-133, vertical pairs 159-145 and 160-144
  // Right eye: horizontal 362-263, vertical pairs 386-374 and 385-380
  const calcEAR = (landmarks) => {
    const l_h = dist(landmarks[33], landmarks[133]);
    const l_v1 = dist(landmarks[159], landmarks[145]);
    const l_v2 = dist(landmarks[160], landmarks[144]);
    const l_ear = l_h > 0 ? ((l_v1 + l_v2) / (2 * l_h)) : 0;

    const r_h = dist(landmarks[362], landmarks[263]);
    const r_v1 = dist(landmarks[386], landmarks[374]);
    const r_v2 = dist(landmarks[385], landmarks[380]);
    const r_ear = r_h > 0 ? ((r_v1 + r_v2) / (2 * r_h)) : 0;

    return (l_ear + r_ear) / 2;
  };

  // Determine retina (iris) visibility using iris landmarks with refineLandmarks=true
  // Left iris center: 468, ring: 469-472; Right iris center: 473, ring: 474-477
  const checkEyesDetection = (landmarks) => {
    if (!landmarks) return false;
    const EAR_OPEN_THRESHOLD = 0.22;
    const IRIS_MIN_RADIUS = 0.002; // normalized units

    const ear = calcEAR(landmarks);
    const eyesOpen = ear >= EAR_OPEN_THRESHOLD;

    // Left iris
    const li_c = landmarks[468];
    const li_ring = [469, 470, 471, 472].map(i => landmarks[i]).filter(Boolean);
    const li_r = li_ring.length ? li_ring.reduce((s, p) => s + dist(li_c, p), 0) / li_ring.length : 0;

    // Right iris
    const ri_c = landmarks[473];
    const ri_ring = [474, 475, 476, 477].map(i => landmarks[i]).filter(Boolean);
    const ri_r = ri_ring.length ? ri_ring.reduce((s, p) => s + dist(ri_c, p), 0) / ri_ring.length : 0;

    const retinaVisible = li_r >= IRIS_MIN_RADIUS && ri_r >= IRIS_MIN_RADIUS;

    return eyesOpen && retinaVisible;
  };

  const pauseTracking = (reason) => {
    if (!isTracking || isPaused) return;
    
    setIsPaused(true);
    setPauseReason(reason);
    setLastActiveTime(Date.now());
    setEyesNotDetectedSeconds(0);
    
    if (alertAudioRef.current && !alertAudioRef.current.paused) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }
    
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    
    let message = '';
    switch (reason) {
      case 'tab':
        message = 'Focus tracking paused - tab switched';
        break;
      case 'no-face':
        message = 'Focus tracking paused - face not detected';
        break;
      case 'no-eyes':
        message = 'Focus tracking paused - retina not detected for 20s';
        break;
      default:
        message = 'Focus tracking paused';
    }
    
    toast(message, { 
      duration: 3000,
      style: {
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        border: '1px solid #ff6b6b',
      }
    });
    
    setConsecutiveNoFaceDetections(0);
    setNoEyesStartTime(null);
  };

  const resumeTracking = () => {
    if (!isTracking || !isPaused || pauseReason !== 'tab') return;
    
    clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      if (!document.hidden && pauseReason === 'tab') {
        setIsPaused(false);
        setPauseReason('');
        
        if (cameraRef.current && videoRef.current) {
          cameraRef.current.start();
        }
        
        toast.success('Focus tracking resumed', { 
          duration: 2000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: '1px solid #4ade80',
          }
        });
        
        setLastActiveTime(Date.now());
      }
    }, RESUME_DELAY);
  };

  const setupFaceMesh = () => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      if (!canvas || isPaused) return;

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        drawLandmarks(landmarks, canvas);

        const eyesOpen = checkEyesDetection(landmarks);
        
        if (eyesOpen) {
          setEyesDetected(true);
          setEyesNotDetectedSeconds(0);
          const leftEye = landmarks[159];
          const rightEye = landmarks[386];
          
          if (leftEye && rightEye) {
            const midX = (leftEye.x + rightEye.x) / 2;
            const midY = (leftEye.y + rightEye.y) / 2;
            setEyePosition({ x: midX * 100, y: midY * 100 });
          }

          setConsecutiveNoFaceDetections(0);
          setNoEyesStartTime(null);

          setFocusScore((prev) => {
            const newScore = Math.min(100, prev + 2);
            if (newScore >= focusThreshold && alertAudioRef.current?.paused === false) {
              alertAudioRef.current.pause();
              alertAudioRef.current.currentTime = 0;
            }
            onFocusChange?.(newScore, true);
            return newScore;
          });
        } else {
          setEyesDetected(false);
          setNoEyesStartTime((prev) => prev || Date.now());

          if (noEyesStartTime && Date.now() - noEyesStartTime >= NO_EYES_THRESHOLD_MS && !isPaused) {
            pauseTracking('no-eyes');
          }

          setFocusScore((prev) => {
            const newScore = Math.max(20, prev - 1);
            if (newScore < focusThreshold && alertAudioRef.current?.paused) {
              alertAudioRef.current.play().catch((e) => console.warn('Audio play error:', e));
            }
            onFocusChange?.(newScore, false);
            return newScore;
          });
        }
      } else {
        setEyesDetected(false);
        setConsecutiveNoFaceDetections(prev => {
          const newCount = prev + 1;
          if (newCount >= NO_FACE_THRESHOLD && !isPaused) {
            pauseTracking('no-face');
          }
          return newCount;
        });

        setNoEyesStartTime((prev) => prev || Date.now());

        setFocusScore((prev) => {
          const newScore = Math.max(10, prev - 5);
          if (newScore < focusThreshold && alertAudioRef.current?.paused) {
            alertAudioRef.current.play().catch((e) => console.warn('Audio play error:', e));
          }
          onFocusChange?.(newScore, false);
          return newScore;
        });
      }
    });

    faceMeshRef.current = faceMesh;
  };

  const startTracking = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Camera not supported on this device.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      });

      setCameraPermission(true);
      setIsTracking(true);
      setIsPaused(false);
      setPauseReason('');
      setLastActiveTime(Date.now());
      setConsecutiveNoFaceDetections(0);
      setNoEyesStartTime(null);
      setFocusTime(0);
  setEyesDetected(true);
  setEyesNotDetectedSeconds(0);
      
      toast.success('Focus tracking started!');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      gsap.to(ringRef.current, {
        scale: 1.05,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      setupFaceMesh();

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && !isPaused) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 320,
        height: 240,
      });

      camera.start();
      cameraRef.current = camera;
    } catch (err) {
      console.error('Error starting camera:', err);
      toast.error('Failed to start focus tracking');
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    setIsPaused(false);
    setPauseReason('');
    setConsecutiveNoFaceDetections(0);
    setNoEyesStartTime(null);
    setFocusTime(0);
    setEyesDetected(false);
    setEyesNotDetectedSeconds(0);

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    faceMeshRef.current = null;

    if (alertAudioRef.current) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }

    setCameraPermission(false);
    gsap.killTweensOf(ringRef.current);
    gsap.set(ringRef.current, { scale: 1 });
  };

  const getFocusColor = (score) => {
    if (score >= 85) return 'text-green-400 border-green-400';
    if (score >= 75) return 'text-yellow-400 border-yellow-400';
    if (score >= 60) return 'text-orange-400 border-orange-400';
    return 'text-red-400 border-red-400';
  };

  const getFocusGradient = (score) => {
    if (score >= 85) return 'from-green-500 to-emerald-500';
    if (score >= 75) return 'from-yellow-500 to-orange-500';
    if (score >= 60) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getFocusMessage = (score) => {
    if (score >= 90) return 'Excellent Focus! 🎯';
    if (score >= 80) return 'Good Focus 👍';
    if (score >= focusThreshold) return 'Moderate Focus ⚠️';
    return 'Low Focus - Take a break? 😴';
  };

  const getPauseStatusMessage = () => {
    if (!isPaused) return null;
    
    switch (pauseReason) {
      case 'tab':
        return '⏸️ Paused - Tab inactive';
      case 'no-face':
        return '⏸️ Paused - Face not detected';
      case 'no-eyes':
        return '⏸️ Paused - Retina not detected for 20s';
      default:
        return '⏸️ Paused';
    }
  };

  useEffect(() => stopTracking, []);

  const isEffectivelyPaused = isPaused || !isTracking;

  return (
    <div ref={trackerRef} className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">AI Focus Tracker</h3>
        <div className={`flex items-center gap-2 ${isEffectivelyPaused ? 'text-gray-400' : 'text-green-400'}`}>
          <div className={`w-2 h-2 rounded-full ${
            isTracking && !isPaused ? 'bg-green-400 animate-pulse' : 
            isTracking ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm">
            {isTracking && !isPaused ? 'Active' : isTracking ? 'Paused' : 'Inactive'}
          </span>
          {getPauseStatusMessage()}
        </div>
      </div>

      <div className="text-center mb-6">
        <div
          ref={ringRef}
          className={`relative w-32 h-32 mx-auto mb-4 rounded-full border-4 focus-ring ${
            isEffectivelyPaused ? 'border-gray-400 text-gray-400' : getFocusColor(focusScore)
          } overflow-hidden transition-colors duration-300`}
        >
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover absolute transition-opacity duration-300 ${
              isEffectivelyPaused ? 'opacity-30' : 'opacity-100'
            }`}
          />
          <canvas 
            ref={canvasRef} 
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
              isEffectivelyPaused ? 'opacity-20' : 'opacity-100'
            }`} 
            width={320} 
            height={240}
          ></canvas>

          {isTracking && !isPaused && (
            <div
              className="absolute w-2 h-2 bg-green-400 rounded-full transition-all duration-300 shadow-lg"
              style={{
                left: `${eyePosition.x}%`,
                top: `${eyePosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}

          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isEffectivelyPaused ? 'bg-gray-500 text-gray-200' : `bg-gradient-to-r ${getFocusGradient(focusScore)}`
              } transition-all duration-300`}
            >
              {isEffectivelyPaused ? 'PAUSED' : `${Math.round(focusScore)}%`}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className={`text-sm mb-2 transition-all duration-300 ${isEffectivelyPaused ? 'text-gray-400' : 'text-white/80'}`}>
            {isEffectivelyPaused ? getPauseStatusMessage() || 'Tracking paused' : getFocusMessage(focusScore)}
          </p>
          {/* Retina not detected countdown UI */}
          {isTracking && !isPaused && !eyesDetected && (
            <div className="mb-2 rounded-md border border-red-400/40 bg-red-500/10 p-2 text-xs text-red-300">
              <div className="flex justify-between mb-1">
                <span>Retina not detected</span>
                <span>{eyesNotDetectedSeconds}s / {NO_EYES_THRESHOLD_SECONDS}s</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (eyesNotDetectedSeconds / NO_EYES_THRESHOLD_SECONDS) * 100)}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-between text-sm mb-2">
            <span className={`${isEffectivelyPaused ? 'text-gray-500' : 'text-white/60'}`}>
              {isEffectivelyPaused ? 'Status' : 'Focus Level'}
            </span>
            <span className={`${isEffectivelyPaused ? 'text-gray-400' : 'text-white/60'}`}>
              {isEffectivelyPaused ? pauseReason : `${Math.round(focusScore)}%`}
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                isEffectivelyPaused ? 'bg-gray-500' : `bg-gradient-to-r ${getFocusGradient(focusScore)}`
              }`}
              style={{ width: isEffectivelyPaused ? '20%' : `${focusScore}%` }}
            ></div>
          </div>

          <div className="mt-2 flex justify-between text-sm">
            <span className={`${isEffectivelyPaused ? 'text-gray-500' : 'text-white/60'}`}>Focus Time</span>
            <span className={`${isEffectivelyPaused ? 'text-gray-400' : 'text-white/60'}`}>
              {formatTime(focusTime)}
            </span>
          </div>
        </div>

        {!isTracking ? (
          <button
            onClick={startTracking}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 mx-auto"
          >
            <CameraIcon className="w-5 h-5" />
            Start Tracking
          </button>
        ) : (
          <div className="space-y-2">
            {isPaused && (
              <button
                onClick={() => {
                  setIsPaused(false);
                  setPauseReason('');
                  setNoEyesStartTime(null);
                  if (cameraRef.current) cameraRef.current.start();
                  toast.success('Focus tracking manually resumed');
                }}
                className="w-full px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                Resume Tracking
              </button>
            )}
            <button
              onClick={stopTracking}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transform hover:scale-105 transition-all duration-200"
            >
              Stop Tracking
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-white/60 text-center space-y-1">
        <p>AI analyzes retina visibility and face presence</p>
        <p className={isPaused ? 'text-yellow-400' : 'text-white/60'}>
          {isPaused 
            ? `Auto-pauses on tab switch, no face (${NO_FACE_THRESHOLD}s), or no retina (20s)` 
            : 'Auto-resumes after activity detected'
          }
        </p>
        {isPaused && (
          <p className="text-xs text-yellow-300">
            Last active: {new Date(lastActiveTime).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default FocusTracker;