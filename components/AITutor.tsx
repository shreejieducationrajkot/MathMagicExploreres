import React, { useState } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { getExplanation, generateChallenge } from '../services/geminiService';

interface AITutorProps {
  currentTopic: string;
  context: string;
}

export const AITutor: React.FC<AITutorProps> = ({ currentTopic, context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setMessage(null);
    const response = await getExplanation(currentTopic, context);
    setMessage(response);
    setLoading(false);
  };
  
  const handleChallenge = async () => {
      setLoading(true);
      setMessage(null);
      const response = await generateChallenge(currentTopic);
      setMessage(response);
      setLoading(false);
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 p-4 rounded-full shadow-2xl transition transform hover:scale-110 z-50 flex items-center gap-2 font-bold border-4 border-white"
      >
        <Bot size={32} />
        <span>Ask AI Tutor</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border-4 border-yellow-400 z-50 overflow-hidden animate-fade-in-up">
      <div className="bg-yellow-400 p-4 flex justify-between items-center">
        <h3 className="font-bold text-yellow-900 flex items-center gap-2">
            <Bot /> Math Buddy
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-yellow-900 hover:bg-yellow-500/20 p-1 rounded-full">
            <X size={20} />
        </button>
      </div>
      
      <div className="p-6 bg-yellow-50/50 min-h-[150px] flex flex-col items-center justify-center text-center">
        {loading ? (
            <Sparkles className="animate-spin text-yellow-500 mb-2" size={32} />
        ) : message ? (
            <p className="text-lg text-gray-800 font-medium leading-relaxed">{message}</p>
        ) : (
            <p className="text-gray-500 italic">I'm watching you learn! Click a button below if you need me.</p>
        )}
      </div>

      <div className="p-4 bg-white grid grid-cols-2 gap-3">
        <button 
            onClick={handleAsk}
            disabled={loading}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 rounded-xl font-bold transition text-sm flex flex-col items-center justify-center gap-1"
        >
            <span>🤔 Help Me!</span>
        </button>
        <button 
            onClick={handleChallenge}
            disabled={loading}
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-3 rounded-xl font-bold transition text-sm flex flex-col items-center justify-center gap-1"
        >
            <span>🏆 Challenge</span>
        </button>
      </div>
    </div>
  );
};
