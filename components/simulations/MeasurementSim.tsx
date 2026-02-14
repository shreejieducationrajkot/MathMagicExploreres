import React, { useState, useEffect, useRef } from 'react';
import { Ruler, Scale, Calculator, ArrowRightLeft, X, Check, ArrowRight, Move, RefreshCcw, HelpCircle, Play, Info } from 'lucide-react';

const MEASURABLE_ITEMS = [
  { name: 'Mystery Box', width: 300, color: 'from-blue-400 to-blue-600', textColor: 'text-white' },
  { name: 'Red Pencil', width: 240, color: 'from-red-400 to-red-600', textColor: 'text-white' },
  { name: 'Golden Key', width: 140, color: 'from-yellow-400 to-yellow-600', textColor: 'text-yellow-900' },
  { name: 'Green Leaf', width: 100, color: 'from-green-400 to-green-600', textColor: 'text-white' },
  { name: 'Tiny Eraser', width: 60, color: 'from-pink-400 to-pink-600', textColor: 'text-white' },
];

type WeightItem = {
    id: string;
    type: 'red' | 'blue' | 'gold' | 'mystery';
    weight: number;
    visual: React.ReactNode;
};

const WEIGHT_TYPES = {
    red: { weight: 1, color: 'bg-red-500', border: 'border-red-700', label: '1' },
    blue: { weight: 2, color: 'bg-blue-500', border: 'border-blue-700', label: '2' },
    gold: { weight: 5, color: 'bg-yellow-400', border: 'border-yellow-600', label: '5' },
    mystery: { weight: 0, color: 'bg-slate-700', border: 'border-slate-900', label: '?' }, 
};

const UNIT_DEFINITIONS = {
  length: [
    { code: 'mm', name: 'Millimeter', icon: '🐜', desc: 'Thickness of a card' },
    { code: 'cm', name: 'Centimeter', icon: '🍬', desc: 'Width of a fingernail' },
    { code: 'in', name: 'Inch', icon: '👍', desc: 'Top thumb joint' },
    { code: 'ft', name: 'Foot', icon: '👟', desc: 'Length of a ruler' },
  ],
  weight: [
    { code: 'g', name: 'Gram', icon: '📎', desc: 'A paperclip' },
    { code: 'oz', name: 'Ounce', icon: '🍓', desc: 'A strawberry' },
    { code: 'lb', name: 'Pound', icon: '🏈', desc: 'A football' },
    { code: 'kg', name: 'Kilogram', icon: '📚', desc: 'A heavy book' },
  ]
};

