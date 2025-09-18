import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  BarChart3, 
  Calendar, 
  Headphones, 
  Target, 
  Zap, 
  Shield,
  ArrowRight,
  Play
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  const handleClick = () => {
    navigate("/getstarted"); // 👈 change "/dashboard" to your target route
  };
  const features = [
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Visualize your learning journey with detailed analytics and performance insights.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered study plans that adapt to your learning style and availability.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Headphones,
      title: "Soundscapes",
      description: "Immersive audio environments designed to enhance focus and concentration.",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set, track, and achieve your learning objectives with intelligent reminders.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Focus Modes",
      description: "Customizable study environments that eliminate distractions completely.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays private with end-to-end encryption and local storage options.",
      color: "from-green-500 to-teal-500"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section title animation
      ScrollTrigger.create({
        trigger: titleRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(titleRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
          );
        }
      });

      // Feature cards stagger animation
      const cards = cardsRef.current?.children;
      if (cards) {
        ScrollTrigger.create({
          trigger: cardsRef.current,
          start: "top 70%",
          onEnter: () => {
            gsap.fromTo(cards,
              { y: 100, opacity: 0, scale: 0.8 },
              { 
                y: 0, 
                opacity: 1, 
                scale: 1, 
                duration: 0.8, 
                stagger: 0.15, 
                ease: "power3.out" 
              }
            );
          }
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500 to-blue-500 transform rotate-12 scale-150"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Maximum Focus
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to transform your study habits and achieve your learning goals
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Start Focusing?</h3>
              <p className="text-slate-300">Join the learners community of One Focus</p>
            </div>
            <button
            onClick={handleClick}
            className="group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:scale-105 flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }) => {
  const cardRef = useRef(null);
  const Icon = feature.icon;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -10,
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Icon */}
      <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-slate-300 leading-relaxed mb-6">
          {feature.description}
        </p>
        
        <button className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium group-hover:gap-3 transition-all duration-300">
          Learn More
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hover Effect Dots */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Features;