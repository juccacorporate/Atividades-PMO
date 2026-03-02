import React, { useState } from 'react';
import { Lock, ArrowRight, Activity } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (password: string) => void;
  error: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.03)_0%,transparent_70%)]"></div>
      </div>
      
      <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[3rem] w-full max-w-md shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-12">
          <div className="relative group">
            <div className="absolute -inset-4 bg-violet-500/20 rounded-3xl blur-xl group-hover:bg-violet-500/30 transition-all duration-500"></div>
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-2xl shadow-2xl relative">
              <Activity className="text-white w-10 h-10" />
            </div>
          </div>
          <div className="mt-8 text-center">
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">PMO Hub</h1>
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em]">Strategic Management System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block px-1">
              Security Access Key
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-violet-500/5 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm focus:bg-white/10 focus:border-violet-500/50 outline-none transition-all font-medium text-slate-100 placeholder-slate-600 backdrop-blur-md"
                placeholder="Enter access code..."
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-4 px-1 animate-in slide-in-from-top-2 duration-300">
                <div className="w-1 h-1 rounded-full bg-rose-500"></div>
                <p className="text-rose-400 text-[10px] font-black uppercase tracking-wider">{error}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="group relative bg-white text-black hover:bg-violet-50 w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative">Initialize Session</span>
            <ArrowRight size={16} className="relative group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <div className="w-1 h-1 rounded-full bg-slate-800"></div>
            <div className="w-1 h-1 rounded-full bg-slate-800"></div>
            <div className="w-1 h-1 rounded-full bg-slate-800"></div>
          </div>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.5em]">© 2026 Stellantis Hub</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
