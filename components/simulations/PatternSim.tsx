import React, { useState, useEffect } from 'react';
import { Shapes, RefreshCcw, ArrowRight } from 'lucide-react';
import { PatternItem } from '../../types';

const ITEMS: Omit<PatternItem, 'id'>[] = [
    { color: 'bg-red-500', shape: 'circle' },
    { color: 'bg-blue-500', shape: 'square' },
    { color: 'bg-green-500', shape: 'triangle' },
    { color: 'bg-yellow-400', shape: 'star' },
];

export const PatternSim: React.FC = () => {
  const [sequence, setSequence] = useState<PatternItem[]>([]);
  const [options, setOptions] = useState<PatternItem[]>([]);
  const [missingIndex, setMissingIndex] = useState<number>(0);
  const [placedItem, setPlacedItem] = useState<PatternItem | null>(null);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  // Generate a pattern on mount
  useEffect(() => {
    generateNewPattern();
  }, []);

  const generateNewPattern = () => {
    const patternType = Math.random() > 0.5 ? 'ABAB' : 'ABCABC';
    const item1 = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    let item2 = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    while(item2 === item1) item2 = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    
    let item3 = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    while(item3 === item1 || item3 === item2) item3 = ITEMS[Math.floor(Math.random() * ITEMS.length)];

    let baseSeq: any[] = [];
    if (patternType === 'ABAB') {
        baseSeq = [item1, item2, item1, item2, item1, item2];
    } else {
        baseSeq = [item1, item2, item3, item1, item2, item3];
    }

    // Add IDs and create the full sequence
    const fullSeq = baseSeq.map((it, idx) => ({ ...it, id: `p-${idx}` }));
    
    // Decide which one to hide (last one for simplicity for 1st graders)
    const hideIdx = 5; 
    setMissingIndex(hideIdx);
    setSequence(fullSeq);
    setPlacedItem(null);
    setStatus('playing');

    // Create options (correct answer + 2 random wrongs)
    const correct = fullSeq[hideIdx];
    const wrongs = ITEMS.filter(i => i.shape !== correct.shape || i.color !== correct.color)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 2)
                        .map((w, i) => ({ ...w, id: `opt-${i}` }));
    
    const allOpts = [correct, ...wrongs].sort(() => 0.5 - Math.random());
    setOptions(allOpts as PatternItem[]);
  };

  const handleSelect = (selected: PatternItem) => {
      if (status !== 'playing') return;

      setPlacedItem(selected);

      const correct = sequence[missingIndex];
      if (selected.shape === correct.shape && selected.color === correct.color) {
          setStatus('correct');
      } else {
          setStatus('wrong');
          // Wait a bit, then reset (simulate "returning" to options)
          setTimeout(() => {
              setPlacedItem(null);
              setStatus('playing');
          }, 1000); 
      }
  };

  const renderShape = (item: PatternItem, sizeClass = 'w-12 h-12 md:w-16 md:h-16') => {
      const classes = `${sizeClass} shadow-md transition-all duration-300 ${item.color}`;
      switch (item.shape) {
          case 'circle': return <div className={`${classes} rounded-full`} />;
          case 'square': return <div className={`${classes} rounded-md`} />;
          case 'triangle': return <div className={`w-0 h-0 border-l-[24px] md:border-l-[32px] border-l-transparent border-r-[24px] md:border-r-[32px] border-r-transparent border-b-[48px] md:border-b-[64px] ${item.color.replace('bg-', 'border-b-')} drop-shadow-md`} />;
          case 'star': return (
            <svg viewBox="0 0 24 24" className={`${sizeClass} text-${item.color.split('-')[1]}-${item.color.split('-')[2]} drop-shadow-md`} fill="currentColor">
                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          );
          default: return null;
      }
  };

  return (
    <div className="flex flex-col h-full bg-indigo-50 p-4 rounded-xl items-center relative overflow-y-auto">
      <div className="flex justify-between w-full items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-700 flex items-center">
            <Shapes className="mr-3" /> Finish the Pattern!
          </h2>
          <button 
             onClick={generateNewPattern} 
             className="bg-white hover:bg-indigo-100 text-indigo-600 p-2 rounded-full shadow-sm transition"
             title="New Pattern"
          >
              <RefreshCcw size={20} />
          </button>
      </div>

      {/* The Pattern Train */}
      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-10 p-4 md:p-8 bg-white rounded-3xl shadow-xl border-4 border-indigo-100 w-full max-w-4xl">
          {sequence.map((item, idx) => {
              const isMissing = idx === missingIndex;
              const content = (() => {
                  if (isMissing) {
                      if (placedItem) {
                          // Show the placed item (either correct or wrong)
                          return (
                              <div className={`relative animate-pop-in ${status === 'wrong' ? 'animate-shake' : ''}`}>
                                  {renderShape(placedItem)}
                                  {status === 'wrong' && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
                                      </div>
                                  )}
                              </div>
                          );
                      }
                      // Empty slot
                      return (
                          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-dashed border-indigo-300 bg-indigo-50 rounded-xl flex items-center justify-center">
                              <span className="text-2xl font-bold text-indigo-200">?</span>
                          </div>
                      );
                  }
                  return renderShape(item);
              })();

              return (
                  <div key={idx} className="relative flex items-center">
                      {content}
                      {/* Connector Line */}
                      {idx < sequence.length - 1 && (
                          <div className="w-4 md:w-8 h-1 bg-gray-200 mx-1 md:mx-2 rounded-full"></div>
                      )}
                  </div>
              );
          })}
      </div>

      <div className="flex-1 flex flex-col items-center justify-start w-full max-w-2xl">
        {status === 'correct' ? (
            <div className="text-center animate-fade-in-up bg-green-100 p-6 rounded-2xl border-2 border-green-200 shadow-md">
                <h3 className="text-3xl font-black text-green-600 mb-2">Awesome!</h3>
                <p className="text-green-700 mb-6 font-medium">You completed the pattern!</p>
                <button onClick={generateNewPattern} className="px-8 py-3 bg-green-500 text-white rounded-full text-lg font-bold shadow-lg hover:bg-green-600 transition transform hover:scale-105 flex items-center gap-2 mx-auto">
                    Next Pattern <ArrowRight size={20} />
                </button>
            </div>
        ) : (
            <div className="text-center w-full">
                <h3 className="text-xl text-indigo-800 font-bold mb-6 bg-indigo-100 py-2 px-6 rounded-full inline-block">
                    Which shape fits?
                </h3>
                
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 min-h-[100px]">
                    {options.map((opt, i) => {
                        // If this option is currently placed in the slot, hide it here (ghost effect)
                        const isPlaced = placedItem?.id === opt.id;
                        
                        return (
                            <button 
                                key={opt.id} 
                                onClick={() => handleSelect(opt)}
                                disabled={isPlaced || status === 'wrong'}
                                className={`
                                    p-4 bg-white rounded-2xl shadow-lg border-b-4 border-indigo-100 
                                    transition-all duration-200 
                                    ${isPlaced ? 'opacity-0 scale-50 pointer-events-none' : 'hover:-translate-y-2 hover:border-indigo-300 hover:shadow-xl cursor-pointer active:scale-95'}
                                `}
                            >
                                {renderShape(opt)}
                            </button>
                        );
                    })}
                </div>
                
                {status === 'wrong' && (
                    <p className="text-red-500 font-bold mt-8 animate-pulse">
                        Oops! That doesn't fit. It will go back...
                    </p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
