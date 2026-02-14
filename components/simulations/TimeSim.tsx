import React, { useState, useRef, useEffect } from 'react';
import { Clock, Sun, Moon, Info, Eye, EyeOff } from 'lucide-react';

const GUIDE_LABELS = [
  { text: "o'clock", min: 0, color: 'text-red-600', align: 'items-center' },
  { text: "Five past", min: 5, color: 'text-blue-600', align: 'items-center' },
  { text: "Ten past", min: 10, color: 'text-blue-600', align: 'items-center' },
  { text: "Quarter past", min: 15, color: 'text-blue-700 font-black', align: 'items-start' },
  { text: "Twenty past", min: 20, color: 'text-blue-600', align: 'items-center' },
  { text: "Twenty-five past", min: 25, color: 'text-blue-600', align: 'items-center' },
  { text: "Half past", min: 30, color: 'text-red-600 font-black', align: 'items-center' },
  { text: "Twenty-five to", min: 35, color: 'text-orange-600', align: 'items-center' },
  { text: "Twenty to", min: 40, color: 'text-orange-600', align: 'items-center' },
  { text: "Quarter to", min: 45, color: 'text-orange-700 font-black', align: 'items-end' },
  { text: "Ten to", min: 50, color: 'text-orange-600', align: 'items-center' },
  { text: "Five to", min: 55, color: 'text-orange-600', align: 'items-center' },
];

