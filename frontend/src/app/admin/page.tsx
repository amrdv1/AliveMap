"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#05070A] text-white">
      <div className="w-64 bg-[#0a0f18] border-r border-gray-800 p-4 flex flex-col">
        <h2 className="font-bold text-xl mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <a href="#" className="p-2 bg-blue-600/20 text-blue-400 rounded">Dashboard</a>
          <a href="#" className="p-2 hover:bg-gray-800 rounded">Reports</a>
          <a href="#" className="p-2 hover:bg-gray-800 rounded">Sources</a>
          <a href="#" className="p-2 hover:bg-gray-800 rounded">Users</a>
        </nav>
        
        <button 
          onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
          className="mt-auto p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 text-left transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0a0f18] border border-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm">Total Reports</h3>
            <p className="text-3xl font-bold mt-2 text-blue-400">1,248</p>
          </div>
          <div className="bg-[#0a0f18] border border-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm">Active Sources</h3>
            <p className="text-3xl font-bold mt-2 text-green-400">12</p>
          </div>
          <div className="bg-[#0a0f18] border border-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm">Active Users</h3>
            <p className="text-3xl font-bold mt-2 text-purple-400">45</p>
          </div>
        </div>

        <div className="bg-[#0a0f18] border border-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Recent Reports</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
              Create Report
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>API connection established. No recent manual reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
