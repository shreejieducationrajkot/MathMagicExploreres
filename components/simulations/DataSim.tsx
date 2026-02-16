import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Plus, Minus, Info, HelpCircle, BarChart2 } from 'lucide-react';
import { DataPoint } from '../../types';

// Data for Bar and Pie charts
const INITIAL_SURVEY_DATA: DataPoint[] = [
  { name: 'Apples', value: 3, fill: '#ef4444' },
  { name: 'Bananas', value: 5, fill: '#eab308' },
  { name: 'Grapes', value: 2, fill: '#a855f7' },
  { name: 'Oranges', value: 4, fill: '#f97316' },
];

// Data for Line chart
const INITIAL_TREND_DATA = [
  { day: 'Mon', height: 2 },
  { day: 'Tue', height: 3 },
  { day: 'Wed', height: 5 },
  { day: 'Thu', height: 6 },
  { day: 'Fri', height: 8 },
];

// Data for Histogram
const INITIAL_HISTOGRAM_DATA = [
    { range: '0-5', count: 2, fill: '#0ea5e9' },
    { range: '6-10', count: 6, fill: '#0284c7' },
    { range: '11-15', count: 4, fill: '#0369a1' },
    { range: '16-20', count: 3, fill: '#075985' },
];

type GraphType = 'bar' | 'pie' | 'line' | 'histogram';

