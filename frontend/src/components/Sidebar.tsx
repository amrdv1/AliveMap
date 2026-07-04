"use client";

import { useStore } from '../store/useStore';
import { Settings, Filter, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { reports, filters, setFilter } = useStore();

  return (
    <div className="w-80 h-full bg-[#0a0f18]/80 backdrop-blur-md border-r border-gray-800 flex flex-col z-10">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-blue-500 w-6 h-6" />
          <h1 className="font-bold text-xl tracking-wider">AIRMAP</h1>
        </div>
        <Settings className="text-gray-400 cursor-pointer hover:text-white" />
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase">Live Feed</h2>
          <Filter className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#111827] border border-gray-800 p-3 rounded-lg flex flex-col gap-2 cursor-pointer hover:bg-[#1f2937] transition-colors shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded bg-opacity-20 ${
                    report.type === 'DRONE' ? 'text-blue-400 bg-blue-500' :
                    report.type === 'MISSILE' ? 'text-red-400 bg-red-500' :
                    report.type === 'AIRCRAFT' ? 'text-yellow-400 bg-yellow-500' :
                    'text-purple-400 bg-purple-500'
                  }`}>
                    {report.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(report.time).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  Confidence: {report.confidence}%
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {reports.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">No active reports</div>
          )}
        </div>
      </div>
    </div>
  );
}
