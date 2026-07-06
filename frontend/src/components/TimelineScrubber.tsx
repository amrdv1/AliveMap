import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function TimelineScrubber() {
  const { setThreats } = useStore();
  const [history, setHistory] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);

  useEffect(() => {
    // Fetch 24h history
    fetch('/api/threats/history')
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) {
              setHistory(data);
          }
      });
  }, []);

  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isPlaying && history.length > 0) {
          interval = setInterval(() => {
              setCurrentTimeIndex((prev) => {
                  if (prev >= history.length - 1) {
                      setIsPlaying(false);
                      return prev;
                  }
                  return prev + 1;
              });
          }, 500); // Replay speed
      }
      return () => clearInterval(interval);
  }, [isPlaying, history]);

  useEffect(() => {
      // Update threats in store based on scrubber
      if (history.length > 0) {
          const slice = history.slice(0, currentTimeIndex + 1);
          setThreats(slice);
      }
  }, [currentTimeIndex, history, setThreats]);

  if (history.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 md:w-1/2 bg-gray-900/80 backdrop-blur border border-gray-700 p-4 rounded-xl shadow-2xl z-50 flex items-center gap-4">
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-2 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <button 
        onClick={() => setCurrentTimeIndex(0)}
        className="p-2 bg-gray-800 rounded-full text-gray-300 hover:bg-gray-700 transition-colors"
      >
        <RotateCcw size={20} />
      </button>

      <div className="flex-1 flex flex-col gap-1">
          <input 
            type="range" 
            min="0" 
            max={history.length - 1} 
            value={currentTimeIndex}
            onChange={(e) => {
                setCurrentTimeIndex(parseInt(e.target.value));
                setIsPlaying(false);
            }}
            className="w-full accent-red-500"
          />
          <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>{new Date(history[0]?.updatedAt).toLocaleTimeString()}</span>
              <span>{new Date(history[currentTimeIndex]?.updatedAt).toLocaleTimeString()}</span>
              <span>{new Date(history[history.length - 1]?.updatedAt).toLocaleTimeString()}</span>
          </div>
      </div>
    </div>
  );
}
