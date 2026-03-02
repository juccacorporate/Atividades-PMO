import React, { useState } from 'react';
import { Task, Status } from '../types';
import { X, Edit2, Calendar, Clock, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface TaskSidePanelProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
}

const TaskSidePanel: React.FC<TaskSidePanelProps> = ({ task, onClose, onEdit }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const isOverdue = task.progresso < 100 && isBefore(parseISO(task.prazo), new Date());

  const handleGetAiInsight = async () => {
    setLoadingAi(true);
    try {
      const insight = await geminiService.analyzeTask(task);
      setAiInsight(insight || 'Não foi possível gerar insights.');
    } catch (error) {
      alert('Erro ao gerar insights com IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="w-[340px] shrink-0 bg-slate-900 border border-slate-800 rounded-[2rem] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detalhes</h2>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-xl transition-all">
            <Edit2 size={14} />
          </button>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
              {task.tipo}
            </span>
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
              task.status === Status.CONCLUIDO ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              task.status === Status.EM_ANDAMENTO ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              task.status === Status.AGUARDANDO ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}>
              {task.status}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-1 leading-tight">{task.tarefa}</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">{task.resumo || 'Sem resumo definido.'}</p>
        </div>

        <div className="flex flex-col gap-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Solicitante</span>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-200 block">{task.solicitante}</span>
            </div>
          </div>
          <div className="w-full h-px bg-slate-700/30"></div>
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Responsável</span>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-200 block">{task.owner_responsavel}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Cronograma</h4>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-slate-800/30 p-2 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-300">Início</span>
              </div>
              <span className="text-[10px] font-black text-slate-200">{format(parseISO(task.inicio), 'dd/MM/yyyy')}</span>
            </div>
            <div className={`flex items-center justify-between p-2 rounded-xl border ${isOverdue ? 'bg-rose-500/10 border-rose-500/20' : 'bg-slate-800/30 border-slate-700/50'}`}>
              <div className="flex items-center gap-2">
                <Clock size={12} className={isOverdue ? 'text-rose-400' : 'text-slate-400'} />
                <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-300'}`}>Prazo</span>
              </div>
              <span className={`text-[10px] font-black ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>{format(parseISO(task.prazo), 'dd/MM/yyyy')}</span>
            </div>
            
            <div className="bg-slate-800/30 p-2 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-slate-300">Progresso</span>
                <span className="text-[10px] font-black text-violet-400">{task.progresso}%</span>
              </div>
              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${task.progresso === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                  style={{ width: `${task.progresso}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {task.escalacoes && (
          <div>
            <h4 className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1.5 border-b border-rose-500/20 pb-1 flex items-center gap-1">
              <AlertCircle size={10} /> Bloqueios
            </h4>
            <div className="bg-rose-500/5 p-2 rounded-xl border border-rose-500/10">
              <p className="text-[10px] text-rose-200/80 leading-relaxed">{task.escalacoes}</p>
            </div>
          </div>
        )}

        {task.acoes_proximos_passos && (
          <div>
            <h4 className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1.5 border-b border-amber-500/20 pb-1">Próximos Passos</h4>
            <div className="bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
              <p className="text-[10px] text-amber-200/80 leading-relaxed whitespace-pre-wrap">{task.acoes_proximos_passos}</p>
            </div>
          </div>
        )}

        {task.log && (
          <div>
            <h4 className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 border-b border-emerald-500/20 pb-1">Log</h4>
            <div className="bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
              <p className="text-[10px] text-emerald-200/80 leading-relaxed whitespace-pre-wrap">{task.log}</p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-800">
          {!aiInsight ? (
            <button
              onClick={handleGetAiInsight}
              disabled={loadingAi}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
            >
              {loadingAi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Gerar Insight IA
            </button>
          ) : (
            <div className="bg-slate-800/50 border border-violet-500/30 rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-violet-400" />
                  <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Análise do Consultor IA</span>
                </div>
                <button onClick={() => setAiInsight(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </div>
              <div className="markdown-body text-[10px] text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{aiInsight}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskSidePanel;
