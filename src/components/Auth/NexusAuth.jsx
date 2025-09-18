
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import gsap from 'gsap';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'boxicons/css/boxicons.min.css';
import 'tailwindcss/tailwind.css';
import { useRef } from 'react';


const NexusAuth = () => {
  const { user, loading, login, register } = useAuth();
  const [activePanel, setActivePanel] = useState('login');
  const [notification, setNotification] = useState({ message: 'Welcome to Nexus Secure Portal', type: 'info', show: false });
  const [errors, setErrors] = useState({ login: '', register: '', alert: '' });
  // Create refs for DOM elements
  const particleContainerRef = useRef(null);
  const shapesRef = useRef([]);
  const bracketsRef = useRef([]);
  const notificationRef = useRef(null);

  useEffect(() => {
    // Show initial notification
    setNotification({ message: 'Welcome to Nexus Secure Portal', type: 'info', show: true });
    gsap.to('#notification', {
      duration: 0.7,
      x: 0,
      opacity: 1,
      ease: 'power4.out',
      delay: 1,
      onComplete: () => {
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
          gsap.to('#notification', { duration: 0.7, x: '100%', opacity: 0, ease: 'power4.in' });
        }, 3000);
      },
    });

    // Generate particles
      if (particleContainerRef.current) {
      // Generate particles
      for (let i = 0; i < 45; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particleContainerRef.current.appendChild(particle);
      }
    }


    // Background animations
    if (shapesRef.current.length > 0) {
      shapesRef.current.forEach((shape, index) => {
      gsap.to(shape, {
        duration: 12 + index * 4,
        x: () => `+=${Math.cos(index) * 120}`,
        y: () => `+=${Math.sin(index) * 120}`,
        rotation: `random(-90, 90)`,
        scale: `random(0.5, 1.5)`,
        opacity: `random(0.3, 0.6)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.8,
      });
      gsap.to(shape, {
        duration: 3 + index * 1,
        '--gradient-start': '#06b6d4',
        '--gradient-end': '#7e30e1',
        filter: 'blur(50px)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        onUpdate: () => {
          shape.style.background = `linear-gradient(45deg, ${shape.style.getPropertyValue('--gradient-start')}, ${shape.style.getPropertyValue('--gradient-end')})`;
        },
      });
    });
    }
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
      gsap.to(particle, {
        duration: 7 + Math.random() * 7,
        x: `random(-150, 150)`,
        y: `random(-150, 150)`,
        opacity: `random(0.1, 0.9)`,
        scale: `random(0.3, 1.7)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.4,
        onRepeat: () => {
          if (Math.random() < 0.1) {
            gsap.to(particle, {
              duration: 0.5,
              x: `+=${Math.random() * 50 - 25}`,
              y: `+=${Math.random() * 50 - 25}`,
              scale: 2,
              opacity: 1,
              yoyo: true,
              repeat: 1,
              ease: 'power2.out',
            });
          }
        },
      });
    });

    const colorStops = ['#7e30e1', '#06b6d4', '#3e7dc7'];
    gsap.to('.bracket-main.bracket-left', {
      duration: 15,
      y: '+=70',
      rotation: `random(-10, 10)`,
      scale: `random(0.9, 1.1)`,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      onRepeat: () => {
        gsap.to('.bracket-main.bracket-left', {
          duration: 2.5,
          borderColor: colorStops[Math.floor(Math.random() * colorStops.length)],
          boxShadow: `0 0 45px ${colorStops[Math.floor(Math.random() * colorStops.length)]}66`,
          yoyo: true,
          repeat: 1,
          ease: 'power3.inOut',
        });
      },
    });

    gsap.to('.bracket-main.bracket-right', {
      duration: 15,
      y: '-=70',
      rotation: `random(-10, 10)`,
      scale: `random(0.9, 1.1)`,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.2,
      onRepeat: () => {
        gsap.to('.bracket-main.bracket-right', {
          duration: 2.5,
          borderColor: colorStops[Math.floor(Math.random() * colorStops.length)],
          boxShadow: `0 0 45px ${colorStops[Math.floor(Math.random() * colorStops.length)]}66`,
          yoyo: true,
          repeat: 1,
          ease: 'power3.inOut',
        });
      },
    });

    gsap.to('.bracket-main.bracket-top', {
      duration: 15,
      x: '+=80',
      rotation: `random(-7, 7)`,
      scale: `random(0.9, 1.1)`,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 2.4,
      onRepeat: () => {
        gsap.to('.bracket-main.bracket-top', {
          duration: 2.5,
          borderColor: colorStops[Math.floor(Math.random() * colorStops.length)],
          boxShadow: `0 0 45px ${colorStops[Math.floor(Math.random() * colorStops.length)]}66`,
          yoyo: true,
          repeat: 1,
          ease: 'power3.inOut',
        });
      },
    });

    gsap.to('.bracket-main.bracket-bottom', {
      duration: 15,
      x: '-=80',
      rotation: `random(-7, 7)`,
      scale: `random(0.9, 1.1)`,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 3.6,
      onRepeat: () => {
        gsap.to('.bracket-main.bracket-bottom', {
          duration: 2.5,
          borderColor: colorStops[Math.floor(Math.random() * colorStops.length)],
          boxShadow: `0 0 45px ${colorStops[Math.floor(Math.random() * colorStops.length)]}66`,
          yoyo: true,
          repeat: 1,
          ease: 'power3.inOut',
        });
      },
    });

    gsap.to('.bracket-secondary.bracket-left', {
      duration: 18,
      y: '+=50',
      rotation: `random(-8, 8)`,
      opacity: 0.25,
      scale: `random(0.5, 0.7)`,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.8,
    });

    gsap.to('.bracket-secondary.bracket-right', {
      duration: 18,
      y: '-=50',
      rotation: `random(-8, 8)`,
      opacity: 0.25,
      scale: `random(0.5, 0.7)`,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.8,
    });

    gsap.to('.bracket-secondary.bracket-top', {
      duration: 18,
      x: '+=60',
      rotation: `random(-5, 5)`,
      opacity: 0.25,
      scale: `random(0.5, 0.7)`,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 2.8,
    });

    gsap.to('.bracket-secondary.bracket-bottom', {
      duration: 18,
      x: '-=60',
      rotation: `random(-5, 5)`,
      opacity: 0.25,
      scale: `random(0.5, 0.7)`,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 3.8,
    });

    // Mouse interaction (desktop only)
    if (window.innerWidth > 900) {
      const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 100;
        const y = (e.clientY / window.innerHeight - 0.5) * 100;
        shapes.forEach((shape, index) => {
          gsap.to(shape, {
            duration: 1.3,
            x: x * (0.7 + index * 0.4),
            y: y * (0.7 + index * 0.4),
            ease: 'power3.out',
          });
        });
        particles.forEach((particle, index) => {
          const dx = e.clientX / window.innerWidth - particle.offsetLeft / window.innerWidth;
          const dy = e.clientY / window.innerHeight - particle.offsetTop / window.innerHeight;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = Math.min(60 / (distance + 0.1), 40);
          gsap.to(particle, {
            duration: 1.6,
            x: `-=${dx * force}`,
            y: `-=${dy * force}`,
            ease: 'power3.out',
          });
        });
      };
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const handlePanelToggle = (panel) => {
    setActivePanel(panel);
    gsap.to('.overlay', {
      x: panel === 'register' ? '33.33%' : panel === 'alert' ? '66.66%' : 0,
      duration: 0.9,
      ease: 'power4.inOut',
    });
  };

  const showNotification = (message, type) => {
    setNotification({ message, type, show: true });
    gsap.to('#notification', {
      duration: 0.7,
      x: 0,
      opacity: 1,
      ease: 'power4.out',
      onComplete: () => {
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
          gsap.to('#notification', { duration: 0.7, x: '100%', opacity: 0, ease: 'power4.in' });
        }, 3000);
      },
    });
  };

  const showError = (form, message) => {
    setErrors(prev => ({ ...prev, [form]: message }));
    gsap.fromTo(`#${form}-error`, { opacity: 0, y: 12 }, { duration: 0.7, opacity: 1, y: 0, ease: 'power4.out' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();
    const submitBtn = e.target.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;

    gsap.to(submitBtn, {
      duration: 0.5,
      opacity: 0.7,
      scale: 0.95,
      onComplete: () => {
        submitBtn.textContent = 'Processing...';
        gsap.to(submitBtn, { duration: 0.5, opacity: 1, scale: 1, ease: 'power4.out' });
      },
    });

    if (!email || !password) {
      showError('login', 'Please fill in all fields.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showError('login', 'Please enter a valid email.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    try {
      await login(email, password);
      showNotification('Login successful! Redirecting...', 'success');
    } catch (error) {
      showError('login', error.message || 'Invalid credentials.');
    } finally {
      gsap.to(submitBtn, {
        duration: 0.5,
        opacity: 0.7,
        scale: 0.95,
        onComplete: () => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          gsap.to(submitBtn, { duration: 0.5, opacity: 1, scale: 1, ease: 'power4.out' });
        },
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();
    const submitBtn = e.target.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;

    gsap.to(submitBtn, {
      duration: 0.5,
      opacity: 0.7,
      scale: 0.95,
      onComplete: () => {
        submitBtn.textContent = 'Processing...';
        gsap.to(submitBtn, { duration: 0.5, opacity: 1, scale: 1, ease: 'power4.out' });
      },
    });

    if (!name || !email || !password) {
      showError('register', 'Please fill in all fields.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showError('register', 'Please enter a valid email.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    if (password.length < 8) {
      showError('register', 'Password must be at least 8 characters.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    try {
      await register(email, password);
      showNotification('Account created successfully!', 'success');
    } catch (error) {
      showError('register', error.message || 'Registration failed.');
    } finally {
      gsap.to(submitBtn, {
        duration: 0.5,
        opacity: 0.7,
        scale: 0.95,
        onComplete: () => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          gsap.to(submitBtn, { duration: 0.5, opacity: 1, scale: 1, ease: 'power4.out' });
        },
      });
    }
  };

  const handleAlert = async (e) => {
    e.preventDefault();
    const phoneNumber = e.target.phoneNumber.value.trim();
    const scheduledTime = e.target.scheduledTime.value;
    const message = e.target.message.value.trim() || 'Reminder: Your scheduled alert is here!';
    const submitBtn = e.target.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;

    gsap.to(submitBtn, {
      duration: 0.5,
      opacity: 0.7,
      scale: 0.95,
      onComplete: () => {
        submitBtn.textContent = 'Processing...';
        gsap.to(submitBtn, { duration: 0.5, opacity: 1, scale: 1, ease: 'power4.out' });
      },
    });

    if (!phoneNumber || !scheduledTime) {
      showError('alert', 'Please fill in phone number and time.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    if (!/\+[1-9][0-9]{1,14}/.test(phoneNumber)) {
      showError('alert', 'Please enter a valid phone number with country code (e.g., +1234567890).');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    const now = new Date();
    const scheduled = new Date(scheduledTime);
    if (scheduled <= now) {
      showError('alert', 'Please select a future time.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    try {
      const response = await fetch('http://your-server-url:3000/api/create-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, scheduledTime, message }),
      });
      const result = await response.json();
      if (result.success) {
        showNotification('Call alert scheduled successfully!', 'success');
      } else {
        showError('alert', result.message || 'Failed to schedule alert.');
      }
    } catch (error) {
      showError('alert', 'An error occurred. Please try again.');
    } finally {
      gsap.to(submitBtn, {
        duration: 0.5,
        opacity: 0.7,
        scale: 0.95,
        onComplete: () => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          gsap.to(submitBtn, { duration: 0.5, opacity: 1, scale: 1, ease: 'power4.out' });
        },
      });
    }
  };

  const togglePassword = (id) => {
    const input = document.getElementById(id);
    const toggle = input.nextElementSibling.nextElementSibling;
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    toggle.classList.toggle('bx-hide');
    toggle.classList.toggle('bx-show');
    gsap.to(toggle, { duration: 0.3, scale: 1.3, yoyo: true, repeat: 1, ease: 'power3.out' });
  };

  if (loading) return <div className="text-white text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-4">
      <style>
        {`
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Montserrat', sans-serif; }
          .background-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -2; }
          .brackets { position: absolute; width: 100%; height: 100%; }
          .bracket { position: absolute; border: 4px solid rgba(126, 48, 225, 0.3); border-radius: 12px; background: linear-gradient(45deg, rgba(126, 48, 225, 0.2), rgba(199, 62, 156, 0.2)); transition: border-color 0.5s ease, box-shadow 0.5s ease; }
          .bracket-main { box-shadow: 0 0 30px rgba(126, 48, 225, 0.4); }
          .bracket-secondary { opacity: 0.35; transform: scale(0.6); }
          .bracket-left { left: 5%; top: 50%; transform: translateY(-50%); width: 90px; height: 300px; border-right: none; border-top-right-radius: 0; border-bottom-right-radius: 0; }
          .bracket-right { right: 5%; top: 50%; transform: translateY(-50%); width: 90px; height: 300px; border-left: none; border-top-left-radius: 0; border-bottom-left-radius: 0; }
          .bracket-top { top: 10%; left: 50%; transform: translateX(-50%); width: 300px; height: 90px; border-bottom: none; border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
          .bracket-bottom { bottom: 10%; left: 50%; transform: translateX(-50%); width: 300px; height: 90px; border-top: none; border-top-left-radius: 0; border-top-right-radius: 0; }
          .bracket:hover { border-color: rgba(126, 48, 225, 0.8); box-shadow: 0 0 35px rgba(126, 48, 225, 0.6); }
          .particles { position: absolute; width: 100%; height: 100%; }
          .particle { position: absolute; width: 9px; height: 9px; background: radial-gradient(circle, rgba(126, 48, 225, 0.9), transparent); border-radius: 50%; pointer-events: none; }
          .floating-shapes { position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: -1; }
          .shape { position: absolute; border-radius: 50%; opacity: 0.45; transition: background 2s ease; }
          .shape-1 { width: 320px; height: 320px; background: linear-gradient(45deg, #7e30e1, #06b6d4); top: 10%; left: 10%; }
          .shape-2 { width: 260px; height: 260px; background: linear-gradient(45deg, #06b6d4, #3e7dc7); top: 60%; right: 15%; }
          .shape-3 { width: 280px; height: 280px; background: linear-gradient(45deg, #3e7dc7, #7e30e1); bottom: 20%; left: 25%; }
          .shape-4 { width: 230px; height: 230px; background: linear-gradient(45deg, #06b6d4, #7e30e1); top: 30%; right: 30%; }
          .container { background: rgba(255, 255, 255, 0.95); border-radius: 22px; box-shadow: 0 18px 55px rgba(0, 0, 0, 0.35); position: relative; overflow: hidden; width: 1000px; max-width: 95%; min-height: 650px; z-index: 10; }
          .form-container { position: absolute; top: 0; height: 100%; width: 50%; transition: all 0.8s ease-in-out; display: flex; align-items: center; justify-content: center; padding: 45px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(11px); }
          .login-container { left: 0; z-index: 2; }
          .right-panel-active .login-container { transform: translateX(100%); opacity: 0; }
          .alert-panel-active .login-container { transform: translateX(200%); opacity: 0; }
          .register-container { left: 0; opacity: 0; z-index: 1; }
          .right-panel-active .register-container { transform: translateX(100%); opacity: 1; z-index: 5; }
          .alert-panel-active .register-container { transform: translateX(200%); opacity: 0; }
          .alert-container { left: 0; opacity: 0; z-index: 1; }
          .alert-panel-active .alert-container { transform: translateX(100%); opacity: 1; z-index: 5; }
          @keyframes show { 0%, 49.99% { opacity: 0; z-index: 1; } 50%, 100% { opacity: 1; z-index: 5; } }
          .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.8s ease-in-out; z-index: 100; }
          .right-panel-active .overlay-container { transform: translateX(-100%); }
          .alert-panel-active .overlay-container { transform: translateX(-200%); }
          .overlay { background: linear-gradient(45deg, #7e30e1, #06b6d4); position: relative; left: -100%; height: 100%; width: 300%; transform: translateX(0); transition: transform 0.8s ease-in-out; }
          .right-panel-active .overlay { transform: translateX(33.33%); }
          .alert-panel-active .overlay { transform: translateX(66.66%); }
          .overlay-panel { position: absolute; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 45px; text-align: center; top: 0; height: 100%; width: 33.33%; transition: transform 0.8s ease-in-out; color: #fff; }
          .overlay-login { transform: translateX(-20%); }
          .right-panel-active .overlay-login, .alert-panel-active .overlay-login { transform: translateX(0); }
          .overlay-register { left: 33.33%; transform: translateX(0); }
          .right-panel-active .overlay-register { transform: translateX(20%); }
          .alert-panel-active .overlay-register { transform: translateX(0); }
          .overlay-alert { left: 66.66%; transform: translateX(0); }
          .alert-panel-active .overlay-alert { transform: translateX(20%); }
          .input-box { position: relative; margin: 18px 0; }
          input, textarea { background: rgba(255, 255, 255, 0.9); border: none; border-radius: 11px; padding: 16px 16px 16px 48px; width: 100%; font-size: 1rem; color: #333; transition: all 0.3s ease; }
          textarea { resize: vertical; min-height: 90px; max-height: 170px; }
          input:focus, textarea:focus { outline: none; background: #fff; box-shadow: 0 0 0 3px rgba(126, 48, 225, 0.3); }
          .input-box label { position: absolute; top: 50%; left: 48px; transform: translateY(-50%); color: #666; font-size: 1rem; font-weight: 500; pointer-events: none; transition: all 0.3s ease; }
          .input-box input:focus + label, .input-box input:valid + label, .input-box textarea:focus + label, .input-box textarea:valid + label { top: -11px; left: 22px; font-size: 0.85rem; font-weight: 600; background: linear-gradient(45deg, #7e30e1, #06b6d4); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
          .input-box i.icon { position: absolute; top: 50%; left: 16px; transform: translateY(-50%); font-size: 1.3rem; color: #7e30e1; }
          .input-box i.toggle-password { position: absolute; top: 50%; right: 16px; transform: translateY(-50%); font-size: 1.3rem; color: #666; cursor: pointer; transition: color 0.3s ease; }
          .input-box i.toggle-password:hover { color: #7e30e1; }
          .error-message { color: #ff4d4d; font-size: 0.95rem; margin-top: 11px; text-align: center; display: none; opacity: 0; }
          .error-message.show { display: block; }
          .forgot-password { color: #7e30e1; font-size: 0.95rem; text-decoration: none; margin: 18px 0; transition: color 0.3s ease; }
          .forgot-password:hover { text-decoration: underline; color: #06b6d4; }
          .navigation-links { font-size: 0.95rem; color: #666; }
          .navigation-links a { color: #7e30e1; text-decoration: none; font-weight: 600; }
          .navigation-links a:hover { text-decoration: underline; color: #06b6d4; }
          @media (max-width: 900px) {
            .container { width: 95%; min-height: 550px; }
            .form-container { width: 100%; position: relative; left: 0 !important; transform: none !important; opacity: 1 !important; padding: 25px 18px; }
            .right-panel-active .login-container, .alert-panel-active .login-container, .right-panel-active .register-container, .alert-panel-active .register-container, .alert-panel-active .alert-container { display: none; }
            .right-panel-active .register-container, .alert-panel-active .alert-container { display: flex; }
            .overlay-container { display: none; }
            .bracket, .particle { display: none; }
            .shape { opacity: 0.2; }
            .social-container a { width: 46px; height: 46px; font-size: 1.1rem; }
            input, textarea { padding: 14px 14px 14px 42px; font-size: 0.95rem; }
            .input-box label { font-size: 0.95rem; left: 42px; }
            .input-box input:focus + label, .input-box input:valid + label, .input-box textarea:focus + label, .input-box textarea:valid + label { top: -9px; font-size: 0.75rem; }
            .input-box i.icon { font-size: 1.1rem; left: 14px; }
            .input-box i.toggle-password { font-size: 1.1rem; right: 14px; }
            button { padding: 14px; font-size: 0.85rem; }
          }
        `}
      </style>

      <div className="background-container">
        <div className="brackets">
          <div className="bracket bracket-main bracket-left" onMouseEnter={e => gsap.to(e.target, { duration: 0.5, borderColor: 'rgba(126, 48, 225, 0.8)', scale: 1.07, boxShadow: '0 0 35px rgba(126, 48, 225, 0.6)', ease: 'power3.out' })}
            onMouseLeave={e => gsap.to(e.target, { duration: 0.5, borderColor: 'rgba(126, 48, 225, 0.3)', scale: 1, boxShadow: 'none', ease: 'power3.out' })}></div>
          <div className="bracket bracket-main bracket-right" onMouseEnter={e => gsap.to(e.target, { duration: 0.5, borderColor: 'rgba(126, 48, 225, 0.8)', scale: 1.07, boxShadow: '0 0 35px rgba(126, 48, 225, 0.6)', ease: 'power3.out' })}
            onMouseLeave={e => gsap.to(e.target, { duration: 0.5, borderColor: 'rgba(126, 48, 225, 0.3)', scale: 1, boxShadow: 'none', ease: 'power3.out' })}></div>
          <div className="bracket bracket-main bracket-top" onMouseEnter={e => gsap.to(e.target, { duration: 0.5, borderColor: 'rgba(126, 48, 225, 0.8)', scale: 1.07, boxShadow: '0 0 35px rgba(126, 48, 225, 0.6)', ease: 'power3.out' })}
            onMouseLeave={e => gsap.to(e.target, { duration: 0.5, borderColor: 'rgba(126, 48, 225, 0.3)', scale: 1, boxShadow: 'none', ease: 'power3.out' })}></div>
          <div className="bracket bracket-main bracket-bottom" onMouseEnter={e => gsap.to(e.target, { duration: 0.5, borderColor: 'rgba(126, 48, 225, 0.8)', scale: 1.07, boxShadow: '0 0 35px rgba(126, 48, 225, 0.6)', ease: 'power3.out' })}
            onMouseLeave={e => gsap.to(e.target, { duration: 0.5, borderColor: 'rgba(126, 48, 225, 0.3)', scale: 1, boxShadow: 'none', ease: 'power3.out' })}></div>
          <div className="bracket bracket-secondary bracket-left" style={{ top: '30%', left: '8%' }}></div>
          <div className="bracket bracket-secondary bracket-right" style={{ top: '70%', right: '8%' }}></div>
          <div className="bracket bracket-secondary bracket-top" style={{ top: '5%', width: '220px' }}></div>
          <div className="bracket bracket-secondary bracket-bottom" style={{ bottom: '5%', width: '220px' }}></div>
        </div>
        <div className="particles"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div id="notification" className={`fixed top-5 right-5 p-4 bg-white bg-opacity-95 border-l-4 rounded-lg shadow-lg transform translate-x-full opacity-0 z-[1000] text-gray-800 text-sm ${notification.type === 'success' ? 'border-green-400' : notification.type === 'error' ? 'border-red-400' : 'border-purple-600'} ${notification.show ? 'show' : ''}`}>
        {notification.message}
      </div>

      <div className={`container ${activePanel === 'register' ? 'right-panel-active' : activePanel === 'alert' ? 'alert-panel-active' : ''}`}>
        <div className="form-container login-container">
          <form onSubmit={handleLogin} className="flex flex-col w-full p-6">
            <h2 className="font-bold text-3xl text-gray-800 mb-6 text-shadow-md">Sign In</h2>
            <div className="social-container flex justify-center gap-4 mb-6">
              <a href="#" className="social border-2 border-purple-600 border-opacity-30 rounded-full w-12 h-12 flex items-center justify-center text-purple-600 bg-white bg-opacity-90 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300" aria-label="Sign in with Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social border-2 border-purple-600 border-opacity-30 rounded-full w-12 h-12 flex items-center justify-center text-purple-600 bg-white bg-opacity-90 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300" aria-label="Sign in with Google">
                <i className="fab fa-google"></i>
              </a>
              <a href="#" className="social border-2 border-purple-600 border-opacity-30 rounded-full w-12 h-12 flex items-center justify-center text-purple-600 bg-white bg-opacity-90 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300" aria-label="Sign in with LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <span className="text-gray-600 mb-4">or use your account</span>
            <div className="input-box relative mb-4">
              <input type="email" id="login-email" name="email" required aria-label="Email" className="w-full p-4 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:bg-white focus:shadow-outline-purple transition-all duration-300" onFocus={e => gsap.to(e.target, { duration: 0.5, boxShadow: '0 0 0 3px rgba(126, 48, 225, 0.3)', scale: 1.02, ease: 'power4.out' })}
                onBlur={e => gsap.to(e.target, { duration: 0.5, boxShadow: 'none', scale: 1, ease: 'power4.out' })} />
              <label htmlFor="login-email" className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-600 font-medium pointer-events-none transition-all duration-300">Email</label>
              <i className="bx bxs-envelope icon absolute top-1/2 left-4 transform -translate-y-1/2 text-purple-600 text-lg"></i>
            </div>
            <div className="input-box relative mb-4">
              <input type="password" id="login-password" name="password" required aria-label="Password" className="w-full p-4 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:bg-white focus:shadow-outline-purple transition-all duration-300" onFocus={e => gsap.to(e.target, { duration: 0.5, boxShadow: '0 0 0 3px rgba(126, 48, 225, 0.3)', scale: 1.02, ease: 'power4.out' })}
                onBlur={e => gsap.to(e.target, { duration: 0.5, boxShadow: 'none', scale: 1, ease: 'power4.out' })} />
              <label htmlFor="login-password" className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-600 font-medium pointer-events-none transition-all duration-300">Password</label>
              <i className="bx bxs-lock-alt icon absolute top-1/2 left-4 transform -translate-y-1/2 text-purple-600 text-lg"></i>
              <i className="bx bx-hide toggle-password absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 text-lg cursor-pointer hover:text-purple-600 transition-colors duration-300" onClick={() => togglePassword('login-password')}></i>
            </div>
            <a href="#" className="forgot-password text-purple-600 text-sm mb-4 hover:underline hover:text-pink-600 transition-colors duration-300">Forgot your password?</a>
            <button type="submit" className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 uppercase cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              onMouseEnter={e => !e.target.disabled && gsap.to(e.target, { duration: 0.5, scale: 1.07, boxShadow: '0 9px 28px rgba(126, 48, 225, 0.6)', background: 'linear-gradient(45deg, #06b6d4, #7e30e1)', ease: 'power4.out' })}
              onMouseLeave={e => gsap.to(e.target, { duration: 0.5, scale: 1, boxShadow: 'none', background: 'linear-gradient(45deg, #7e30e1, #06b6d4)', ease: 'power4.out' })}>Sign In</button>
            <p id="login-error" className={`error-message text-red-500 text-sm mt-3 text-center ${errors.login ? 'show' : ''}`}>{errors.login}</p>
            <p className="navigation-links text-gray-600 text-sm mt-4">
              Don't have an account? <a href="#" className="text-purple-600 font-semibold hover:underline hover:text-pink-600" onClick={() => handlePanelToggle('register')}>Sign Up</a> | 
              <a href="#" className="text-purple-600 font-semibold hover:underline hover:text-pink-600" onClick={() => handlePanelToggle('alert')}>Set Call Alert</a>
            </p>
          </form>
        </div>

        <div className="form-container register-container">
          <form onSubmit={handleRegister} className="flex flex-col w-full p-6">
            <h2 className="font-bold text-3xl text-gray-800 mb-6 text-shadow-md">Create Account</h2>
            <div className="social-container flex justify-center gap-4 mb-6">
              <a href="#" className="social border-2 border-purple-600 border-opacity-30 rounded-full w-12 h-12 flex items-center justify-center text-purple-600 bg-white bg-opacity-90 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300" aria-label="Sign up with Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social border-2 border-purple-600 border-opacity-30 rounded-full w-12 h-12 flex items-center justify-center text-purple-600 bg-white bg-opacity-90 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300" aria-label="Sign up with Google">
                <i className="fab fa-google"></i>
              </a>
              <a href="#" className="social border-2 border-purple-600 border-opacity-30 rounded-full w-12 h-12 flex items-center justify-center text-purple-600 bg-white bg-opacity-90 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300" aria-label="Sign up with LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <span className="text-gray-600 mb-4">or use your email for registration</span>
            <div className="input-box relative mb-4">
              <input type="text" id="register-name" name="name" required aria-label="Name" className="w-full p-4 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:bg-white focus:shadow-outline-purple transition-all duration-300" onFocus={e => gsap.to(e.target, { duration: 0.5, boxShadow: '0 0 0 3px rgba(126, 48, 225, 0.3)', scale: 1.02, ease: 'power4.out' })}
                onBlur={e => gsap.to(e.target, { duration: 0.5, boxShadow: 'none', scale: 1, ease: 'power4.out' })} />
              <label htmlFor="register-name" className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-600 font-medium pointer-events-none transition-all duration-300">Name</label>
              <i className="bx bxs-user icon absolute top-1/2 left-4 transform -translate-y-1/2 text-purple-600 text-lg"></i>
            </div>
            <div className="input-box relative mb-4">
              <input type="email" id="register-email" name="email" required aria-label="Email" className="w-full p-4 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:bg-white focus:shadow-outline-purple transition-all duration-300" onFocus={e => gsap.to(e.target, { duration: 0.5, boxShadow: '0 0 0 3px rgba(126, 48, 225, 0.3)', scale: 1.02, ease: 'power4.out' })}
                onBlur={e => gsap.to(e.target, { duration: 0.5, boxShadow: 'none', scale: 1, ease: 'power4.out' })} />
              <label htmlFor="register-email" className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-600 font-medium pointer-events-none transition-all duration-300">Email</label>
              <i className="bx bxs-envelope icon absolute top-1/2 left-4 transform -translate-y-1/2 text-purple-600 text-lg"></i>
            </div>
            <div className="input-box relative mb-4">
              <input type="password" id="register-password" name="password" required minLength="8" aria-label="Password" className="w-full p-4 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:bg-white focus:shadow-outline-purple transition-all duration-300" onFocus={e => gsap.to(e.target, { duration: 0.5, boxShadow: '0 0 0 3px rgba(126, 48, 225, 0.3)', scale: 1.02, ease: 'power4.out' })}
                onBlur={e => gsap.to(e.target, { duration: 0.5, boxShadow: 'none', scale: 1, ease: 'power4.out' })} />
              <label htmlFor="register-password" className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-600 font-medium pointer-events-none transition-all duration-300">Password</label>
              <i className="bx bxs-lock-alt icon absolute top-1/2 left-4 transform -translate-y-1/2 text-purple-600 text-lg"></i>
              <i className="bx bx-hide toggle-password absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 text-lg cursor-pointer hover:text-purple-600 transition-colors duration-300" onClick={() => togglePassword('register-password')}></i>
            </div>
            <button type="submit" className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 uppercase cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              onMouseEnter={e => !e.target.disabled && gsap.to(e.target, { duration: 0.5, scale: 1.07, boxShadow: '0 9px 28px rgba(126, 48, 225, 0.6)', background: 'linear-gradient(45deg, #06b6d4, #7e30e1)', ease: 'power4.out' })}
              onMouseLeave={e => gsap.to(e.target, { duration: 0.5, scale: 1, boxShadow: 'none', background: 'linear-gradient(45deg, #7e30e1, #06b6d4)', ease: 'power4.out' })}>Sign Up</button>
            <p id="register-error" className={`error-message text-red-500 text-sm mt-3 text-center ${errors.register ? 'show' : ''}`}>{errors.register}</p>
            <p className="navigation-links text-gray-600 text-sm mt-4">
              Already have an account? <a href="#" className="text-purple-600 font-semibold hover:underline hover:text-pink-600" onClick={() => handlePanelToggle('login')}>Sign In</a> | 
              <a href="#" className="text-purple-600 font-semibold hover:underline hover:text-pink-600" onClick={() => handlePanelToggle('alert')}>Set Call Alert</a>
            </p>
          </form>
        </div>

        <div className="form-container alert-container">
          <form onSubmit={handleAlert} className="flex flex-col w-full p-6">
            <h2 className="font-bold text-3xl text-gray-800 mb-6 text-shadow-md">Set Call Alert</h2>
            <div className="input-box relative mb-4">
              <input type="tel" id="alert-phone" name="phoneNumber" required pattern="\+[1-9][0-9]{1,14}" aria-label="Phone Number" className="w-full p-4 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:bg-white focus:shadow-outline-purple transition-all duration-300" onFocus={e => gsap.to(e.target, { duration: 0.5, boxShadow: '0 0 0 3px rgba(126, 48, 225, 0.3)', scale: 1.02, ease: 'power4.out' })}
                onBlur={e => gsap.to(e.target, { duration: 0.5, boxShadow: 'none', scale: 1, ease: 'power4.out' })} />
              <label htmlFor="alert-phone" className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-600 font-medium pointer-events-none transition-all duration-300">Phone Number (+1234567890)</label>
              <i className="bx bxs-phone icon absolute top-1/2 left-4 transform -translate-y-1/2 text-purple-600 text-lg"></i>
            </div>
            <div className="input-box relative mb-4">
              <input type="datetime-local" id="alert-time" name="scheduledTime" required aria-label="Scheduled Time" className="w-full p-4 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:bg-white focus:shadow-outline-purple transition-all duration-300" onFocus={e => gsap.to(e.target, { duration: 0.5, boxShadow: '0 0 0 3px rgba(126, 48, 225, 0.3)', scale: 1.02, ease: 'power4.out' })}
                onBlur={e => gsap.to(e.target, { duration: 0.5, boxShadow: 'none', scale: 1, ease: 'power4.out' })} />
              <label htmlFor="alert-time" className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-600 font-medium pointer-events-none transition-all duration-300">Scheduled Time</label>
              <i className="bx bxs-calendar icon absolute top-1/2 left-4 transform -translate-y-1/2 text-purple-600 text-lg"></i>
            </div>
            <div className="input-box relative mb-4">
              <textarea id="alert-message" name="message" aria-label="Reminder Message" className="w-full p-4 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:bg-white focus:shadow-outline-purple transition-all duration-300" onFocus={e => gsap.to(e.target, { duration: 0.5, boxShadow: '0 0 0 3px rgba(126, 48, 225, 0.3)', scale: 1.02, ease: 'power4.out' })}
                onBlur={e => gsap.to(e.target, { duration: 0.5, boxShadow: 'none', scale: 1, ease: 'power4.out' })}></textarea>
              <label htmlFor="alert-message" className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-600 font-medium pointer-events-none transition-all duration-300">Message (Optional)</label>
              <i className="bx bxs-message icon absolute top-1/2 left-4 transform -translate-y-1/2 text-purple-600 text-lg"></i>
            </div>
            <button type="submit" className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 uppercase cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              onMouseEnter={e => !e.target.disabled && gsap.to(e.target, { duration: 0.5, scale: 1.07, boxShadow: '0 9px 28px rgba(126, 48, 225, 0.6)', background: 'linear-gradient(45deg, #06b6d4, #7e30e1)', ease: 'power4.out' })}
              onMouseLeave={e => gsap.to(e.target, { duration: 0.5, scale: 1, boxShadow: 'none', background: 'linear-gradient(45deg, #7e30e1, #06b6d4)', ease: 'power4.out' })}>Set Alert</button>
            <p id="alert-error" className={`error-message text-red-500 text-sm mt-3 text-center ${errors.alert ? 'show' : ''}`}>{errors.alert}</p>
            <p className="navigation-links text-gray-600 text-sm mt-4">
              <a href="#" className="text-purple-600 font-semibold hover:underline hover:text-pink-600" onClick={() => handlePanelToggle('login')}>Sign In</a> | 
              <a href="#" className="text-purple-600 font-semibold hover:underline hover:text-pink-600" onClick={() => handlePanelToggle('register')}>Sign Up</a>
            </p>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-login">
              <h1 className="font-extrabold text-3xl mb-5">Welcome Back!</h1>
              <p className="text-base font-normal leading-6 mb-5 text-white text-opacity-90">Login to access your account or set a call alert</p>
              <button className="ghost rounded-lg border-2 border-white text-white font-semibold py-4 px-8 uppercase cursor-pointer hover:bg-white hover:bg-opacity-20 hover:-translate-y-1 transition-all duration-300" onClick={() => handlePanelToggle('login')}
                onMouseEnter={e => gsap.to(e.target, { duration: 0.5, scale: 1.07, background: 'rgba(255, 255, 255, 0.2)', ease: 'power4.out' })}
                onMouseLeave={e => gsap.to(e.target, { duration: 0.5, scale: 1, background: 'transparent', ease: 'power4.out' })}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-register">
              <h1 className="font-extrabold text-3xl mb-5">Hello, Friend!</h1>
              <p className="text-base font-normal leading-6 mb-5 text-white text-opacity-90">Register to start your journey or set a call alert</p>
              <button className="ghost rounded-lg border-2 border-white text-white font-semibold py-4 px-8 uppercase cursor-pointer hover:bg-white hover:bg-opacity-20 hover:-translate-y-1 transition-all duration-300" onClick={() => handlePanelToggle('register')}
                onMouseEnter={e => gsap.to(e.target, { duration: 0.5, scale: 1.07, background: 'rgba(255, 255, 255, 0.2)', ease: 'power4.out' })}
                onMouseLeave={e => gsap.to(e.target, { duration: 0.5, scale: 1, background: 'transparent', ease: 'power4.out' })}>Sign Up</button>
            </div>
            <div className="overlay-panel overlay-alert">
              <h1 className="font-extrabold text-3xl mb-5">Stay On Track!</h1>
              <p className="text-base font-normal leading-6 mb-5 text-white text-opacity-90">Schedule a call or SMS reminder, even if you close the page</p>
              <button className="ghost rounded-lg border-2 border-white text-white font-semibold py-4 px-8 uppercase cursor-pointer hover:bg-white hover:bg-opacity-20 hover:-translate-y-1 transition-all duration-300" onClick={() => handlePanelToggle('alert')}
                onMouseEnter={e => gsap.to(e.target, { duration: 0.5, scale: 1.07, background: 'rgba(255, 255, 255, 0.2)', ease: 'power4.out' })}
                onMouseLeave={e => gsap.to(e.target, { duration: 0.5, scale: 1, background: 'transparent', ease: 'power4.out' })}>Set Call Alert</button>
            </div>
          </div>
        </div>

         <div className="background-container">
        <div className="brackets">
          {/* Add ref to bracket elements */}
          <div ref={el => bracketsRef.current[0] = el} className="bracket bracket-main bracket-left"></div>
          <div ref={el => bracketsRef.current[1] = el} className="bracket bracket-main bracket-right"></div>
          <div ref={el => bracketsRef.current[2] = el} className="bracket bracket-main bracket-top"></div>
          <div ref={el => bracketsRef.current[3] = el} className="bracket bracket-main bracket-bottom"></div>
          <div ref={el => bracketsRef.current[4] = el} className="bracket bracket-secondary bracket-left" style={{ top: '30%', left: '8%' }}></div>
          <div ref={el => bracketsRef.current[5] = el} className="bracket bracket-secondary bracket-right" style={{ top: '70%', right: '8%' }}></div>
          <div ref={el => bracketsRef.current[6] = el} className="bracket bracket-secondary bracket-top" style={{ top: '5%', width: '220px' }}></div>
          <div ref={el => bracketsRef.current[7] = el} className="bracket bracket-secondary bracket-bottom" style={{ bottom: '5%', width: '220px' }}></div>
        </div>
        <div ref={particleContainerRef} className="particles"></div>
        <div className="floating-shapes">
          {/* Add ref to shape elements */}
          <div ref={el => shapesRef.current[0] = el} className="shape shape-1"></div>
          <div ref={el => shapesRef.current[1] = el} className="shape shape-2"></div>
          <div ref={el => shapesRef.current[2] = el} className="shape shape-3"></div>
          <div ref={el => shapesRef.current[3] = el} className="shape shape-4"></div>
        </div>
        </div>





      </div>
    </div>
  );
};

export default NexusAuth;