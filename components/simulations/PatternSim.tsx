import React, { useState, useEffect } from 'react';
import { 
  Shapes, RefreshCcw, ArrowRight, Calculator, Palette,
  Rocket, Moon, Star, Sun, Cloud, Umbrella, Zap, Snowflake,
  Cat, Dog, Fish, Bird, Bug, Flower, Heart, Circle, Square, Triangle, Hexagon,
  Gauge
} from 'lucide-react';

// Local types to avoid modifying types.ts
type PatternMode = 'shapes' | 'numbers';
type ThemeType = 'geometric' | 'space' | 'weather' | 'animals';
type DifficultyLevel = 'easy' | 'medium' | 'hard';

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

export const PatternSim: React.FC = () => {
  const [mode, setMode] = useState<PatternMode>('shapes');
  const [theme, setTheme] = useState<ThemeType>('space');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  
  const [sequence, setSequence] = useState<PatternElement[]>([]);
  const [options, setOptions] = useState<PatternElement[]>([]);
  const [missingIndex, setMissingIndex] = useState<number>(0);
  const [placedItem, setPlacedItem] = useState<PatternElement | null>(null);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  useEffect(() => {
    generateNewPattern();
  }, [mode, theme, difficulty]);

  const generateNewPattern = () => {
    setPlacedItem(null);
    setStatus('playing');

    // 1. Determine Missing Index based on Difficulty
    let hideIdx = 5; // Default Easy: Always the last one
    
    if (difficulty === 'medium') {
        // Medium: Hides one of the last two
        hideIdx = Math.random() > 0.5 ? 4 : 5;
    } else if (difficulty === 'hard') {
        // Hard: Hides anywhere from index 2 to 5
        hideIdx = Math.floor(Math.random() * 4) + 2; 
    }
    setMissingIndex(hideIdx);

    let newSeq: PatternElement[] = [];
    let answer: PatternElement;
    let distractors: PatternElement[] = [];

    if (mode === 'numbers') {
        // --- NUMBER PATTERN LOGIC ---
        let step = 1;
        let start = 1;
        let isAscending = true;

        if (difficulty === 'easy') {
            // Simple steps: 1, 2, 5, 10. Start small. Ascending only.
            step = [1, 2, 5, 10][Math.floor(Math.random() * 4)];
            start = Math.floor(Math.random() * 20) + 1;
            isAscending = true;
        } else if (difficulty === 'medium') {
            // Moderate steps: 3, 4, 6. Start up to 50. Mixed direction.
            step = [3, 4, 6][Math.floor(Math.random() * 3)];
            start = Math.floor(Math.random() * 50) + 1;
            isAscending = Math.random() > 0.3; // Mostly ascending
        } else {
            // Hard steps: 7, 8, 9, 11, 12, 15. Start up to 90. Mixed direction.
            step = [7, 8, 9, 11, 12, 15][Math.floor(Math.random() * 6)];
            start = Math.floor(Math.random() * 80) + 10;
            isAscending = Math.random() > 0.5;
        }
        
        for (let i = 0; i < 6; i++) {
            const val = isAscending ? start + (i * step) : (start + (step * 8)) - (i * step); // ensure positive for desc
            newSeq.push({
                id: `num-${i}`,
                val: Math.max(0, val), // Safety floor 0
                color: 'text-indigo-600',
                label: Math.max(0, val).toString(),
                isIcon: false
            });
        }
        
        answer = newSeq[hideIdx];
        const ansVal = answer.val as number;
        
        // Generate smart distractors
        distractors = [
            { id: 'd1', val: ansVal + step, color: 'text-indigo-600', label: (ansVal + step).toString(), isIcon: false },
            { id: 'd2', val: Math.max(0, ansVal - step), color: 'text-indigo-600', label: Math.max(0, ansVal - step).toString(), isIcon: false },
            { id: 'd3', val: ansVal + (step * 2), color: 'text-indigo-600', label: (ansVal + step * 2).toString(), isIcon: false },
        ].filter(d => d.val !== ansVal).slice(0, 2); 

    } else {
        // --- SHAPE/ICON PATTERN LOGIC ---
        const currentTheme = THEMES[theme];
        // Shuffle items and colors to get randomness for this round
        const pool = [...currentTheme.items].sort(() => 0.5 - Math.random());
        const colorPool = [...currentTheme.colors].sort(() => 0.5 - Math.random());

        let patternType = 'ABAB';
        let items: typeof currentTheme.items = [];
        let colors: string[] = [];
        let basePatternIndices: number[] = [];

        if (difficulty === 'easy') {
            // ABABAB
            patternType = 'ABAB';
            items = pool.slice(0, 2);
            colors = colorPool.slice(0, 2);
            basePatternIndices = [0, 1, 0, 1, 0, 1];
        } else if (difficulty === 'medium') {
            // ABCABC or AABBAA
            patternType = Math.random() > 0.5 ? 'ABC' : 'AABB';
            if (patternType === 'ABC') {
                items = pool.slice(0, 3);
                colors = colorPool.slice(0, 3);
                basePatternIndices = [0, 1, 2, 0, 1, 2];
            } else {
                items = pool.slice(0, 2);
                colors = colorPool.slice(0, 2);
                basePatternIndices = [0, 0, 1, 1, 0, 0];
            }
        } else {
            // Hard: ABCD or ABAC
            // Limited by 4 items per theme usually
            patternType = Math.random() > 0.5 ? 'ABCD' : 'ABAC';
            if (patternType === 'ABCD') {
                items = pool.slice(0, 4);
                colors = colorPool.slice(0, 4);
                basePatternIndices = [0, 1, 2, 3, 0, 1];
            } else {
                items = pool.slice(0, 3);
                colors = colorPool.slice(0, 3);
                // A B A C A B
                basePatternIndices = [0, 1, 0, 2, 0, 1];
            }
        }

        newSeq = basePatternIndices.map((pIdx, i) => ({
            id: `p-${i}`,
            val: items[pIdx].icon,
            label: items[pIdx].label,
            color: colors[pIdx],
            isIcon: true
        }));

        answer = newSeq[hideIdx];

        // Distractors
        // Get items from the theme that are NOT the correct answer's label
        const wrongItems = currentTheme.items.filter(i => i.label !== answer.label);
        
        distractors = wrongItems.slice(0, 2).map((it, idx) => ({
            id: `d-${idx}`,
            val: it.icon,
            label: it.label,
            // Assign a color from pool that isn't the answer color if possible, or just random
            color: currentTheme.colors[(currentTheme.colors.indexOf(answer.color) + 1 + idx) % currentTheme.colors.length],
            isIcon: true
        }));
    }

    setSequence(newSeq);
    
    // Shuffle options
    const allOptions = [answer, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(allOptions.map((o, i) => ({ ...o, id: `opt-${i}` })));
  };

  const handleSelect = (selected: PatternElement) => {
      if (status !== 'playing') return;

      setPlacedItem(selected);

      const correct = sequence[missingIndex];
      const isCorrect = selected.label === correct.label; 

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
      <div className="w-full max-w-5xl mb-6 flex flex-col xl:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-800 flex items-center gap-3">
            {mode === 'numbers' ? <Calculator className="text-indigo-500" /> : <Shapes className="text-indigo-500" />}
            <span>Pattern Puzzle</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
             {/* Difficulty Switch */}
             <div className="flex bg-slate-100 rounded-xl p-1">
                 {(['easy', 'medium', 'hard'] as const).map(d => (
                     <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition ${difficulty === d ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        {d}
                     </button>
                 ))}
             </div>

             <div className="w-px h-8 bg-slate-200 mx-1 hidden md:block"></div>

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
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <h3 className="text-lg md:text-xl text-indigo-900 font-bold bg-indigo-100/50 py-2 px-6 rounded-full inline-block">
                            {mode === 'numbers' ? 'What comes next?' : 'Which one fits?'}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${difficulty === 'easy' ? 'bg-green-100 text-green-700 border-green-200' : difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {difficulty}
                        </div>
                      </div>
                      
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