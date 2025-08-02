import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, SparklesIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { gsap } from 'gsap';
import { fetchGeminiResponse } from '../utils/gemini';
import { messagesCollection, addDoc, getDocs, query, orderBy, serverTimestamp } from '../../firebase/config';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastAIText, setLastAIText] = useState('');
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(chatRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const q = query(messagesCollection, orderBy('timestamp'));
        const snapshot = await getDocs(q);
        const loaded = snapshot.docs.map(doc => doc.data());
        setMessages(loaded);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userInput = inputMessage;
    const userMessage = {
      id: generateId(),
      text: userInput,
      sender: 'user',
      timestamp: serverTimestamp()
    };

    setMessages(prev => [...prev, { ...userMessage, timestamp: new Date() }]);
    setInputMessage('');
    await addDoc(messagesCollection, userMessage);
    setIsTyping(true);

    try {
      const aiText = await fetchGeminiResponse(userInput);
      setLastAIText(aiText);
      speak(aiText);

      const aiMessage = {
        id: generateId(),
        text: aiText,
        sender: 'ai',
        timestamp: serverTimestamp()
      };

      setMessages(prev => [...prev, { ...aiMessage, timestamp: new Date() }]);
      await addDoc(messagesCollection, aiMessage);
    } catch (err) {
      console.error("Gemini error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "📊 Explain calculus derivatives step-by-step",
    "🧪 Help me understand photosynthesis process",
    "📝 Best study techniques for memorization",
    "🤖 What is machine learning in simple terms?",
    "⚛️ Explain quantum physics basics",
    "📚 How to write a compelling essay?",
    "🧠 Memory improvement techniques",
    "⏰ Create a study schedule for me"
  ];

  const formatTime = (timestamp) => {
    try {
      const date = timestamp?.toDate
        ? timestamp.toDate()
        : new Date(timestamp?.seconds ? timestamp.seconds * 1000 : timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return '';
    }
  };

  return (
    <div ref={chatRef} className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20 h-[500px] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <SparklesIcon className="w-6 h-6 text-purple-400 animate-spin" />
        <h3 className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          AI Study Assistant GPT-4 (Gemini)
        </h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-green-400">Online</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 relative z-10">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-sm px-4 py-3 rounded-2xl shadow-lg ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/10 text-white border border-white/20 backdrop-blur-sm'
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
              <p className="text-xs opacity-60 mt-2">{formatTime(message.timestamp)}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-xs text-white/60 mt-1">AI is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInputMessage(q);
                setTimeout(() => sendMessage(), 50);
              }}
              className="text-xs px-3 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-white/80 hover:text-white rounded-full transition-all duration-200 hover:scale-105 border border-white/10"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about your studies... 🤔"
            className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transform hover:scale-110 transition-all duration-200 shadow-lg"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => speak(lastAIText)}
            className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200"
          >
            <SpeakerWaveIcon className="w-4 h-4" /> Speak Again
          </button>
          <button
            onClick={stopSpeech}
            className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200"
          >
            <SpeakerXMarkIcon className="w-4 h-4" /> Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
