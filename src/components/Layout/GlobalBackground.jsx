import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// A reusable global background that mimics LandingPage: dark slate base,
// faint cyan/blue gradient blobs, and a subtle grid overlay.
// Positioned behind all pages using -z-10 and absolute positioning.

const GlobalBackground = () => {
  const shapesRef = useRef(null);

  useEffect(() => {
    const shapes = shapesRef.current?.children;
    if (!shapes) return;

    // Gentle floating animation similar to LandingPage
    Array.from(shapes).forEach((shape, idx) => {
      gsap.to(shape, {
        y: 'random(-40, 40)',
        x: 'random(-25, 25)',
        rotation: 'random(-10, 10)',
        duration: 'random(4, 7)',
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        delay: idx * 0.2,
      });
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-slate-950 overflow-hidden">
      {/* Animated gradient blobs */}
      <div ref={shapesRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-10 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-xl" />
        <div className="absolute top-1/3 right-12 w-28 h-28 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-lg" />
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-lg" />
        <div className="absolute bottom-10 right-1/3 w-36 h-36 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-2xl" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),` +
              `linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    </div>
  );
};

export default GlobalBackground;