export const DataSim: React.FC = () => {
  const [graphType, setGraphType] = useState<GraphType>('bar');
  
  // State for Survey (Bar/Pie)
  const [surveyData, setSurveyData] = useState<DataPoint[]>(INITIAL_SURVEY_DATA);
  
  // State for Trend (Line)
  const [trendData, setTrendData] = useState(INITIAL_TREND_DATA);

  // State for Histogram
  const [histogramData, setHistogramData] = useState(INITIAL_HISTOGRAM_DATA);

  // -- Survey Handlers --
  const updateSurvey = (index: number, delta: number) => {
    setSurveyData(prev => {
      const newData = [...prev];
      const newVal = Math.max(0, newData[index].value + delta);
      newData[index] = { ...newData[index], value: newVal };
      return newData;
    });
  };

  // -- Trend Handlers --
  const updateTrend = (index: number, delta: number) => {
    setTrendData(prev => {
      const newData = [...prev];
      const newVal = Math.max(0, Math.min(15, newData[index].height + delta)); // Cap at 15 for scale
      newData[index] = { ...newData[index], height: newVal };
      return newData;
    });
  };

  // -- Histogram Handlers --
  const updateHistogram = (index: number, delta: number) => {
      setHistogramData(prev => {
          const newData = [...prev];
          const newVal = Math.max(0, newData[index].count + delta);
          newData[index] = { ...newData[index], count: newVal };
          return newData;
      });
  };

  // -- Render Helpers --
  const renderControls = () => {
    if (graphType === 'line') {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-100">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                    🌱 Plant Growth (cm)
                </h3>
                <div className="space-y-3">
                    {trendData.map((item, index) => (
                        <div key={item.day} className="flex items-center justify-between bg-indigo-50 p-2 rounded-lg">
                            <span className="font-bold text-indigo-900 w-12">{item.day}</span>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => updateTrend(index, -1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-indigo-600 font-bold border-2 border-indigo-200 hover:bg-indigo-100 transition"
                                >
                                    <Minus size={16} />
                                </button>
                                <div className="w-16 h-2 bg-indigo-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(item.height / 15) * 100}%` }}></div>
                                </div>
                                <span className="text-lg font-mono w-6 text-center text-indigo-700 font-bold">{item.height}</span>
                                <button 
                                    onClick={() => updateTrend(index, 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold shadow-md hover:bg-indigo-600 transition"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (graphType === 'histogram') {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-sky-100">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                    📊 Game Scores (Frequency)
                </h3>
                {histogramData.map((item, index) => (
                    <div key={item.range} className="flex items-center justify-between mb-4 last:mb-0">
                        <span className="font-bold text-lg w-24 text-gray-600 text-sm">Range {item.range}</span>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => updateHistogram(index, -1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="text-2xl font-mono w-8 text-center font-bold text-gray-700">{item.count}</span>
                            <button 
                                onClick={() => updateHistogram(index, 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-md transition transform active:scale-95"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Default: Survey Controls (Bar/Pie)
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-pink-100">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                🗳️ Class Vote
            </h3>
            {surveyData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between mb-4 last:mb-0">
                    <span className="font-bold text-lg w-24 text-gray-600">{item.name}</span>
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => updateSurvey(index, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-2xl font-mono w-8 text-center font-bold text-gray-700">{item.value}</span>
                        <button 
                            onClick={() => updateSurvey(index, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-500 text-white font-bold hover:bg-pink-600 shadow-md transition transform active:scale-95"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  const getExplanation = () => {
      switch(graphType) {
          case 'bar': return { title: 'Bar Chart', color: 'text-pink-600', bg: 'bg-pink-100', desc: "Great for comparing amounts! Which fruit has the most votes?" };
          case 'pie': return { title: 'Pie Chart', color: 'text-orange-600', bg: 'bg-orange-100', desc: "Shows parts of a whole. The big slice is the winner!" };
          case 'line': return { title: 'Line Chart', color: 'text-indigo-600', bg: 'bg-indigo-100', desc: "Perfect for showing change over time. Look how the plant grows!" };
          case 'histogram': return { title: 'Histogram', color: 'text-sky-600', bg: 'bg-sky-100', desc: "Groups data into ranges! See how many players scored in each range?" };
      }
  };

  const explanation = getExplanation();

  return (
    <div className="flex flex-col h-full bg-slate-50 p-2 md:p-4 rounded-xl overflow-hidden">
      
      {/* Navigation Tabs - Fixed at top */}
      <div className="flex-none flex flex-wrap justify-center gap-2 md:gap-4 mb-4 md:mb-6">
          <button 
            onClick={() => setGraphType('bar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm ${graphType === 'bar' ? 'bg-pink-500 text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-pink-50'}`}
          >
              <BarChart3 size={20} /> Bar Chart
          </button>
          <button 
            onClick={() => setGraphType('pie')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm ${graphType === 'pie' ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-orange-50'}`}
          >
              <PieChartIcon size={20} /> Pie Chart
          </button>
          <button 
            onClick={() => setGraphType('line')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm ${graphType === 'line' ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-indigo-50'}`}
          >
              <TrendingUp size={20} /> Line Chart
          </button>
          <button 
            onClick={() => setGraphType('histogram')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm ${graphType === 'histogram' ? 'bg-sky-500 text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-sky-50'}`}
          >
              <BarChart2 size={20} /> Histogram
          </button>
      </div>

      {/* Main Content - Flex layout to fit screen on md+ */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 min-h-0 overflow-y-auto md:overflow-hidden">
        
        {/* Controls Column - Mobile: Stacked, Tablet: Side column with scroll */}
        <div className="w-full md:w-1/3 flex-none md:overflow-y-auto custom-scrollbar flex flex-col gap-4 p-1">
            {renderControls()}
            
            <div className={`${explanation.bg} p-5 rounded-2xl ${explanation.color} border-2 border-white shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                    <HelpCircle size={24} />
                    <span className="font-bold text-lg">{explanation.title} Tip:</span>
                </div>
                <p className="font-medium">{explanation.desc}</p>
            </div>
        </div>

        {/* Chart Column - Mobile: Stacked with min-height, Tablet: Fills remaining space */}
        <div className="flex-1 bg-white p-4 rounded-3xl shadow-xl border-4 border-slate-100 flex flex-col min-h-[400px] md:min-h-0 md:h-full">
            <h3 className="flex-none text-center font-bold text-gray-400 mb-2 uppercase tracking-widest text-sm">Visualizing Data</h3>
            
            <div className="flex-1 w-full relative min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    {graphType === 'bar' ? (
                        <BarChart data={surveyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={500}>
                                {surveyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : graphType === 'pie' ? (
                        <PieChart>
                            <Pie
                                data={surveyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {surveyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    ) : graphType === 'line' ? (
                        <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="day" tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 15]} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                            <Line 
                                type="monotone" 
                                dataKey="height" 
                                stroke="#6366f1" 
                                strokeWidth={4} 
                                dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                                activeDot={{ r: 8 }} 
                                animationDuration={500}
                            />
                        </LineChart>
                    ) : (
                        // HISTOGRAM
                        <BarChart data={histogramData} barCategoryGap={0} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="range" tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} label={{ value: 'Score Ranges', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}/>
                            <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                            <Bar dataKey="count" radius={[2, 2, 0, 0]} animationDuration={500}>
                                {histogramData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="white" strokeWidth={1} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};