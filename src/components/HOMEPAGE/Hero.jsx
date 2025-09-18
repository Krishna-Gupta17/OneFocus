import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Play, ArrowRight, X } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const shapesRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // YouTube video ID (replace with your actual video ID)
  const videoId = 'dQw4w9WgXcQ';

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = ''; // Re-enable scrolling
    setVideoLoaded(false);
  };

  // Close modal when clicking outside the content
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.keyCode === 27 && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create floating shapes animation
      const shapes = shapesRef.current?.children;
      if (shapes) {
        Array.from(shapes).forEach((shape, index) => {
          gsap.to(shape, {
            y: "random(-50, 50)",
            x: "random(-30, 30)",
            rotation: "random(-15, 15)",
            duration: "random(3, 5)",
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut",
            delay: index * 0.2
          });
        });
      }

      // Hero content animations
      const tl = gsap.timeline({ delay: 0.8 });
      
      tl.fromTo(titleRef.current,
        { y: 100, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
      )
      .fromTo(subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(buttonsRef.current?.children || [],
        { y: 30, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.2, ease: "back.out(1.7)" },
        "-=0.4"
      );

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Shapes */}
      <div ref={shapesRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
            Unlock Relentless Focus
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
            Unleash Unstoppable You
          </span>
        </h1>

        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Transform your study sessions with AI-powered focus tools, personalized schedules, 
          and immersive soundscapes designed to maximize your learning potential.
        </p>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group relative bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:scale-105 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button 
            onClick={openModal}
            className="group flex items-center gap-3 text-slate-300 hover:text-white px-8 py-4 rounded-full border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/50"
          >
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors duration-300">
              <Play className="w-5 h-5 ml-1 group-hover:text-cyan-400 transition-colors duration-300" />
            </div>
            <span className="text-lg">Watch Demo</span>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center group">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              1st
            </div>
            <div className="text-slate-400 mt-2">Hackathon Ranking</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              95%
            </div>
            <div className="text-slate-400 mt-2">Focus Improvement</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              10+
            </div>
            <div className="text-slate-400 mt-2">Features</div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="relative bg-slate-900 rounded-xl w-full max-w-4xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500">
              <h2 className="text-xl font-bold text-slate-900 text-center">One Focus Demo</h2>
            </div>
            
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-900/80 text-white rounded-full flex items-center justify-center hover:bg-cyan-500 transition-colors duration-300 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
              {!videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
              )}
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setVideoLoaded(true)}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;