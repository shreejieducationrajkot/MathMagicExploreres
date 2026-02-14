import React, { useState, useEffect } from 'react';
import { ShoppingCart, Globe, RotateCcw, ArrowRight } from 'lucide-react';
import { Coin } from '../../types';

// Define extended coin type for local use
interface SimulationCoin extends Coin {
  label: string;
  isNote?: boolean;
  textColor?: string;
  borderColor?: string;
  shape?: string;
}

interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  multiplier: number;
  coins: SimulationCoin[];
  isZeroDecimal?: boolean; // For currencies like JPY or INR (often treated as whole numbers in simple contexts)
}

const ITEMS = [
  { name: 'Apple', basePrice: 0.50, emoji: '🍎' },
  { name: 'Toy Car', basePrice: 1.25, emoji: '🚗' },
  { name: 'Book', basePrice: 3.00, emoji: '📚' },
  { name: 'Crayons', basePrice: 2.50, emoji: '🖍️' },
  { name: 'Teddy Bear', basePrice: 5.00, emoji: '🧸' },
];

const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    multiplier: 1,
    coins: [
      { id: 'penny', value: 0.01, name: 'Penny', color: 'bg-orange-700', size: 10, label: '1¢' },
      { id: 'nickel', value: 0.05, name: 'Nickel', color: 'bg-gray-400', size: 12, label: '5¢' },
      { id: 'dime', value: 0.10, name: 'Dime', color: 'bg-gray-300', size: 9, label: '10¢' },
      { id: 'quarter', value: 0.25, name: 'Quarter', color: 'bg-gray-400', size: 14, label: '25¢' },
      { id: 'dollar', value: 1.00, name: 'Dollar', color: 'bg-green-600', size: 20, label: '$1', isNote: true },
    ]
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    multiplier: 80,
    isZeroDecimal: true,
    coins: [
      { id: 'inr1', value: 1, name: '₹1', color: 'bg-gray-400', size: 10, label: '₹1' },
      { id: 'inr2', value: 2, name: '₹2', color: 'bg-yellow-700', size: 12, label: '₹2' },
      { id: 'inr5', value: 5, name: '₹5', color: 'bg-yellow-600', size: 14, label: '₹5' },
      { id: 'inr10', value: 10, name: '₹10', color: 'bg-yellow-500', size: 16, label: '₹10', borderColor: 'border-yellow-600' },
      { id: 'inr20', value: 20, name: '₹20', color: 'bg-yellow-400', size: 18, label: '₹20' },
      { id: 'inr50', value: 50, name: '₹50', color: 'bg-teal-400', size: 20, label: '₹50', isNote: true },
      { id: 'inr100', value: 100, name: '₹100', color: 'bg-purple-400', size: 20, label: '₹100', isNote: true },
    ]
  },
  EUR: {
     code: 'EUR',
     symbol: '€',
     name: 'Euro',
     multiplier: 0.95,
     coins: [
        { id: 'eur5c', value: 0.05, name: '5 Cent', color: 'bg-orange-700', size: 10, label: '5c' },
        { id: 'eur10c', value: 0.10, name: '10 Cent', color: 'bg-yellow-500', size: 11, label: '10c' },
        { id: 'eur20c', value: 0.20, name: '20 Cent', color: 'bg-yellow-500', size: 13, label: '20c' },
        { id: 'eur50c', value: 0.50, name: '50 Cent', color: 'bg-yellow-500', size: 15, label: '50c' },
        { id: 'eur1', value: 1.00, name: '1 Euro', color: 'bg-gray-300', size: 16, label: '€1', borderColor: 'border-yellow-500' },
        { id: 'eur2', value: 2.00, name: '2 Euro', color: 'bg-yellow-500', size: 18, label: '€2', borderColor: 'border-gray-300' },
        { id: 'eur5', value: 5.00, name: '5 Euro', color: 'bg-gray-500', size: 20, label: '€5', isNote: true },
     ]
  },
  GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      multiplier: 0.8,
      coins: [
          { id: 'gbp1p', value: 0.01, name: '1 Penny', color: 'bg-orange-800', size: 9, label: '1p' },
          { id: 'gbp5p', value: 0.05, name: '5 Pence', color: 'bg-gray-300', size: 10, label: '5p' },
          { id: 'gbp10p', value: 0.10, name: '10 Pence', color: 'bg-gray-300', size: 12, label: '10p' },
          { id: 'gbp20p', value: 0.20, name: '20 Pence', color: 'bg-gray-300', size: 13, label: '20p', shape: 'hex' }, // Approximation
          { id: 'gbp50p', value: 0.50, name: '50 Pence', color: 'bg-gray-300', size: 15, label: '50p', shape: 'hex' },
          { id: 'gbp1', value: 1.00, name: '1 Pound', color: 'bg-yellow-500', size: 16, label: '£1', borderColor: 'border-gray-300' },
          { id: 'gbp2', value: 2.00, name: '2 Pounds', color: 'bg-gray-300', size: 18, label: '£2', borderColor: 'border-yellow-500' },
      ]
  }
};

