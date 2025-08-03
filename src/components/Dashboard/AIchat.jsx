import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fetchGeminiResponse } from '../utils/gemini';
import {
  messagesCollection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc
} from '../../firebase/config';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastAIText, setLastAIText] = useState('');
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchMessages = async () => {
      const q = query(
        messagesCollection,
        where('userId', '==', user.uid),
        orderBy('timestamp')
      );
      const snapshot = await getDocs(q);
      const loaded = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
      setMessages(loaded);
    };
    fetchMessages();
  }, [user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userInput = inputMessage;
    const userMessage = {
      id: crypto.randomUUID(),
      text: userInput,
      sender: 'user',
      userId: user.uid,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    scrollToBottom();
    await addDoc(messagesCollection, userMessage);

    setIsTyping(true);
    try {
      const aiText = await fetchGeminiResponse(userInput);
      setLastAIText(aiText); // Only save it for speaking manually

      const aiMessage = {
        id: crypto.randomUUID(),
        text: aiText,
        sender: 'ai',
        userId: user.uid,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      scrollToBottom();
      await addDoc(messagesCollection, aiMessage);
    } catch (err) {
      console.error("Gemini error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChatHistory = async () => {
    if (!user) return;
    const q = query(messagesCollection, where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(docSnap => deleteDoc(doc(messagesCollection, docSnap.id))));
    setMessages([]);
    stopSpeech();
  };

  const quickQuestions = [
    "Design Complete Roadmap for a week"
  ];

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-110 transition-all text-white flex items-center justify-center shadow-lg"
        >
          {isOpen ? <XMarkIcon className="w-6 h-6" /> : <ChatBubbleLeftRightIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[600px] z-50 backdrop-blur-lg bg-white/10 p-4 rounded-2xl border border-white/20 flex flex-col overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />

          <div className="flex items-center gap-2 mb-4 relative z-10">
            <SparklesIcon className="w-6 h-6 text-purple-400 animate-spin" />
            <h3 className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              FOCUS GENIE
            </h3>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={clearChatHistory}
                className="text-xs flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-white/80 hover:text-white rounded-full border border-white/10 transition-all"
              >
                <TrashIcon className="w-4 h-4" /> Clear
              </button>
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
                  <p className="text-xs opacity-60 mt-2">
                    {new Date(message.timestamp?.seconds ? message.timestamp.seconds * 1000 : message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
                <SpeakerWaveIcon className="w-4 h-4" /> Speak 
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
      )}
    </>
  );
};

export default AIChat;
