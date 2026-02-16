import React, { useState, useEffect } from 'react';
import { 
  Shapes, RefreshCcw, ArrowRight, Calculator, Palette,
  Rocket, Moon, Star, Sun, Cloud, Umbrella, Zap, Snowflake,
  Cat, Dog, Fish, Bird, Bug, Flower, Heart, Circle, Square, Triangle, Hexagon
} from 'lucide-react';

// Local types to avoid modifying types.ts
type PatternMode = 'shapes' | 'numbers';
type ThemeType = 'geometric' | 'space' | 'weather' | 'animals';

interface PatternElement {
  id: string;
  val: any; // Icon component or Number value
  color: string;
  label: string; // For accessibility/text
  isIcon: boolean;
}

// Configuration for themes
const THEMES: Record<ThemeType, { label: string, items: { icon: any, label: string }[], colors: string[] }> = {
  geometric: {
     label: 'Shapes',
     items: [
       { icon: Circle, label: 'Circle' },
       { icon: Square, label: 'Square' },
       { icon: Triangle, label: 'Triangle' },
       { icon: Hexagon, label: 'Hexagon' }
     ],
     colors: ['text-red-500', 'text-blue-500', 'text-green-500', 'text-purple-500']
  },
  space: {
     label: 'Space',
     items: [
       { icon: Rocket, label: 'Rocket' },
       { icon: Moon, label: 'Moon' },
       { icon: Star, label: 'Star' },
       { icon: Sun, label: 'Sun' }
     ],
     colors: ['text-indigo-600', 'text-slate-400', 'text-yellow-400', 'text-orange-500']
  },
  weather: {
     label: 'Weather',
     items: [
       { icon: Cloud, label: 'Cloud' },
       { icon: Sun, label: 'Sun' },
       { icon: Umbrella, label: 'Umbrella' },
       { icon: Zap, label: 'Lightning' }
     ],
     colors: ['text-sky-400', 'text-yellow-500', 'text-purple-500', 'text-amber-500']
  },
  animals: {
     label: 'Animals',
     items: [
       { icon: Cat, label: 'Cat' },
       { icon: Dog, label: 'Dog' },
       { icon: Fish, label: 'Fish' },
       { icon: Bird, label: 'Bird' }
     ],
     colors: ['text-orange-500', 'text-amber-800', 'text-blue-500', 'text-red-500']
  }
};

const NUMBER_STEPS = [1, 2, 5, 10];

