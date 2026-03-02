
import React from 'react';
import { Task, Status, Priority, TaskType } from '../types';
import { Edit2, Trash2, AlertCircle, Briefcase, ListTodo } from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';

interface DatabaseViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ tasks, onEdit, onDelete }) => {
  const getStatusStyle = (status: Status) => {
    switch (status) {
      case Status.EM_ANDAMENTO: return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case Status.CONCLUIDO: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case Status.AGUARDANDO: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case Status.NAO_INICIADO: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-800 text-slate-500 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-[2rem] border border-slate-800/50 shadow-2xl overflow-hidden backdrop-blur-md">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-6 py-5">Tipo</th>
              <th className="px-6 py-5">Solicitante</th>
              <th className="px-6 py-5">Tarefa / Projeto</th>
              <th className="px-6 py-5">Resumo</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Prioridade</th>
              <th className="px-6 py-5">Owner Responsável</th>
              <th className="px-6 py-5">Prazo</th>
              <th className="px-6 py-5">Progresso</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {tasks.map((task, index) => {
              const isOverdue = task.progresso < 100 && isBefore(parseISO(task.prazo), new Date());
              
              return (
                <tr key={`${task.id}-${index}`} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.tipo === TaskType.PROJETO ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-violet-500'}`}>
                      {task.tipo === TaskType.PROJETO ? <Briefcase size={14} /> : <ListTodo size={14} />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-200">{task.solicitante}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{task.nome_solicitante}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300 max-w-xs truncate">{task.tarefa}</span>
                      {isOverdue && <AlertCircle size={12} className="text-rose-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{task.resumo || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      task.prioridade === Priority.ALTA ? 'text-rose-500' :
                      task.prioridade === Priority.MEDIA ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {task.prioridade}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-300">{task.owner_responsavel}</span>
                      <span className="text-[9px] text-slate-500 italic">{task.atores_correlatos}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-black ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                      {format(parseISO(task.prazo), 'dd/MM/yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden w-28">
                        <div 
                          className={`h-full shadow-[0_0_8px_rgba(139,92,246,0.5)] ${task.progresso === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`} 
                          style={{ width: `${task.progresso}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-300">{task.progresso}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => onEdit(task)}
                        className="p-2.5 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-xl transition-all border border-transparent hover:border-violet-500/20"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(task.id)}
                        className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatabaseView;
