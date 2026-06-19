'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [defects, setDefects] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:4201/api/defects')
      .then(res => res.json())
      .then(data => setDefects(data.defects))
      .catch(err => console.error(err));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-5xl flex justify-between items-center mb-12 z-10 pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          FieldAI Dashboard
        </h1>
        <Link href="/billing" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-full font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <span>Manage Billing</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="w-full max-w-5xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 z-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Defects <span className="text-gray-500 text-sm font-normal ml-2">(Live Sync)</span></h2>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-gray-400">System Online</span>
          </div>
        </div>

        {defects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-xl font-medium text-gray-300">No defects reported yet.</p>
            <p className="text-gray-500 mt-2 max-w-md">Inspections captured in the field will automatically sync and appear here.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defects.map(d => (
              <li key={d.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col justify-between hover:bg-white/10 transition duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-gray-100 group-hover:text-white transition">{d.ai_label}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                    d.severity === 'high' || d.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    d.severity === 'med' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {d.severity.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-400 bg-black/30 p-3 rounded-lg border border-white/5 font-mono truncate">
                  {d.photo_url || 'No photo attached'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
