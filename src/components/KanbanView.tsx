
import React, { useState } from 'react';
import { Task, Status, Priority } from '../types';
import { Clock, AlertCircle, ChevronRight, User, Users, CheckCircle, Sparkles } from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';

interface KanbanViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onTaskClick: (task: Task) => void;
  onQuickUpdate: (id: string, updates: Partial<Task>) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ tasks, onEdit, onTaskClick, onQuickUpdate }) => {
  const [hoveredTask, setHoveredTask] = useState<{ task: Task, x: number, y: number } | null>(null);
  const columns = Object.values(Status).filter(s => s !== Status.CONCLUIDO);

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.ALTA: return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
      case Priority.MEDIA: return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      case Priority.BAIXA: return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      default: return 'bg-slate-600';
    }
  };

  const getStatusColor = (s: Status) => {
    switch (s) {
      case Status.CONCLUIDO: return 'bg-emerald-500';
      case Status.EM_ANDAMENTO: return 'bg-violet-600';
      case Status.AGUARDANDO: return 'bg-amber-500';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="flex gap-6 h-full pb-6">
      {columns.map(status => {
        const columnTasks = tasks.filter(t => t.status === status);
        
        return (
          <div key={status} className="w-80 shrink-0 flex flex-col bg-slate-900/30 rounded-[2rem] border border-slate-800/50 backdrop-blur-sm">
            <div className="p-5 flex items-center justify-between border-b border-slate-800/50 bg-slate-800/20 rounded-t-[2rem]">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                <div className={`w-1.5 h-4 rounded-full shadow-lg ${getStatusColor(status)}`}></div>
                {status}
              </h3>
              <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-black text-slate-400 shadow-inner">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              {columnTasks.map((task, index) => {
                const isOverdue = task.progresso < 100 && isBefore(parseISO(task.prazo), new Date());
                
                return (
                    <div 
                      key={`${task.id}-${index}`}
                      onClick={() => onTaskClick(task)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const spaceOnRight = window.innerWidth - rect.right;
                        const previewWidth = 300; // w-72 is ~288px
                        
                        setHoveredTask({ 
                          task, 
                          x: spaceOnRight > previewWidth + 40 ? rect.right + 24 : rect.left - previewWidth - 24, 
                          y: rect.top 
                        });
                      }}
                      onMouseLeave={() => setHoveredTask(null)}
                      className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-violet-500/5 hover:border-violet-500/30 transition-all cursor-pointer group relative overflow-visible"
                    >
                      {/* Priority Indicator */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${getPriorityColor(task.prioridade)}`}></div>

                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-black text-violet-400 uppercase tracking-[0.15em] bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
                        {task.solicitante}
                      </span>
                      <div className="flex items-center gap-2">
                        {isOverdue && (
                          <div className="flex items-center gap-1 text-rose-500 animate-pulse">
                            <AlertCircle size={12} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Atrasado</span>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickUpdate(task.id, { status: Status.CONCLUIDO, progresso: 100 });
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all border border-transparent hover:border-emerald-500/20"
                          title="Marcar como Concluído"
                        >
                          <CheckCircle size={14} />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-[13px] font-bold text-slate-200 leading-relaxed mb-1 group-hover:text-violet-400 transition-colors">
                      {task.tarefa}
                    </h4>
                    {task.resumo && (
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">
                        {task.resumo}
                      </p>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <User size={12} className="text-slate-500" />
                          <span className="truncate">{task.owner_responsavel}</span>
                        </div>
                        {task.atores_correlatos && (
                          <div className="flex items-center gap-2 text-[9px] font-medium text-slate-500">
                            <Users size={12} className="text-slate-600" />
                            <span className="truncate italic">{task.atores_correlatos}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500">
                          <Clock size={12} />
                          {format(parseISO(task.prazo), 'dd/MM')}
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-violet-400">{task.progresso}%</span>
                           <div className="w-16 bg-slate-700 h-1 rounded-full overflow-hidden">
                             <div 
                               className="bg-violet-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
                               style={{ width: `${task.progresso}%` }}
                             ></div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-700 py-16">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center mb-3 opacity-50">
                    <ChevronRight size={24} className="rotate-90" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Vazio</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {hoveredTask && (
        <div 
          className="fixed bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[999] pointer-events-none animate-in fade-in zoom-in-95 duration-200 w-72"
          style={{ 
            left: `${hoveredTask.x}px`, 
            top: `${hoveredTask.y}px`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-4 rounded-full ${getPriorityColor(hoveredTask.task.prioridade)}`}></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Insight Rápido</span>
            </div>
            <Sparkles size={14} className="text-violet-400" />
          </div>
          
          <h5 className="text-sm font-bold text-white mb-4 leading-tight">{hoveredTask.task.tarefa}</h5>
          
          <div className="space-y-4">
            {hoveredTask.task.resumo && (
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/30">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Contexto</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">{hoveredTask.task.resumo}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-700/20">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block mb-1">Progresso</span>
                <span className="text-xs font-black text-violet-400">{hoveredTask.task.progresso}%</span>
              </div>
              <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-700/20">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block mb-1">Prazo</span>
                <span className={`text-xs font-black ${
                  hoveredTask.task.progresso < 100 && isBefore(parseISO(hoveredTask.task.prazo), new Date()) 
                    ? 'text-rose-400' 
                    : 'text-slate-200'
                }`}>
                  {format(parseISO(hoveredTask.task.prazo), 'dd/MM')}
                </span>
              </div>
            </div>

            {hoveredTask.task.log && (
              <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Última Atualização</span>
                <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3 italic">"{hoveredTask.task.log}"</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Responsável</span>
            <span className="text-[10px] font-bold text-slate-400">{hoveredTask.task.owner_responsavel}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanView;
