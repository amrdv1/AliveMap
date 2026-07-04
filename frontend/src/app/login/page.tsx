"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      router.push('/admin');
    } else {
      alert('Login failed');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#05070A] text-white">
      <form onSubmit={handleLogin} className="bg-[#0a0f18] p-8 rounded-lg border border-gray-800 shadow-2xl flex flex-col gap-4 w-96">
        <h1 className="text-2xl font-bold text-center mb-4">Admin Login</h1>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-blue-500 transition-colors"
            required 
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="bg-[#111827] border border-gray-700 rounded p-2 text-white outline-none focus:border-blue-500 transition-colors"
            required 
          />
        </div>

        <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
          Login
        </button>
      </form>
    </div>
  );
}