export const PatternSim: React.FC = () => {
  const [mode, setMode] = useState<PatternMode>('shapes');
  const [theme, setTheme] = useState<ThemeType>('space'); // Default to fun theme
  
  const [sequence, setSequence] = useState<PatternElement[]>([]);
  const [options, setOptions] = useState<PatternElement[]>([]);
  const [missingIndex, setMissingIndex] = useState<number>(0);
  const [placedItem, setPlacedItem] = useState<PatternElement | null>(null);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  useEffect(() => {
    generateNewPattern();
  }, [mode, theme]);

  const generateNewPattern = () => {
    setPlacedItem(null);
    setStatus('playing');

    // 1. Determine Missing Index (Random between 2 and 5 to ensure context)
    // Sequence length is 6. Indices 0..5. We avoid hiding 0 or 1 so kid sees the start.
    const hideIdx = Math.floor(Math.random() * 4) + 2; // Returns 2, 3, 4, or 5
    setMissingIndex(hideIdx);

    let newSeq: PatternElement[] = [];
    let answer: PatternElement;
    let distractors: PatternElement[] = [];

    if (mode === 'numbers') {
        // --- NUMBER PATTERN LOGIC ---
        const start = Math.floor(Math.random() * 10) + 1; // 1 to 10
        const step = NUMBER_STEPS[Math.floor(Math.random() * NUMBER_STEPS.length)];
        const isAscending = Math.random() > 0.3; // Mostly ascending, sometimes descending
        
        for (let i = 0; i < 6; i++) {
            const val = isAscending ? start + (i * step) : (start + 20) - (i * step); // ensure positive for desc
            newSeq.push({
                id: `num-${i}`,
                val: val,
                color: 'text-indigo-600',
                label: val.toString(),
                isIcon: false
            });
        }
        
        answer = newSeq[hideIdx];
        
        // Generate smart distractors
        const ansVal = answer.val as number;
        distractors = [
            { id: 'd1', val: ansVal + step, color: 'text-indigo-600', label: (ansVal + step).toString(), isIcon: false },
            { id: 'd2', val: ansVal - step, color: 'text-indigo-600', label: (ansVal - step).toString(), isIcon: false },
            { id: 'd3', val: ansVal + (step * 2), color: 'text-indigo-600', label: (ansVal + step * 2).toString(), isIcon: false },
        ].filter(d => d.val !== ansVal && d.val >= 0).slice(0, 2); // Keep valid

    } else {
        // --- SHAPE/ICON PATTERN LOGIC ---
        const currentTheme = THEMES[theme];
        // Pick 2 or 3 distinct items for pattern
        const pool = [...currentTheme.items].sort(() => 0.5 - Math.random());
        const itemA = pool[0];
        const itemB = pool[1];
        const itemC = pool[2];

        // Random Colors from theme palette
        const colorPool = [...currentTheme.colors].sort(() => 0.5 - Math.random());
        const colorA = colorPool[0];
        const colorB = colorPool[1];
        const colorC = colorPool[2];

        const patternType = Math.random() > 0.5 ? 'ABAB' : 'ABC';
        let baseItems: any[] = [];
        let baseColors: string[] = [];

        if (patternType === 'ABAB') {
            // A B A B A B
            baseItems = [itemA, itemB, itemA, itemB, itemA, itemB];
            baseColors = [colorA, colorB, colorA, colorB, colorA, colorB];
        } else {
            // A B C A B C
            baseItems = [itemA, itemB, itemC, itemA, itemB, itemC];
            baseColors = [colorA, colorB, colorC, colorA, colorB, colorC];
        }

        newSeq = baseItems.map((it, idx) => ({
            id: `p-${idx}`,
            val: it.icon,
            label: it.label,
            color: baseColors[idx],
            isIcon: true
        }));

        answer = newSeq[hideIdx];

        // Distractors: Items from pool that are NOT the correct shape/color combo
        // We create a mix of different shapes to test shape recognition
        const wrongPool = currentTheme.items.filter(i => i.label !== answer.label);
        // If pool is small, reuse items but change colors? 
        // Simple strategy: Pick random items from theme that aren't the answer
        distractors = wrongPool.slice(0, 2).map((it, idx) => ({
            id: `d-${idx}`,
            val: it.icon,
            label: it.label,
            color: currentTheme.colors[(currentTheme.colors.indexOf(answer.color) + 1 + idx) % currentTheme.colors.length],
            isIcon: true
        }));
    }

    setSequence(newSeq);
    
    // Shuffle options
    const allOptions = [answer, ...distractors].sort(() => 0.5 - Math.random());
    // Ensure unique IDs for options to avoid React key issues
    setOptions(allOptions.map((o, i) => ({ ...o, id: `opt-${i}` })));
  };

  const handleSelect = (selected: PatternElement) => {
      if (status !== 'playing') return;

      setPlacedItem(selected);

      const correct = sequence[missingIndex];
      // Compare values
      const isCorrect = selected.label === correct.label; // Simple label check works for both nums and icons

      if (isCorrect) {
          setStatus('correct');
      } else {
          setStatus('wrong');
          setTimeout(() => {
              setPlacedItem(null);
              setStatus('playing');
          }, 1000); 
      }
  };

  const renderItem = (item: PatternElement, size: 'sm' | 'lg' = 'lg') => {
      const sizeClasses = size === 'lg' ? 'w-16 h-16 text-4xl' : 'w-12 h-12 text-2xl';
      
      if (item.isIcon) {
          const Icon = item.val;
          return (
             <div className={`${sizeClasses} flex items-center justify-center drop-shadow-sm transition-transform hover:scale-110 ${item.color}`}>
                 <Icon size={size === 'lg' ? 48 : 32} strokeWidth={2.5} />
             </div>
          );
      } else {
          return (
              <div className={`${sizeClasses} flex items-center justify-center font-black ${item.color} bg-white rounded-xl shadow-sm border-2 border-indigo-100`}>
                  {item.val}
              </div>
          );
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 rounded-xl items-center relative overflow-y-auto custom-scrollbar">
      {/* Header & Controls */}
      <div className="w-full max-w-4xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-800 flex items-center gap-3">
            {mode === 'numbers' ? <Calculator className="text-indigo-500" /> : <Shapes className="text-indigo-500" />}
            <span>Pattern Puzzle</span>
          </h2>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
             {/* Mode Switch */}
             <div className="flex bg-slate-100 rounded-xl p-1">
                 <button 
                    onClick={() => setMode('shapes')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${mode === 'shapes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                     <Shapes size={16} /> <span className="hidden sm:inline">Shapes</span>
                 </button>
                 <button 
                    onClick={() => setMode('numbers')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${mode === 'numbers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                     <Calculator size={16} /> <span className="hidden sm:inline">Numbers</span>
                 </button>
             </div>
             
             {/* Theme Switch (Only for Shapes) */}
             {mode === 'shapes' && (
                 <div className="relative group">
                     <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition">
                        <Palette size={20} />
                     </button>
                     {/* Hover Dropdown */}
                     <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-indigo-100 p-2 min-w-[150px] z-50 hidden group-hover:block animate-fade-in">
                        <p className="text-xs font-bold text-slate-400 uppercase px-2 mb-2">Select Theme</p>
                        {(Object.keys(THEMES) as ThemeType[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`w-full text-left px-3 py-2 rounded-lg font-bold text-sm mb-1 ${theme === t ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                {THEMES[t].label}
                            </button>
                        ))}
                     </div>
                 </div>
             )}

             <div className="w-px h-8 bg-slate-200 mx-1"></div>

             <button 
                onClick={generateNewPattern} 
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-2.5 rounded-xl transition"
                title="New Pattern"
             >
                 <RefreshCcw size={20} />
             </button>
          </div>
      </div>

      {/* The Pattern Display */}
      <div className="flex-1 flex flex-col items-center w-full max-w-4xl">
          
          {/* Sequence Container */}
          <div className="w-full bg-white rounded-3xl shadow-xl border-4 border-indigo-50 p-6 md:p-10 mb-8 flex flex-wrap justify-center items-center gap-2 md:gap-4 relative min-h-[160px]">
              {/* Background decorative track line */}
              <div className="absolute left-4 right-4 h-2 bg-slate-100 rounded-full top-1/2 -translate-y-1/2 -z-0"></div>

              {sequence.map((item, idx) => {
                  const isMissing = idx === missingIndex;
                  return (
                      <div key={item.id} className="relative z-10">
                          {isMissing ? (
                               <div className={`relative transition-all duration-300 ${status === 'wrong' && placedItem ? 'animate-shake' : ''}`}>
                                    {placedItem ? (
                                        <div className="relative animate-pop-in">
                                            {renderItem(placedItem, 'lg')}
                                            {status === 'wrong' && (
                                                <div className="absolute inset-0 bg-red-500/20 rounded-xl border-2 border-red-500 animate-pulse"></div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 rounded-2xl border-4 border-dashed border-indigo-300 flex items-center justify-center animate-pulse">
                                            <span className="text-3xl font-bold text-indigo-200">?</span>
                                        </div>
                                    )}
                                    {/* Helper Arrow for missing spot */}
                                    {!placedItem && (
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-indigo-400 text-xs font-bold uppercase tracking-widest animate-bounce">
                                            Here!
                                        </div>
                                    )}
                               </div>
                          ) : (
                              <div className="transform transition-transform hover:-translate-y-1">
                                  {renderItem(item, 'lg')}
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>

          {/* Feedback & Options Area */}
          <div className="w-full max-w-2xl text-center">
              {status === 'correct' ? (
                  <div className="animate-fade-in-up bg-green-100 p-8 rounded-3xl border-4 border-green-200 shadow-lg">
                      <div className="text-6xl mb-2">🎉</div>
                      <h3 className="text-3xl font-black text-green-700 mb-2">Super Pattern!</h3>
                      <p className="text-green-800 font-medium mb-6 text-lg">You found the missing piece.</p>
                      <button 
                        onClick={generateNewPattern} 
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                      >
                          Next Pattern <ArrowRight size={24} />
                      </button>
                  </div>
              ) : (
                  <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-indigo-100">
                      <h3 className="text-lg md:text-xl text-indigo-900 font-bold mb-6 bg-indigo-100/50 py-2 px-6 rounded-full inline-block">
                          {mode === 'numbers' ? 'What comes next?' : 'Which one fits?'}
                      </h3>
                      
                      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                          {options.map((opt) => {
                              const isPlaced = placedItem?.id === opt.id;
                              return (
                                  <button 
                                      key={opt.id} 
                                      onClick={() => handleSelect(opt)}
                                      disabled={isPlaced || status === 'wrong'}
                                      className={`
                                          p-4 bg-white rounded-2xl shadow-[0_8px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[8px] border-2 border-slate-100
                                          transition-all duration-150
                                          ${isPlaced ? 'opacity-0 pointer-events-none' : 'hover:border-indigo-200 hover:bg-indigo-50'}
                                      `}
                                  >
                                      {renderItem(opt, 'lg')}
                                  </button>
                              );
                          })}
                      </div>
                      {status === 'wrong' && (
                          <div className="mt-6 text-red-500 font-bold animate-pulse">
                              Oops! Try a different one.
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};