export const MeasurementSim: React.FC = () => {
  const [mode, setMode] = useState<'length' | 'weight'>('length');
  
  // --- Length Mode State ---
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const currentItem = MEASURABLE_ITEMS[currentItemIdx];
  
  const [lengthUnit, setLengthUnit] = useState<'mm' | 'cm' | 'in'>('cm');
  // 2D Positions
  const [objectPos, setObjectPos] = useState({ x: 50, y: 50 });
  const [rulerPos, setRulerPos] = useState({ x: 50, y: 200 });
  
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');

  // Dragging Refs (Length)
  const containerRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<'object' | 'ruler' | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const elemStart = useRef({ x: 0, y: 0 });

  // --- Weight Mode State ---
  const [panItems, setPanItems] = useState<{ left: WeightItem[], right: WeightItem[] }>({ left: [], right: [] });
  const [weightChallenge, setWeightChallenge] = useState<{ active: boolean, targetDiff: number } | null>(null);
  
  // Dragging State (Weight)
  const [dragWeight, setDragWeight] = useState<{ type: 'red' | 'blue' | 'gold' | 'mystery', x: number, y: number } | null>(null);
  const leftPanRef = useRef<HTMLDivElement>(null);
  const rightPanRef = useRef<HTMLDivElement>(null);

  // --- Converter & Guide State ---
  const [showConverter, setShowConverter] = useState(false);
  const [showUnitGuide, setShowUnitGuide] = useState(false);
  
  // Converter internals
  const [convertVal, setConvertVal] = useState('');
  const [convInputUnit, setConvInputUnit] = useState<string>('cm');

  // Constants
  const PIXELS_PER_CM = 40;
  const PIXELS_PER_IN = 100; 
  // mm shares the CM pixel density (just different labels), inches has its own density.
  const currentPixelsPerUnit = lengthUnit === 'in' ? PIXELS_PER_IN : PIXELS_PER_CM;
  const rulerLengthUnits = lengthUnit === 'in' ? 6 : 15;

  // Sync converter defaults
  useEffect(() => {
      setConvInputUnit(mode === 'length' ? 'cm' : 'kg');
      setConvertVal('');
  }, [mode]);

  // Clean up listeners
  useEffect(() => {
      return () => {
          window.removeEventListener('mousemove', handleLengthMouseMove);
          window.removeEventListener('mouseup', handleLengthMouseUp);
          window.removeEventListener('touchmove', handleLengthTouchMove);
          window.removeEventListener('touchend', handleLengthMouseUp);
          window.removeEventListener('mousemove', handleWeightMouseMove);
          window.removeEventListener('mouseup', handleWeightMouseUp);
          window.removeEventListener('touchmove', handleWeightTouchMove);
          window.removeEventListener('touchend', handleWeightMouseUp);
      };
  }, []); 

  // --- Length Drag Handlers (2D) ---
  const handleLengthStart = (e: React.MouseEvent | React.TouchEvent, item: 'object' | 'ruler') => {
      e.preventDefault(); // Prevent scrolling on touch
      dragItem.current = item;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      dragStart.current = { x: clientX, y: clientY };
      elemStart.current = item === 'object' ? { ...objectPos } : { ...rulerPos };
      
      window.addEventListener('mousemove', handleLengthMouseMove);
      window.addEventListener('mouseup', handleLengthMouseUp);
      window.addEventListener('touchmove', handleLengthTouchMove, { passive: false });
      window.addEventListener('touchend', handleLengthMouseUp);
  };

  const handleLengthMove = (clientX: number, clientY: number) => {
      if (!dragItem.current || !containerRef.current) return;
      
      const deltaX = clientX - dragStart.current.x;
      const deltaY = clientY - dragStart.current.y;
      
      const newX = elemStart.current.x + deltaX;
      const newY = elemStart.current.y + deltaY;

      // Bounds
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;

      const clampedX = Math.max(-50, Math.min(newX, containerW - 20));
      const clampedY = Math.max(-20, Math.min(newY, containerH - 20));

      if (dragItem.current === 'object') {
          setObjectPos({ x: clampedX, y: clampedY });
      } else {
          setRulerPos({ x: clampedX, y: clampedY });
      }
  };

  const handleLengthMouseMove = (e: MouseEvent) => handleLengthMove(e.clientX, e.clientY);
  const handleLengthTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleLengthMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleLengthMouseUp = () => {
      dragItem.current = null;
      window.removeEventListener('mousemove', handleLengthMouseMove);
      window.removeEventListener('mouseup', handleLengthMouseUp);
      window.removeEventListener('touchmove', handleLengthTouchMove);
      window.removeEventListener('touchend', handleLengthMouseUp);
  };

  // --- Weight Drag Handlers ---
  const startWeightDrag = (e: React.MouseEvent | React.TouchEvent, type: 'red' | 'blue' | 'gold' | 'mystery', source: 'shelf' | 'left' | 'right', id?: string) => {
      e.preventDefault();
      if (source !== 'shelf' && type === 'mystery') return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setDragWeight({ type, x: clientX, y: clientY });
      if (source !== 'shelf' && id) {
          setPanItems(prev => ({ ...prev, [source]: prev[source].filter(item => item.id !== id) }));
      }
      window.addEventListener('mousemove', handleWeightMouseMove);
      window.addEventListener('touchmove', handleWeightTouchMove, { passive: false });
      window.addEventListener('mouseup', handleWeightMouseUp);
      window.addEventListener('touchend', handleWeightMouseUp);
  };

  const updateWeightDragPos = (clientX: number, clientY: number) => {
      setDragWeight(prev => prev ? { ...prev, x: clientX, y: clientY } : null);
  };

  const handleWeightMouseMove = (e: MouseEvent) => updateWeightDragPos(e.clientX, e.clientY);
  const handleWeightTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      updateWeightDragPos(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleWeightMouseUp = () => {
      setDragWeight(current => {
          if (!current) return null;
          const newItem: WeightItem = {
              id: Math.random().toString(36).substr(2, 9),
              type: current.type as any,
              weight: WEIGHT_TYPES[current.type].weight,
              visual: null
          };
          const isOver = (rect: DOMRect, x: number, y: number) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
          if (leftPanRef.current && isOver(leftPanRef.current.getBoundingClientRect(), current.x, current.y)) {
              setPanItems(prev => ({ ...prev, left: [...prev.left, newItem] }));
          } else if (rightPanRef.current && isOver(rightPanRef.current.getBoundingClientRect(), current.x, current.y)) {
              setPanItems(prev => ({ ...prev, right: [...prev.right, newItem] }));
          }
          return null;
      });
      window.removeEventListener('mousemove', handleWeightMouseMove);
      window.removeEventListener('touchmove', handleWeightTouchMove);
      window.removeEventListener('mouseup', handleWeightMouseUp);
      window.removeEventListener('touchend', handleWeightMouseUp);
  };


  // --- Game Logic ---
  const checkLengthAnswer = () => {
      const userVal = parseFloat(userGuess);
      if (isNaN(userVal)) return;

      // Calculate actual size in the currently selected unit
      // width is in pixels.
      // if mm: width / (PIXELS_PER_CM / 10) = width / 4
      // if cm: width / PIXELS_PER_CM = width / 40
      // if in: width / PIXELS_PER_IN = width / 100
      
      let actualSize = 0;
      if (lengthUnit === 'mm') actualSize = currentItem.width / (PIXELS_PER_CM / 10);
      else if (lengthUnit === 'cm') actualSize = currentItem.width / PIXELS_PER_CM;
      else actualSize = currentItem.width / PIXELS_PER_IN; // inches

      if (Math.abs(userVal - actualSize) <= (lengthUnit === 'mm' ? 1.5 : 0.15)) setFeedback('correct');
      else setFeedback('incorrect');
  };

  const nextLengthLevel = () => {
      setFeedback('none');
      setUserGuess('');
      setCurrentItemIdx((prev) => (prev + 1) % MEASURABLE_ITEMS.length);
      setObjectPos({ x: 50, y: 50 });
      setRulerPos({ x: 50, y: 200 });
  };
  
  const startWeightPuzzle = () => {
      setPanItems({ left: [], right: [] });
      const target = Math.floor(Math.random() * 8) + 2; 
      const mysteryItem: WeightItem = { id: 'mystery-1', type: 'mystery', weight: target, visual: null };
      setPanItems({ left: [mysteryItem], right: [] });
      setWeightChallenge({ active: true, targetDiff: 0 });
  };
  
  const getConversions = () => {
      const val = parseFloat(convertVal);
      if (isNaN(val)) return [];

      if (mode === 'length') {
          // Base to cm first
          let cm = 0;
          if (convInputUnit === 'mm') cm = val / 10;
          else if (convInputUnit === 'cm') cm = val;
          else if (convInputUnit === 'in') cm = val * 2.54;
          else if (convInputUnit === 'ft') cm = val * 30.48;

          return [
              { unit: 'mm', val: (cm * 10).toFixed(1) },
              { unit: 'cm', val: cm.toFixed(2) },
              { unit: 'in', val: (cm / 2.54).toFixed(2) },
              { unit: 'ft', val: (cm / 30.48).toFixed(3) }
          ].filter(i => i.unit !== convInputUnit);
      } else {
          // Base to g first
          let g = 0;
          if (convInputUnit === 'g') g = val;
          else if (convInputUnit === 'kg') g = val * 1000;
          else if (convInputUnit === 'oz') g = val * 28.35;
          else if (convInputUnit === 'lb') g = val * 453.59;

          return [
              { unit: 'g', val: g.toFixed(0) },
              { unit: 'kg', val: (g / 1000).toFixed(3) },
              { unit: 'oz', val: (g / 28.35).toFixed(2) },
              { unit: 'lb', val: (g / 453.59).toFixed(2) }
          ].filter(i => i.unit !== convInputUnit);
      }
  };

  // --- Render Helpers ---
  const renderRulerTicks = (unitIndex: number) => {
    if (unitIndex >= rulerLengthUnits) return null;
    // cm and mm use same density (40px/cm)
    if (lengthUnit === 'cm' || lengthUnit === 'mm') {
        return Array.from({ length: 9 }).map((_, j) => {
            const mm = j + 1;
            const isHalf = mm === 5;
            const height = isHalf ? 'h-4' : 'h-2';
            const color = isHalf ? 'bg-yellow-900/50' : 'bg-yellow-900/30';
            const leftPos = (mm / 10) * PIXELS_PER_CM;
            return <div key={`mm-${unitIndex}-${mm}`} className={`absolute bottom-0 w-px ${color} ${height}`} style={{ left: `${leftPos}px` }} />;
        });
    } else {
        // inches
        return Array.from({ length: 15 }).map((_, j) => {
            const sixteenth = j + 1;
            const fraction = sixteenth / 16;
            let height = 'h-2'; 
            let color = 'bg-yellow-900/20';
            if (sixteenth === 8) { height = 'h-5'; color = 'bg-yellow-900/60'; } 
            else if (sixteenth % 4 === 0) { height = 'h-4'; color = 'bg-yellow-900/40'; } 
            else if (sixteenth % 2 === 0) { height = 'h-3'; color = 'bg-yellow-900/30'; }
            const leftPos = fraction * PIXELS_PER_IN;
            return <div key={`in-${unitIndex}-${sixteenth}`} className={`absolute bottom-0 w-px ${color} ${height}`} style={{ left: `${leftPos}px` }} />;
        });
    }
  };

  const calculateWeightState = () => {
    const leftWeight = panItems.left.reduce((acc, i) => acc + i.weight, 0);
    const rightWeight = panItems.right.reduce((acc, i) => acc + i.weight, 0);
    const diff = rightWeight - leftWeight;
    const rotation = Math.max(-25, Math.min(25, diff * 2.5));
    let statusText = "Balanced";
    let statusColor = "text-green-600";
    if (Math.abs(diff) < 0.1) { statusText = "Perfect Balance!"; statusColor = "text-green-600"; } 
    else if (diff > 0) { statusText = "Right side is heavier"; statusColor = "text-blue-600"; } 
    else { statusText = "Left side is heavier"; statusColor = "text-blue-600"; }
    return { rotation, leftWeight, rightWeight, diff, statusText, statusColor };
  };

  const renderWeightObject = (type: 'red' | 'blue' | 'gold' | 'mystery', sizeClass: string = 'w-10 h-10') => {
      const config = WEIGHT_TYPES[type];
      return (
          <div className={`${sizeClass} ${config.color} border-2 ${config.border} shadow-sm flex items-center justify-center font-bold text-white text-xs select-none ${type === 'red' ? 'rounded-full' : type === 'blue' ? 'rounded-md' : 'rounded-t-lg rounded-b-sm'}`}>
              {config.label}
          </div>
      );
  };

  const { rotation, leftWeight, rightWeight, diff, statusText, statusColor } = calculateWeightState();
  const isBalanced = Math.abs(diff) === 0 && (leftWeight > 0 || rightWeight > 0);

  return (
    <div className="flex flex-col h-full bg-blue-50 p-4 rounded-xl relative overflow-hidden">
      {/* Drag Layer */}
      {dragWeight && (
          <div 
            className="fixed z-50 pointer-events-none"
            style={{ 
                left: dragWeight.x, 
                top: dragWeight.y,
                transform: 'translate(-50%, -50%) scale(1.1)' 
            }}
          >
              {renderWeightObject(dragWeight.type, 'w-14 h-14 shadow-2xl')}
          </div>
      )}

      {/* Converter Modal */}
      {showConverter && (
        <div className="absolute top-20 right-4 z-50 bg-white p-4 rounded-2xl shadow-2xl border-2 border-indigo-100 w-80 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                    <ArrowRightLeft size={16} /> Unit Converter
                </h4>
                <button onClick={() => setShowConverter(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <div className="flex gap-2 mb-4">
                    <input 
                        type="number" 
                        value={convertVal} 
                        onChange={(e) => setConvertVal(e.target.value)}
                        placeholder="0"
                        className="flex-1 p-2 rounded-lg border border-gray-200 font-mono text-lg text-right focus:border-indigo-500 outline-none"
                    />
                    <select 
                        value={convInputUnit}
                        onChange={(e) => setConvInputUnit(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-2 font-bold text-gray-600 outline-none"
                    >
                        {UNIT_DEFINITIONS[mode].map(u => (
                            <option key={u.code} value={u.code}>{u.code}</option>
                        ))}
                    </select>
                </div>
                
                <div className="space-y-2">
                    {getConversions().map((res, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                            <span className="text-gray-500 font-medium text-sm">=</span>
                            <span className="font-mono font-bold text-indigo-600">{res.val}</span>
                            <span className="text-xs font-bold text-gray-400 w-6 text-right">{res.unit}</span>
                        </div>
                    ))}
                    {convertVal === '' && <div className="text-center text-xs text-gray-400 italic">Enter a number to convert</div>}
                </div>
            </div>
        </div>
      )}

      {/* Unit Guide Modal */}
      {showUnitGuide && (
          <div className="absolute top-20 right-4 z-50 bg-white p-5 rounded-2xl shadow-2xl border-2 border-yellow-200 w-80 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                    <Info size={16} /> What are these units?
                </h4>
                <button onClick={() => setShowUnitGuide(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-3">
                {UNIT_DEFINITIONS[mode].map((u) => (
                    <div key={u.code} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                        <div className="text-2xl">{u.icon}</div>
                        <div>
                            <div className="font-bold text-yellow-900 text-sm">{u.name} ({u.code})</div>
                            <div className="text-xs text-yellow-700">{u.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 flex-none z-40 relative">
        <div className="flex space-x-2 bg-white p-1 rounded-full shadow-sm">
          <button onClick={() => setMode('length')} className={`px-6 py-2 rounded-full font-bold transition flex items-center ${mode === 'length' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-500 hover:bg-blue-50'}`}>
            <Ruler className="inline mr-2" size={18} /> Length
          </button>
          <button onClick={() => setMode('weight')} className={`px-6 py-2 rounded-full font-bold transition flex items-center ${mode === 'weight' ? 'bg-green-500 text-white shadow-md' : 'text-green-500 hover:bg-green-50'}`}>
            <Scale className="inline mr-2" size={18} /> Weight
          </button>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => { setShowConverter(!showConverter); setShowUnitGuide(false); }}
                className={`px-4 py-2 rounded-full font-bold transition flex items-center gap-2 shadow-sm border border-indigo-100 ${showConverter ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50'}`}
                title="Converter"
            >
                <Calculator size={18} />
            </button>
            <button 
                onClick={() => { setShowUnitGuide(!showUnitGuide); setShowConverter(false); }}
                className={`px-4 py-2 rounded-full font-bold transition flex items-center gap-2 shadow-sm border border-yellow-100 ${showUnitGuide ? 'bg-yellow-400 text-white' : 'bg-white text-yellow-600 hover:bg-yellow-50'}`}
                title="Unit Guide"
            >
                <HelpCircle size={18} />
            </button>
            
            {mode === 'length' && (
                <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase mr-2 ml-2">Units:</span>
                    <button onClick={() => { setLengthUnit('mm'); setFeedback('none'); }} className={`px-2 py-1 rounded text-sm font-bold transition ${lengthUnit === 'mm' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>mm</button>
                    <button onClick={() => { setLengthUnit('cm'); setFeedback('none'); }} className={`px-2 py-1 rounded text-sm font-bold transition ${lengthUnit === 'cm' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>cm</button>
                    <button onClick={() => { setLengthUnit('in'); setFeedback('none'); }} className={`px-2 py-1 rounded text-sm font-bold transition ${lengthUnit === 'in' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>in</button>
                </div>
            )}
        </div>
      </div>

      {mode === 'length' && (
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* Instruction Area */}
            <div className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl shadow-sm gap-4 flex-none transition-colors duration-300 ${feedback === 'incorrect' ? 'bg-red-50 border-2 border-red-200' : feedback === 'correct' ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-blue-100'}`}>
                {/* Left side: Instructions or Feedback Text */}
                <div className="flex items-center gap-3">
                    {feedback === 'incorrect' ? (
                         <div className="flex items-center gap-2 text-red-600 animate-pulse">
                             <X size={32} />
                             <span className="text-2xl font-black">Try Again!</span>
                         </div>
                    ) : feedback === 'correct' ? (
                         <div className="flex items-center gap-2 text-green-600">
                             <Check size={32} />
                             <span className="text-2xl font-black">Correct!</span>
                         </div>
                    ) : (
                        <>
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Move size={20} /></div>
                            <p className="text-gray-600 text-sm md:text-base font-bold">Drag object & ruler to measure.</p>
                        </>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-600">Length:</span>
                    <input 
                        type="number" 
                        value={userGuess}
                        onChange={(e) => { setUserGuess(e.target.value); setFeedback('none'); }}
                        placeholder="?"
                        className="w-24 p-2 bg-gray-100 text-gray-800 border-2 border-gray-200 rounded-lg font-mono text-xl text-center focus:border-blue-500 outline-none"
                    />
                    <span className="font-bold text-gray-500 uppercase text-sm w-8">{lengthUnit}</span>
                    
                    {feedback === 'correct' ? (
                        <button 
                            onClick={nextLengthLevel}
                            className="ml-2 px-6 py-2 rounded-lg font-bold text-white shadow-md transition flex items-center gap-2 bg-green-500 hover:bg-green-600 text-lg animate-pulse"
                        >
                            Next <ArrowRight size={24} />
                        </button>
                    ) : (
                         // Fix: Removed redundant type checks for feedback state as it cannot be 'correct' in this branch
                         <button 
                            onClick={checkLengthAnswer}
                            className="ml-2 px-4 py-2 rounded-lg font-bold text-white shadow-md transition flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                        >
                            Check
                        </button>
                    )}
                </div>
            </div>

            {/* Game Area */}
            <div 
                ref={containerRef}
                className="flex-1 relative bg-slate-100 rounded-2xl border-4 border-blue-200 shadow-inner overflow-hidden"
            >
                {feedback === 'correct' && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60 backdrop-blur-sm animate-fade-in-up">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border-4 border-green-400 max-w-sm mx-4 transform scale-100">
                            <div className="text-6xl mb-2">🎉</div>
                            <h3 className="text-2xl font-black text-green-600 mb-2">Spot On!</h3>
                            <p className="text-gray-600 mb-6 font-bold">You measured the {currentItem.name} perfectly.</p>
                            <button onClick={nextLengthLevel} className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-full font-black text-xl flex items-center justify-center gap-3 mx-auto shadow-xl hover:scale-105 transition">
                                NEXT ITEM <ArrowRight size={28} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Object to Measure */}
                <div 
                    onMouseDown={(e) => handleLengthStart(e, 'object')}
                    onTouchStart={(e) => handleLengthStart(e, 'object')}
                    className={`absolute h-20 bg-gradient-to-r ${currentItem.color} rounded-lg shadow-lg flex items-center justify-center font-bold z-10 cursor-grab active:cursor-grabbing select-none hover:shadow-xl transition-shadow`}
                    style={{ 
                        width: `${currentItem.width}px`,
                        left: `${objectPos.x}px`,
                        top: `${objectPos.y}px`,
                    }}
                >
                    <div className={`flex flex-col items-center ${currentItem.textColor} drop-shadow-md`}>
                        <span className="text-sm md:text-base">{currentItem.name}</span>
                        {feedback === 'incorrect' && <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full mt-1 animate-pulse border-2 border-white font-black shadow-lg">Try Again!</span>}
                    </div>
                </div>

                {/* Ruler */}
                <div 
                    onMouseDown={(e) => handleLengthStart(e, 'ruler')}
                    onTouchStart={(e) => handleLengthStart(e, 'ruler')}
                    className="absolute h-20 bg-yellow-300 border-b-4 border-r-2 border-yellow-500 rounded-t-sm flex items-end shadow-xl cursor-grab active:cursor-grabbing select-none hover:brightness-105 z-20"
                    style={{ 
                        width: `${rulerLengthUnits * currentPixelsPerUnit}px`, 
                        left: `${rulerPos.x}px`,
                        top: `${rulerPos.y}px`
                    }}
                >
                    {Array.from({ length: rulerLengthUnits + 1 }).map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute bottom-0 border-r border-yellow-900/60 flex flex-col justify-end items-center"
                            style={{ 
                                left: `${i * currentPixelsPerUnit}px`,
                                height: '100%',
                                width: '1px' 
                            }}
                        >
                            {/* For MM, we multiply label by 10. For others, it's just i */}
                            <span className="text-xs font-bold text-yellow-900 mb-6 select-none pointer-events-none">
                                {lengthUnit === 'mm' ? i * 10 : i}
                            </span>
                            <div className="h-4 w-px bg-yellow-900/80"></div>
                            {renderRulerTicks(i)}
                        </div>
                    ))}
                    <div className="absolute top-1 left-1 text-[10px] font-bold text-yellow-800 uppercase tracking-widest pointer-events-none">{lengthUnit}</div>
                </div>
            </div>
        </div>
      )}

      {mode === 'weight' && (
        <div className="flex-1 flex flex-col bg-white rounded-2xl border-4 border-green-200 shadow-inner overflow-hidden relative">
            {/* Header / Reset */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                 <button 
                    onClick={() => {
                        setPanItems({ left: [], right: [] });
                        setWeightChallenge(null);
                    }}
                    className="bg-white hover:bg-red-50 text-red-500 border border-red-200 p-2 rounded-full shadow-sm transition"
                    title="Clear Scale"
                 >
                     <RefreshCcw size={20} />
                 </button>
            </div>

            {/* Instruction / Challenge Bar */}
            <div className="absolute top-4 left-4 z-10 max-w-sm">
                 {!weightChallenge ? (
                    <div className="bg-white/90 backdrop-blur p-3 rounded-xl border border-blue-200 shadow-sm flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2 text-blue-700 font-bold">
                            <HelpCircle size={18} /> Exploration Mode
                        </div>
                        <p className="text-xs text-slate-600">Drag items to compare. Which side is heavier?</p>
                        <button 
                           onClick={startWeightPuzzle}
                           className="mt-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md transition"
                        >
                            <Play size={12} fill="white" /> New Puzzle
                        </button>
                    </div>
                 ) : (
                    <div className="bg-white/90 backdrop-blur p-3 rounded-xl border border-yellow-400 shadow-sm flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2 text-yellow-700 font-bold">
                            <HelpCircle size={18} /> Balance Puzzle
                        </div>
                        <p className="text-xs text-slate-600 font-medium">Add weights to the right to match the mystery box!</p>
                        {isBalanced ? (
                            <div className="w-full bg-green-100 text-green-700 font-bold text-xs p-2 rounded-lg text-center animate-bounce">
                                🎉 You did it!
                            </div>
                        ) : (
                            <div className={`w-full font-bold text-xs p-2 rounded-lg text-center ${statusColor === 'text-green-600' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {statusText}
                            </div>
                        )}
                        {isBalanced && (
                            <button 
                            onClick={startWeightPuzzle}
                            className="mt-1 w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition"
                            >
                                Next Puzzle
                            </button>
                        )}
                    </div>
                 )}
            </div>
            
            {/* Center Status Indicator */}
            {isBalanced && (
                 <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                     <div className="text-6xl animate-ping opacity-50">✨</div>
                 </div>
            )}

            {/* Main Scale Area */}
            <div className="flex-1 w-full flex items-center justify-center relative min-h-[250px] bg-gradient-to-b from-blue-50 to-white">
                
                {/* Scale Base */}
                <div className="absolute bottom-10 w-4 h-40 bg-slate-400 rounded-t-lg shadow-inner"></div>
                <div className="absolute bottom-10 w-32 h-4 bg-slate-400 rounded-full shadow-lg"></div>

                {/* Rotating Beam */}
                <div 
                    className="relative w-[300px] md:w-[400px] h-3 bg-slate-600 rounded-full transition-transform duration-500 ease-out shadow-xl z-20"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {/* Pivot Point */}
                    <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-slate-500 z-30 shadow-sm transition-colors ${isBalanced ? 'bg-green-400' : 'bg-slate-300'}`}></div>

                    {/* Left Pan Assembly */}
                    <div className="absolute left-0 top-1/2 h-24 w-1 bg-slate-400 origin-top" style={{ transform: `rotate(${-rotation}deg)` }}>
                         {/* String/Chain */}
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-slate-300"></div>
                         {/* Pan */}
                         <div 
                            ref={leftPanRef}
                            className="absolute top-20 left-1/2 -translate-x-1/2 w-28 h-16 border-b-4 border-l-2 border-r-2 border-slate-300 bg-white/40 backdrop-blur-sm rounded-b-3xl shadow-lg flex flex-col-reverse flex-wrap items-center justify-start content-center p-2 gap-1 transition-colors hover:bg-blue-50/50"
                         >
                            {panItems.left.map((item) => (
                                <div key={item.id} onMouseDown={(e) => startWeightDrag(e, item.type, 'left', item.id)} onTouchStart={(e) => startWeightDrag(e, item.type, 'left', item.id)} className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
                                    {renderWeightObject(item.type, 'w-8 h-8')}
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* Right Pan Assembly */}
                    <div className="absolute right-0 top-1/2 h-24 w-1 bg-slate-400 origin-top" style={{ transform: `rotate(${-rotation}deg)` }}>
                         {/* String/Chain */}
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-slate-300"></div>
                         {/* Pan */}
                         <div 
                            ref={rightPanRef}
                            className="absolute top-20 left-1/2 -translate-x-1/2 w-28 h-16 border-b-4 border-l-2 border-r-2 border-slate-300 bg-white/40 backdrop-blur-sm rounded-b-3xl shadow-lg flex flex-col-reverse flex-wrap items-center justify-start content-center p-2 gap-1 transition-colors hover:bg-blue-50/50"
                         >
                            {panItems.right.map((item) => (
                                <div key={item.id} onMouseDown={(e) => startWeightDrag(e, item.type, 'right', item.id)} onTouchStart={(e) => startWeightDrag(e, item.type, 'right', item.id)} className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
                                    {renderWeightObject(item.type, 'w-8 h-8')}
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>

            {/* Toy Shelf (Controls) */}
            <div className="h-32 bg-slate-100 border-t-4 border-slate-200 p-4 flex flex-col items-center shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-30">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Weight Shelf</p>
                <div className="flex gap-8 items-center">
                    {(['red', 'blue', 'gold'] as const).map(type => (
                        <div key={type} className="flex flex-col items-center group">
                             <div 
                                onMouseDown={(e) => startWeightDrag(e, type, 'shelf')}
                                onTouchStart={(e) => startWeightDrag(e, type, 'shelf')}
                                className="cursor-grab active:cursor-grabbing transform group-hover:-translate-y-2 transition-transform duration-200"
                             >
                                 {renderWeightObject(type, 'w-14 h-14 shadow-md')}
                             </div>
                             <div className="mt-2 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                {WEIGHT_TYPES[type].weight} units
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};