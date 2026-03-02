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
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-violet-600 p-4 rounded-2xl shadow-lg shadow-violet-500/20 mb-6">
            <Activity className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">PMO Hub</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Gestão Estratégica</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block px-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-sm focus:bg-slate-800 focus:border-violet-500 outline-none transition-all font-medium text-slate-200 placeholder-slate-500"
                placeholder="Insira a senha..."
                autoFocus
              />
            </div>
            {error && (
              <p className="text-rose-400 text-xs font-bold mt-3 px-1 animate-in slide-in-from-top-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-500 text-white w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-violet-500/20 active:scale-95 mt-2"
          >
            Acessar <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">© 2026 Stellantis</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
