import React, { useState } from 'react';
import { SimulationType } from './types';
import { MeasurementSim } from './components/simulations/MeasurementSim';
import { TimeSim } from './components/simulations/TimeSim';
import { MoneySim } from './components/simulations/MoneySim';
import { DataSim } from './components/simulations/DataSim';
import { PatternSim } from './components/simulations/PatternSim';
import { Ruler, Clock, DollarSign, BarChart, Shapes, Home, BookOpen } from 'lucide-react';

const TOPICS = [
  { id: SimulationType.MEASUREMENT, title: 'Measure It!', icon: Ruler, color: 'bg-blue-500', desc: 'Rulers & Scales' },
  { id: SimulationType.TIME, title: 'Tick Tock', icon: Clock, color: 'bg-purple-500', desc: 'Read the clock' },
  { id: SimulationType.MONEY, title: 'Money Shop', icon: DollarSign, color: 'bg-green-500', desc: 'Coins & Buying' },
  { id: SimulationType.DATA, title: 'Data Graphs', icon: BarChart, color: 'bg-pink-500', desc: 'Charts & Surveys' },
  { id: SimulationType.PATTERNS, title: 'Patterns', icon: Shapes, color: 'bg-indigo-500', desc: 'What comes next?' },
];

const App: React.FC = () => {
  const [currentSim, setCurrentSim] = useState<SimulationType>(SimulationType.HOME);

  const renderContent = () => {
    switch (currentSim) {
      case SimulationType.MEASUREMENT:
        return <MeasurementSim />;
      case SimulationType.TIME:
        return <TimeSim />;
      case SimulationType.MONEY:
        return <MoneySim />;
      case SimulationType.DATA:
        return <DataSim />;
      case SimulationType.PATTERNS:
        return <PatternSim />;
      default:
        return (
          <div className="h-full flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
               {TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setCurrentSim(topic.id)}
                    className={`${topic.color} group relative overflow-hidden rounded-3xl p-8 shadow-xl transition-all hover:scale-105 hover:shadow-2xl text-left`}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500">
                      <topic.icon size={120} color="white" />
                    </div>
                    <div className="relative z-10 text-white">
                      <topic.icon size={48} className="mb-4" />
                      <h2 className="text-3xl font-extrabold mb-2">{topic.title}</h2>
                      <p className="font-medium text-white/90">{topic.desc}</p>
                    </div>
                  </button>
               ))}
            </div>
          </div>
        );
    }
  };

  const currentTopicInfo = TOPICS.find(t => t.id === currentSim);

  return (
    <div className="fixed inset-0 bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm flex-none z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition" onClick={() => setCurrentSim(SimulationType.HOME)}>
             <div className="bg-yellow-400 p-2 rounded-xl">
                 <BookOpen className="text-white" size={24} />
             </div>
             <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">MathMagic <span className="text-yellow-500">Explorers</span></h1>
          </div>
          
          {currentSim !== SimulationType.HOME && (
             <button 
               onClick={() => setCurrentSim(SimulationType.HOME)}
               className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full font-bold transition text-sm md:text-base"
             >
               <Home size={18} />
               <span className="hidden md:inline">Back to Menu</span>
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-2 md:p-4 min-h-0 w-full max-w-7xl mx-auto">
         {currentSim !== SimulationType.HOME && (
             <div className="flex-none mb-2 md:mb-4 flex items-center space-x-3 animate-fade-in-up">
                 <div className={`p-2 rounded-xl ${currentTopicInfo?.color}`}>
                     {currentTopicInfo && <currentTopicInfo.icon className="text-white" size={20} />}
                 </div>
                 <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{currentTopicInfo?.title}</h2>
             </div>
         )}
         
         <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 md:p-6 custom-scrollbar">
                {renderContent()}
            </div>
         </div>
      </main>
    </div>
  );
};

export default App;