export const MoneySim: React.FC = () => {
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [targetItemIdx, setTargetItemIdx] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [wallet, setWallet] = useState<SimulationCoin[]>([]);
  const [success, setSuccess] = useState(false);

  const currency = CURRENCIES[currencyCode];
  const targetItem = ITEMS[targetItemIdx];
  
  // Calculate price in current currency
  const getTargetPrice = () => {
    const raw = targetItem.basePrice * currency.multiplier;
    if (currency.isZeroDecimal) {
        // Round to nearest 5 for INR to make it cleaner, or just ceil
        return Math.ceil(raw / 5) * 5; 
    }
    return raw;
  };

  const targetPrice = getTargetPrice();

  useEffect(() => {
      // Reset when currency changes or item changes
      reset();
  }, [currencyCode, targetItemIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Check for success
    // Float comparison with small epsilon
    if (Math.abs(currentAmount - targetPrice) < 0.001) {
        setSuccess(true);
    } else {
        setSuccess(false);
    }
  }, [currentAmount, targetPrice]);

  const addToWallet = (coin: SimulationCoin) => {
    if (success) return;
    setWallet([...wallet, coin]);
    setCurrentAmount(prev => prev + coin.value);
  };

  const reset = () => {
    setWallet([]);
    setCurrentAmount(0);
    setSuccess(false);
  };

  const nextItem = () => {
    setTargetItemIdx((prev) => (prev + 1) % ITEMS.length);
  };

  const formatMoney = (amount: number) => {
      if (currency.isZeroDecimal) {
          return `${currency.symbol}${amount.toFixed(0)}`;
      }
      return `${currency.symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFBEB] p-4 md:p-6 rounded-3xl overflow-y-auto custom-scrollbar font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#92400E] flex items-center gap-3">
                <ShoppingCart className="text-[#D97706]" size={32} /> The Little Shop
            </h2>
            <p className="text-[#B45309] font-medium ml-11">Add coins to buy the item!</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-yellow-200 self-end md:self-auto">
            <Globe className="text-yellow-600" size={18} />
            <select 
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="bg-transparent font-bold text-yellow-800 text-sm outline-none cursor-pointer"
            >
                {Object.values(CURRENCIES).map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                ))}
            </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Item Card */}
        <div className="w-full md:w-1/3 bg-white rounded-[2rem] shadow-xl border-4 border-[#FDE047] p-6 flex flex-col items-center relative shrink-0">
             {success && (
                <div className="absolute inset-0 bg-green-500/10 z-20 flex items-center justify-center backdrop-blur-[2px] rounded-[1.7rem] animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl transform animate-bounce text-center border-4 border-green-400">
                        <span className="text-5xl block mb-2">🎉</span>
                        <h3 className="text-2xl font-bold text-green-600 mb-2">You bought it!</h3>
                        <button onClick={nextItem} className="mt-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transition">Next Item</button>
                    </div>
                </div>
            )}
            
            <div className="w-full flex justify-end mb-4">
                <button onClick={nextItem} className="text-gray-400 hover:text-gray-600 font-bold text-xs flex items-center gap-1 transition-colors">
                    Skip <ArrowRight size={14} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full mb-8">
                <div className="text-9xl mb-6 transform hover:scale-110 transition duration-300 cursor-pointer drop-shadow-sm filter">
                    {targetItem.emoji}
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">{targetItem.name}</h3>
                <div className="bg-[#bbf7d0] text-[#166534] px-10 py-2 rounded-full text-4xl font-bold shadow-sm">
                    {formatMoney(targetPrice)}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Controls */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
            
            {/* Money Display Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-slate-500 font-bold text-sm tracking-wider uppercase ml-2">Your Money:</span>
                <div className="flex items-center gap-4">
                     <span className={`text-4xl font-black ${currentAmount > targetPrice ? 'text-red-500' : success ? 'text-green-600' : 'text-slate-800'}`}>
                        {formatMoney(currentAmount)}
                    </span>
                    <button onClick={reset} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition" title="Reset">
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Drop Zone */}
            <div className="flex-1 bg-slate-100 rounded-2xl border-4 border-dashed border-slate-300 relative p-6 transition-all hover:bg-slate-50 overflow-y-auto custom-scrollbar">
                {wallet.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none opacity-60">
                         {/* Hand Icon representation */}
                        <div className="text-4xl mb-2">👆</div>
                        <p className="font-bold text-sm text-center">Click coins below to add them here</p>
                    </div>
                )}
                
                <div className="flex flex-wrap content-start gap-3 justify-center md:justify-start">
                    {wallet.map((coin, idx) => (
                        <div 
                            key={idx} 
                            className={`
                                ${coin.color} 
                                ${coin.isNote ? 'w-20 h-10 rounded-md' : `w-${coin.size} h-${coin.size} rounded-full`} 
                                shadow-sm flex items-center justify-center text-white font-bold border-2 border-white/40 animate-pop-in
                                ${coin.borderColor ? `border-2 ${coin.borderColor}` : ''}
                                ${coin.shape === 'hex' ? 'clip-path-hex' : ''}
                            `}
                            style={{ 
                                animationDelay: `${idx * 50}ms`,
                                clipPath: coin.shape === 'hex' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : undefined 
                            }}
                        >
                            <span className="text-[10px] md:text-xs shadow-black drop-shadow-sm">{coin.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coin Palette */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 border-b border-gray-100 pb-2">Pick Coins & Notes:</h4>
                <div className="flex flex-wrap gap-4 justify-center items-center">
                    {currency.coins.map(coin => (
                        <button 
                            key={coin.id}
                            onClick={() => addToWallet(coin)}
                            className="group flex flex-col items-center gap-1 transition transform active:scale-95 hover:-translate-y-1"
                        >
                            <div 
                                className={`
                                    ${coin.color} 
                                    ${coin.isNote ? 'w-20 h-10 rounded-md shadow-md' : 'w-12 h-12 md:w-14 md:h-14 rounded-full shadow-md'} 
                                    flex items-center justify-center text-white font-bold 
                                    border-2 ${coin.borderColor || 'border-transparent'}
                                    group-hover:shadow-lg group-hover:brightness-110 transition-all
                                `}
                                style={{ 
                                    clipPath: coin.shape === 'hex' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : undefined 
                                }}
                            >
                                <span className="drop-shadow-sm text-sm">{coin.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};