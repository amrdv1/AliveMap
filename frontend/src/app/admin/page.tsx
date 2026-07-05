"use client";

import React, { useState, useEffect } from 'react';
import { Target, Activity, Database, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'objects' | 'api' | 'changes'>('objects');
  const [threats, setThreats] = useState<any[]>([]);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [changeLogs, setChangeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'objects') {
        const res = await fetch(`${apiUrl}/api/admin/threats`);
        const data = await res.json();
        setThreats(data);
      } else if (activeTab === 'api') {
        const res = await fetch(`${apiUrl}/api/admin/api-logs`);
        const data = await res.json();
        setApiLogs(data);
      } else if (activeTab === 'changes') {
        const res = await fetch(`${apiUrl}/api/admin/change-logs`);
        const data = await res.json();
        setChangeLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this threat?')) {
      await fetch(`${apiUrl}/api/admin/threats/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleAddDemo = async () => {
    await fetch(`${apiUrl}/api/admin/threats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'DRONE',
        lat: 48.3794,
        lng: 31.1656,
        speed: 180,
        course: 90,
        confidence: 1.0,
        status: 'ACTIVE'
      })
    });
    fetchData();
  };

  const handleClearAll = async () => {
    if (confirm('Впевнені, що хочете видалити ВСІ цілі на мапі? Це незворотня дія!')) {
      await fetch(`${apiUrl}/api/admin/threats/clear-all`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Database className="text-red-500" />
          Панель Адміністратора
        </h1>

        <div className="flex gap-4 border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('objects')}
            className={`pb-4 px-4 flex items-center gap-2 font-medium transition-colors ${activeTab === 'objects' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Target size={18} /> Список Об'єктів
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-4 px-4 flex items-center gap-2 font-medium transition-colors ${activeTab === 'api' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Activity size={18} /> Журнал API
          </button>
          <button
            onClick={() => setActiveTab('changes')}
            className={`pb-4 px-4 flex items-center gap-2 font-medium transition-colors ${activeTab === 'changes' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Database size={18} /> Журнал Змін
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse text-gray-500">Завантаження...</div>
        ) : (
          <div>
            {activeTab === 'objects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Активні та Завершені Цілі</h2>
                  <div className="flex gap-4">
                    <button onClick={handleClearAll} className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Trash2 size={18} /> Очистити Мапу
                    </button>
                    <button onClick={handleAddDemo} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Plus size={18} /> Додати Демо-ціль
                    </button>
                  </div>
                </div>
                <div className="bg-[#0a0f18] border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-[#111827] text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4">Тип</th>
                        <th className="px-6 py-4">Статус</th>
                        <th className="px-6 py-4">Швидкість</th>
                        <th className="px-6 py-4">Курс</th>
                        <th className="px-6 py-4 text-right">Дії</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {threats.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium">{t.type}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${t.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-gray-700 text-gray-300'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{t.speed ? `${t.speed.toFixed(0)} км/год` : '-'}</td>
                          <td className="px-6 py-4">{t.course ? `${t.course.toFixed(0)}°` : '-'}</td>
                          <td className="px-6 py-4 flex justify-end gap-3">
                            <button className="text-gray-400 hover:text-white transition-colors"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                      {threats.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Немає об'єктів</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Журнал запитів API</h2>
                <div className="space-y-4">
                  {apiLogs.map(log => (
                    <div key={log.id} className="bg-[#0a0f18] border border-gray-800 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-red-400 font-bold">{log.source?.name || 'Unknown API'}</span>
                          <span className="text-gray-500 text-sm ml-4">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${log.status >= 400 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2 font-mono">{log.endpoint}</div>
                      <pre className="text-xs bg-[#05070a] p-3 rounded text-gray-300 overflow-x-auto border border-gray-800">
                        {log.payload}
                      </pre>
                    </div>
                  ))}
                  {apiLogs.length === 0 && <div className="text-center text-gray-500 py-8">Немає записів</div>}
                </div>
              </div>
            )}

            {activeTab === 'changes' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Журнал змін (Аудит)</h2>
                <div className="bg-[#0a0f18] border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-[#111827] text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4">Дата</th>
                        <th className="px-6 py-4">Користувач</th>
                        <th className="px-6 py-4">Дія</th>
                        <th className="px-6 py-4">Сутність</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {changeLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-800/50">
                          <td className="px-6 py-4">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-400">{log.user?.email || log.userId}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.action === 'CREATE' ? 'text-green-400 bg-green-400/10' : log.action === 'DELETE' ? 'text-red-400 bg-red-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{log.entity} ({log.entityId.substring(0, 8)}...)</td>
                        </tr>
                      ))}
                      {changeLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Немає записів</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
