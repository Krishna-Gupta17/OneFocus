import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const audioRef = useRef(null);

  const tracks = [
    { 
      name: 'Rain Sounds', 
      duration: '60:00', 
      type: 'nature',
      url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
      localUrl: '/audio/rain.mp3' // We'll use a placeholder
    },
    { 
      name: 'Forest Ambience', 
      duration: '45:30', 
      type: 'nature',
      url: 'https://www.soundjay.com/misc/sounds/forest-01.wav',
      localUrl: '/audio/forest.mp3'
    },
    { 
      name: 'Ocean Waves', 
      duration: '55:15', 
      type: 'nature',
      url: 'https://www.soundjay.com/misc/sounds/ocean-01.wav',
      localUrl: '/audio/ocean.mp3'
    },
    { 
      name: 'Lo-fi Study Beats', 
      duration: '120:00', 
      type: 'music',
      url: 'https://www.soundjay.com/misc/sounds/lofi-01.wav',
      localUrl: '/audio/lofi.mp3'
    },
    { 
      name: 'White Noise', 
      duration: '∞', 
      type: 'noise',
      url: 'https://www.soundjay.com/misc/sounds/whitenoise-01.wav',
      localUrl: '/audio/whitenoise.mp3'
    },
    { 
      name: 'Brown Noise', 
      duration: '∞', 
      type: 'noise',
      url: 'https://www.soundjay.com/misc/sounds/brownnoise-01.wav',
      localUrl: '/audio/brownnoise.mp3'
    }
  ];

  useEffect(() => {
    gsap.fromTo(playerRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, [currentTrack]);

  const handleTrackEnd = () => {
    // Auto-play next track
    const nextTrack = (currentTrack + 1) % tracks.length;
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        await audio.pause();
        setIsPlaying(false);
        toast('Music paused');
      } else {
        await audio.play();
        setIsPlaying(true);
        toast.success(`Playing: ${tracks[currentTrack].name}`);
      }
      
      // Animate play button
      gsap.to('.play-button', {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });
    } catch (error) {
      console.error('Audio play error:', error);
      toast.error('Unable to play audio. Using demo mode.');
      // Fallback to demo mode
      setIsPlaying(!isPlaying);
    }
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
    setCurrentTime(0);
    
    if (isPlaying) {
      // Will auto-play the new track
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.play().catch(() => {
            toast.error('Unable to play audio. Using demo mode.');
          });
        }
      }, 100);
    }
    
    // Animate track selection
    gsap.fromTo(`[data-track="${index}"]`,
      { backgroundColor: 'rgba(139, 92, 246, 0.2)' },
      { backgroundColor: 'rgba(139, 92, 246, 0.4)', duration: 0.3 }
    );
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTrackIcon = (type) => {
    switch (type) {
      case 'nature': return '🌿';
      case 'music': return '🎵';
      case 'noise': return '📻';
      default: return '🎶';
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={playerRef} className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Focus Music</h3>
      
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={`data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT`}
        loop={tracks[currentTrack].type === 'noise'}
        volume={volume / 100}
        muted={isMuted}
      />
      
      <div className="bg-black/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-white font-semibold">{tracks[currentTrack].name}</h4>
            <p className="text-white/60 text-sm">
              {formatTime(currentTime)} / {tracks[currentTrack].duration}
            </p>
          </div>
          <div className="text-2xl">
            {getTrackIcon(tracks[currentTrack].type)}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="play-button p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transform hover:scale-110 transition-all duration-200"
          >
            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
          
          <div className="flex-1">
            <div className="w-full bg-white/10 rounded-full h-2 cursor-pointer">
              <div 
                className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 text-white hover:text-purple-400 transition-colors"
            >
              {isMuted ? <XMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-white/10 rounded-lg appearance-none slider"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        <h5 className="text-white/80 text-sm font-semibold mb-2">Playlist</h5>
        {tracks.map((track, index) => (
          <div
            key={index}
            data-track={index}
            onClick={() => selectTrack(index)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 ${
              currentTrack === index ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getTrackIcon(track.type)}</span>
              <div>
                <p className="text-white text-sm">{track.name}</p>
                <p className="text-white/60 text-xs">{track.duration}</p>
              </div>
            </div>
            {currentTrack === index && isPlaying && (
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-purple-400 rounded animate-pulse"></div>
                <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-white/60 text-center">
        <p>🎧 Demo mode - Real audio files would be loaded from server</p>
      </div>
    </div>
  );
};

export default MusicPlayer;