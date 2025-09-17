import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Uncomment only if needed
import Header from './Header';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';

// gsap.registerPlugin(ScrollTrigger); // Register only if used

const LandingPage = () => {
  const appRef = useRef(null);

  useEffect(() => {
    // Initial fade-in animation
    gsap.set(appRef.current, { opacity: 0 });
    gsap.to(appRef.current, { opacity: 1, duration: 0.8, ease: "power2.out" });

    // Cleanup scroll triggers (only if used)
    return () => {
      // ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={appRef} className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default LandingPage;
