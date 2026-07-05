import React from 'react';

export default function LegendSidebar() {
  return (
    <div className="hidden lg:flex w-64 h-full bg-[#070b14]/90 backdrop-blur-md border-r border-gray-800/50 flex-col z-20 text-white overflow-y-auto custom-scrollbar">
      <div className="p-6 flex-1">
        
        <h3 className="text-gray-500 text-xs font-bold tracking-widest mb-6 uppercase">Легенда</h3>
        
        <div className="flex flex-col gap-5 mb-10">
          <LegendItem icon="triangle-red" label="БПЛА" />
          <LegendItem icon="missile-red" label="КРИЛАТА РАКЕТА" />
          <LegendItem icon="missile-orange" label="БАЛІСТИЧНА РАКЕТА" />
          <LegendItem icon="plane-blue" label="АВІАЦІЯ" />
          <LegendItem icon="plane-green" label="ППО" />
          <LegendItem icon="triangle-purple" label="КАБ" />
          <LegendItem icon="plane-gray" label="РОЗВІДКА" />
        </div>

        <h3 className="text-gray-500 text-xs font-bold tracking-widest mb-6 uppercase">Рівень загрози</h3>
        
        <div className="flex flex-col gap-4">
          <ThreatLevel color="bg-green-500" label="НИЗЬКИЙ" />
          <ThreatLevel color="bg-yellow-500" label="ПІДВИЩЕНИЙ" />
          <ThreatLevel color="bg-orange-500" label="ВИСОКИЙ" />
          <ThreatLevel color="bg-red-600" label="КРИТИЧНИЙ" />
        </div>
        
      </div>
    </div>
  );
}

function LegendItem({ icon, label }: { icon: string, label: string }) {
  // Simple CSS shapes for the legend to match vector UI
  const getIcon = () => {
    switch (icon) {
      case 'triangle-red':
        return <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-red-500 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]"></div>;
      case 'triangle-purple':
        return <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-purple-500 filter drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]"></div>;
      case 'missile-red':
        return <div className="w-1.5 h-4 bg-red-500 relative before:content-[''] before:absolute before:-top-1 before:left-0 before:w-0 before:h-0 before:border-l-[3px] before:border-r-[3px] before:border-b-[4px] before:border-l-transparent before:border-r-transparent before:border-b-red-500 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]"></div>;
      case 'missile-orange':
        return <div className="w-2 h-4 bg-orange-500 relative before:content-[''] before:absolute before:-top-1.5 before:left-0 before:w-0 before:h-0 before:border-l-[4px] before:border-r-[4px] before:border-b-[6px] before:border-l-transparent before:border-r-transparent before:border-b-orange-500 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]"></div>;
      case 'plane-blue':
        return <div className="w-4 h-4 bg-blue-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 50% 80%, 0% 100%)' }}></div>;
      case 'plane-green':
        return <div className="w-4 h-4 bg-green-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 50% 80%, 0% 100%)' }}></div>;
      case 'plane-gray':
        return <div className="w-4 h-4 bg-gray-400" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 50% 80%, 0% 100%)' }}></div>;
      default:
        return <div className="w-3 h-3 bg-white rounded-full"></div>;
    }
  };

  return (
    <div className="flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
      <div className="w-6 flex justify-center">
        {getIcon()}
      </div>
      <span className="text-xs font-medium tracking-wide">{label}</span>
    </div>
  );
}

function ThreatLevel({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
      <div className={`w-4 h-4 rounded ${color} shadow-lg shadow-${color.replace('bg-', '')}/20`}></div>
      <span className="text-xs font-medium tracking-wide">{label}</span>
    </div>
  );
}