export const TimeSim: React.FC = () => {
  // Store time as total minutes from midnight (0 to 1439...)
  // Start at 9:00 AM = 540 minutes
  const [totalMinutes, setTotalMinutes] = useState(540);
  const [isDragging, setIsDragging] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  
  // Refs for drag logic
  const clockRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number>(0);
  const accumulatedDeltaRef = useRef<number>(0);

  // --- Time Calculations ---
  // Normalize to 0-24h range for display logic
  const normalizedTotal = ((totalMinutes % 1440) + 1440) % 1440;
  
  const hours24 = Math.floor(normalizedTotal / 60);
  const minutes = Math.floor(normalizedTotal % 60);
  
  const hours12 = hours24 % 12 || 12;
  const amPm = hours24 < 12 ? 'AM' : 'PM';
  const isDay = hours24 >= 6 && hours24 < 18;

  // Angles for hands
  const minuteAngle = minutes * 6; // 6 degrees per minute
  const hourAngle = (hours24 % 12) * 30 + (minutes * 0.5); // 30 deg per hour + 0.5 deg per minute

  // --- Spoken Time Logic ---
  const getSpokenTime = (h: number, m: number) => {
    const h12 = h % 12 || 12;
    const nextH = (h + 1) % 12 || 12;

    if (m === 0) return `${h12} o'clock`;
    if (m === 15) return `Quarter past ${h12}`;
    if (m === 30) return `Half past ${h12}`;
    if (m === 45) return `Quarter to ${nextH}`;

    if (m < 30) {
       if (m % 5 === 0) {
           const words: Record<number, string> = { 5: 'Five', 10: 'Ten', 20: 'Twenty', 25: 'Twenty-five' };
           return `${words[m]} past ${h12}`;
       }
       return `${m} minute${m === 1 ? '' : 's'} past ${h12}`;
    } else {
       const diff = 60 - m;
       if (diff % 5 === 0) {
           const words: Record<number, string> = { 5: 'Five', 10: 'Ten', 20: 'Twenty', 25: 'Twenty-five' };
           return `${words[diff]} to ${nextH}`;
       }
       return `${diff} minute${diff === 1 ? '' : 's'} to ${nextH}`;
    }
  };

  const spokenTime = getSpokenTime(hours24, minutes);

  // --- Interaction Logic ---
  const getAngleFromCenter = (clientX: number, clientY: number) => {
    if (!clockRef.current) return 0;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;
    
    // atan2 gives angle in radians from positive X axis (3 o'clock)
    // Range: -PI to PI
    let angleRad = Math.atan2(y, x);
    let angleDeg = angleRad * (180 / Math.PI);
    
    // Convert to clock-wise degrees starting from 12 o'clock
    // 12 o'clock is -90 degrees in atan2
    angleDeg += 90;
    if (angleDeg < 0) angleDeg += 360;
    
    return angleDeg;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    lastAngleRef.current = getAngleFromCenter(clientX, clientY);
    accumulatedDeltaRef.current = 0;

    // Attach global listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
  };

  const processMove = (clientX: number, clientY: number) => {
    const currentAngle = getAngleFromCenter(clientX, clientY);
    let delta = currentAngle - lastAngleRef.current;

    // Handle wrap-around (crossing the 12 o'clock line)
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // Add to accumulator
    accumulatedDeltaRef.current += delta;

    // 6 degrees = 1 minute
    const steps = Math.round(accumulatedDeltaRef.current / 6);

    if (steps !== 0) {
      setTotalMinutes(prev => prev + steps);
      // Remove used delta from accumulator
      accumulatedDeltaRef.current -= steps * 6;
    }

    lastAngleRef.current = currentAngle;
  };

  const handleMouseMove = (e: MouseEvent) => {
    processMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    processMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleMouseUp);
  };

  // --- Styles based on Time ---
  const theme = isDay ? {
    bg: 'bg-sky-100',
    clockFace: 'bg-white',
    clockBorder: 'border-sky-300',
    title: 'text-sky-800',
    text: 'text-sky-900',
    accent: 'text-amber-500',
    hand: 'bg-sky-600',
    digitalBg: 'bg-white/80'
  } : {
    bg: 'bg-slate-900',
    clockFace: 'bg-slate-800',
    clockBorder: 'border-indigo-500',
    title: 'text-indigo-200',
    text: 'text-indigo-100',
    accent: 'text-yellow-300',
    hand: 'bg-indigo-400',
    digitalBg: 'bg-slate-800/80'
  };

  return (
    <div className={`flex flex-col h-full ${theme.bg} p-4 rounded-xl items-center justify-center transition-colors duration-1000 relative overflow-hidden`}>
      
      {/* Background Decor */}
      <div className="absolute top-10 left-10 opacity-20 transition-all duration-1000">
        {isDay ? <Sun size={100} className="text-yellow-400 animate-spin-slow" /> : <Moon size={80} className="text-indigo-300" />}
      </div>

      <div className="flex items-center justify-between w-full max-w-md mb-8 z-10">
         <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.title} flex items-center`}>
            <Clock className="mr-3" size={32} /> What time is it?
         </h2>
         <button 
           onClick={() => setShowGuides(!showGuides)}
           className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-sm transition ${isDay ? 'bg-white text-sky-700 hover:bg-sky-50' : 'bg-slate-800 text-indigo-300 hover:bg-slate-700 border border-slate-700'}`}
         >
            {showGuides ? <EyeOff size={16}/> : <Eye size={16}/>}
            {showGuides ? 'Hide Guide' : 'Show Guide'}
         </button>
      </div>

      {/* Clock Container */}
      <div 
        ref={clockRef}
        className={`relative w-80 h-80 rounded-full border-8 ${theme.clockBorder} ${theme.clockFace} shadow-2xl flex items-center justify-center mb-10 select-none touch-none transition-colors duration-500`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Helper Hint */}
        <div className="absolute -top-12 text-sm font-bold text-gray-400 animate-bounce">
            {isDragging ? "Spin it!" : "👆 Grab the hand to spin!"}
        </div>

        {/* --- GUIDE OVERLAY --- */}
        {showGuides && (
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Dashed lines separating sectors */}
                {/* 12-6 line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-200 -translate-x-1/2"></div>
                {/* 9-3 line */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200 -translate-y-1/2"></div>

                {GUIDE_LABELS.map((guide, i) => {
                    const angleRad = (guide.min * 6 - 90) * (Math.PI / 180);
                    // Place text inside the numbers (numbers are r=130, container r=160)
                    // Place guides at r=95
                    const r = 95; 
                    const x = Math.cos(angleRad) * r;
                    const y = Math.sin(angleRad) * r;
                    
                    return (
                        <div 
                            key={i}
                            className={`absolute text-[10px] uppercase tracking-tighter ${guide.color} font-bold text-center w-20 flex justify-center`}
                            style={{ 
                                left: '50%', 
                                top: '50%',
                                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                            }}
                        >
                           <span className="bg-white/80 px-1 rounded backdrop-blur-[1px]">{guide.text}</span>
                        </div>
                    );
                })}
            </div>
        )}

        {/* Clock Face Numbers */}
        {Array.from({ length: 12 }).map((_, i) => {
           const num = i + 1;
           const angle = (num * 30) - 90;
           const radius = 130;
           const x = Math.cos(angle * (Math.PI / 180)) * radius;
           const y = Math.sin(angle * (Math.PI / 180)) * radius;
           return (
             <div 
               key={num} 
               className={`absolute font-bold text-xl ${isDay ? 'text-gray-600' : 'text-gray-300'} z-10 pointer-events-none`}
               style={{ transform: `translate(${x}px, ${y}px)` }}
             >
               {num}
             </div>
           );
        })}

        {/* Ticks */}
        {Array.from({ length: 60 }).map((_, i) => {
           const angle = (i * 6);
           const isHour = i % 5 === 0;
           return (
             <div 
               key={i} 
               className={`absolute origin-bottom ${isHour ? (isDay ? 'bg-gray-400 h-4 w-1' : 'bg-gray-500 h-4 w-1') : (isDay ? 'bg-gray-200 h-2 w-0.5' : 'bg-gray-600 h-2 w-0.5')}`}
               style={{ 
                   bottom: '50%',
                   left: '50%',
                   transform: `translateX(-50%) rotate(${angle}deg) translateY(-${isHour ? 120 : 130}px)`,
                   height: isHour ? '15px' : '8px',
                   transformOrigin: 'bottom center'
               }}
             />
           );
        })}

        {/* Hour Hand */}
        <div 
            className={`absolute w-2.5 h-20 ${isDay ? 'bg-gray-800' : 'bg-gray-200'} rounded-full origin-bottom z-10 pointer-events-none`}
            style={{ 
                left: '50%',
                bottom: '50%',
                transform: `translateX(-50%) rotate(${hourAngle}deg)`,
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
        />

        {/* Minute Hand (Interactive) */}
        <div 
            className={`absolute w-2 h-32 ${theme.hand} rounded-full origin-bottom z-20 group`}
            style={{ 
                left: '50%',
                bottom: '50%',
                transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
            }}
        >
            {/* Grab Handle at tip */}
            <div className={`absolute -top-4 -left-3 w-8 h-8 rounded-full ${isDragging ? 'scale-125 bg-yellow-400' : 'bg-white/50 group-hover:bg-yellow-200'} border-2 border-white transition-all shadow-sm`} />
        </div>

        {/* Center Dot */}
        <div className={`absolute w-5 h-5 ${theme.hand} border-2 border-white rounded-full z-30 shadow-md`}></div>
      </div>

      {/* Digital & Text Display */}
      <div className={`${theme.digitalBg} backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col items-center z-10 w-full max-w-sm text-center`}>
        <div className={`text-5xl md:text-6xl font-mono font-bold ${theme.text} mb-2 tabular-nums tracking-widest`}>
            {hours12}:{minutes < 10 ? `0${minutes}` : minutes}
            <span className="text-xl md:text-2xl ml-2 opacity-60">{amPm}</span>
        </div>
        
        {/* Spoken Time Phrase */}
        <div className="bg-yellow-100/50 px-4 py-2 rounded-lg w-full mb-3">
            <span className={`text-xl md:text-2xl font-black ${theme.text} block`}>{spokenTime}</span>
        </div>

        <div className={`flex items-center gap-2 ${theme.text} font-bold text-xs md:text-sm uppercase tracking-wider`}>
            {isDay ? <Sun size={16} className={theme.accent} /> : <Moon size={16} className={theme.accent} />}
            {isDay ? 'Daytime' : 'Nighttime'}
        </div>
      </div>
      
      {/* Instructions Overlay (fades out) */}
      {!isDragging && (
        <div className="absolute bottom-4 text-xs font-bold opacity-30 pointer-events-none select-none">
            MathMagic Sim v1.0
        </div>
      )}
    </div>
  );
};