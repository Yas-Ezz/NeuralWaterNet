import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis l'assistant SWE. Comment puis-je vous aider avec votre système de filtration d'eau ?", sender: 'bot', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userText = input.trim();
    const newUserMsg = { id: Date.now(), text: userText, sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Build context from previous messages
      const history = messages.map(m => `${m.sender === 'bot' ? 'Assistant' : 'Utilisateur'}: ${m.text}`).join('\n');
      const prompt = `Tu es un assistant technique expert pour le système "SmartWater Ecosystem" (SWE), un système de filtration et de gestion d'eau domestique.
Historique de la conversation:
${history}
Utilisateur: ${userText}
Assistant:`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "Tu es un assistant technique expert et poli pour le système SWE (SmartWater Ecosystem). Réponds de manière concise et utile en français.",
        }
      });

      const botText = response.text || "Désolé, je n'ai pas pu générer de réponse.";
      const newBotMsg = { id: Date.now()+1, text: botText, sender: 'bot', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setMessages(prev => [...prev, newBotMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg = { id: Date.now()+1, text: "Désolé, une erreur est survenue lors de la connexion à notre système d'assistance.", sender: 'bot', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>{msg.time}</p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%] flex-row">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button type="submit" disabled={!input.trim() || isTyping} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors shrink-0">
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
