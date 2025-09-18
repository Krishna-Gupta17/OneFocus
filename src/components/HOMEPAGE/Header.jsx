import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Focus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate=useNavigate();
  const handleClick = () => {
    navigate("/getstarted"); // 👈 change "/dashboard" to your target route
  };
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header entrance animation
      gsap.fromTo(headerRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 }
      );

      // Logo animation
      gsap.fromTo(logoRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)", delay: 0.4 }
      );

      // Navigation items stagger animation
      gsap.fromTo(navRef.current?.children || [],
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.6 }
      );
    });

    return () => ctx.revert();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div ref={logoRef} className="flex items-center space-x-2 group cursor-pointer">
            <div className="relative">
              <Focus className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-300/30 transition-all duration-300">
              <img
  src="/logo_transparent_embedded (2).svg"
  alt="icon"
  className="w-12 h-13"
  style={{
    filter: "brightness(1.3) drop-shadow(0 0 20px rgba(0, 255, 255, 1))",
  }}
/></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              One Focus
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav ref={navRef} className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#pricing" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#about" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <button  
            onClick={handleClick}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:scale-105">
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-300 hover:text-cyan-400 transition-colors duration-300"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 py-4 border-t border-slate-800/50">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300">
                Features
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300">
                Pricing
              </a>
              <a href="#about" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300">
                About
              </a>
              <button 
              onClick={handleClick}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 w-fit">
                Get Started
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;