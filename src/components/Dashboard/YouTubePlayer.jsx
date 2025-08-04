import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, TrashIcon } from '@heroicons/react/24/solid';
import { SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_SERVER_URL}`;

const YouTubePlayer = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoGallery, setVideoGallery] = useState([]);
  const [volume, setVolume] = useState(50);
  const playerRef = useRef(null);
  const iframeRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(playerRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
    }, playerRef);

    loadVideoGallery();
    return () => ctx.revert();
  }, [user]);

  const loadVideoGallery = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/api/users/${user.uid}`);
      if (response.ok) {
        const userData = await response.json();
        setVideoGallery(userData.videoGallery || []);
      }
    } catch (error) {
      console.error('Error loading video gallery:', error);
    }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // const getVideoTitle = async (videoId) => {
  //   const titles = [
      
  //   ];
  //   return titles[Math.floor(Math.random() * titles.length)];
  // };

  const getVideoTitle = async (videoId) => {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (response.ok) {
      const data = await response.json();
      return data.title;
    }
  } catch (error) {
    console.error('Failed to fetch video title:', error);
  }

  // fallback if fetch fails
  return 'Untitled Video';
};


  const saveVideoToGallery = async (videoData) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/api/users/${user.uid}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
      });

      // if (response.ok) {
      //   const updatedGallery = await response.json();
      //   setVideoGallery(updatedGallery);
      //   toast.success('Video added to gallery!');
      // }

      if (response.ok) {
      const updatedGallery = await response.json();

      // ✅ Filter out duplicates by video ID before setting state
      const uniqueGallery = updatedGallery.filter(
        (v, i, self) => i === self.findIndex((x) => x.id === v.id)
      );

      setVideoGallery(uniqueGallery);
      toast.success('Video added to gallery!');
    } else {
      toast.error('Failed to save video.');
    }
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Failed to save video');
    }
  };

  const loadVideo = async () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    const title = await getVideoTitle(videoId);
    const videoData = {
      id: videoId,
      url: videoUrl,
      title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      addedAt: new Date()
    };

    setCurrentVideo(videoData);

    const exists = videoGallery.some(v => v.id === videoId);
    if (!exists) await saveVideoToGallery(videoData);

    setVideoUrl('');

    gsap.fromTo('.video-container',
      { scale: 0.8, opacity: 0, rotationY: -15 },
      { scale: 1, opacity: 1, rotationY: 0, duration: 0.8, ease: "back.out(1.7)" }
    );
  };

  const selectFromGallery = (video) => {
    setCurrentVideo(video);
    setIsPlaying(false);
    gsap.fromTo('.video-container',
      { scale: 0.95 },
      { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
  };

  const removeFromGallery = async (videoId) => {
    if (!user) return;
    try {
      const updatedGallery = videoGallery.filter(v => v.id !== videoId);
      const response = await fetch(`${API_BASE}/api/users/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoGallery: updatedGallery }),
      });

      if (response.ok) {
        setVideoGallery(updatedGallery);
        if (currentVideo?.id === videoId) setCurrentVideo(null);
        toast.success('Video removed from gallery');
      }
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error('Failed to remove video');
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    toast(isPlaying ? 'Video paused' : 'Video playing');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast(isMuted ? 'Video unmuted' : 'Video muted');
  };

  return (
    <div ref={playerRef} className="max-w-3xl mx-auto backdrop-blur-lg bg-white/10 p-4 sm:p-6 rounded-2xl border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Distraction-Free Video Player</h3>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          inputMode="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadVideo()}
          placeholder="Paste YouTube URL here..."
          className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={loadVideo}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transform hover:scale-105 transition-all duration-200"
        >
          Load Video
        </button>
      </div>

      {currentVideo ? (
        <div className="video-container mb-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${currentVideo.id}?modestbranding=1&rel=0&showinfo=0&controls=1&autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}`}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              title={currentVideo.title}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-white font-semibold">{currentVideo.title}</h4>
              <p className="text-white/60 text-sm">Clean YouTube experience</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={togglePlay}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transform hover:scale-110 transition-all duration-200"
              >
                {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full transform hover:scale-110 transition-all duration-200"
              >
                {isMuted ? <XMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full sm:w-20 h-2 bg-white/10 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-white/60 mb-4">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlayIcon className="w-8 h-8 text-red-400" />
          </div>
          <p>Enter a YouTube URL to start focused learning</p>
          <p className="text-sm mt-2">No recommendations, no distractions - just pure content</p>
        </div>
      )}

      <div className="border-t border-white/10 pt-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          📚 Your Video Library
          <span className="text-xs text-white/60">({videoGallery.length} videos)</span>
        </h4>

        {videoGallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto snap-y snap-mandatory">
            {videoGallery.map((video) => (
              <div
                key={video.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                  currentVideo?.id === video.id ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5'
                }`}
                onClick={() => selectFromGallery(video)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full sm:w-16 h-24 sm:h-12 object-cover rounded"
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.src = `https://img.youtube.com/vi/${video.id}/default.jpg`;
                      e.target.dataset.fallback = true;
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{video.title}</p>
                  <p className="text-white/60 text-xs">
                    Added {new Date(video.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromGallery(video.id);
                  }}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-200"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/60 text-sm text-center py-4">
            No videos saved yet. Add some YouTube videos to build your study library!
          </p>
        )}
      </div>
    </div>
  );
};

export default YouTubePlayer;
