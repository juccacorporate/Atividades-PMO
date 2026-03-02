
import React, { useState, useEffect } from 'react';
import { Task, Status, Priority, TaskType } from '../types';
import { X, Save, FileText, Briefcase, ListTodo, User, Users, Calendar, BarChart2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    tipo: TaskType.TAREFA_DIARIA,
    solicitante: '',
    nome_solicitante: '',
    tarefa: '',
    resumo: '',
    status: Status.NAO_INICIADO,
    prioridade: Priority.MEDIA,
    owner_responsavel: '',
    atores_correlatos: '',
    inicio: new Date().toISOString().split('T')[0],
    prazo: new Date().toISOString().split('T')[0],
    progresso: '' as any,
    escalacoes: '',
    acoes_proximos_passos: '',
    log: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        resumo: task.resumo || '',
        nome_solicitante: task.nome_solicitante || '',
        atores_correlatos: task.atores_correlatos || '',
        escalacoes: task.escalacoes || '',
        acoes_proximos_passos: task.acoes_proximos_passos || '',
        log: task.log || '',
        progresso: task.progresso === undefined ? '' as any : task.progresso
      });
    } else {
      setFormData({
        tipo: TaskType.TAREFA_DIARIA,
        solicitante: '',
        nome_solicitante: '',
        tarefa: '',
        resumo: '',
        status: Status.NAO_INICIADO,
        prioridade: Priority.MEDIA,
        owner_responsavel: '',
        atores_correlatos: '',
        inicio: new Date().toISOString().split('T')[0],
        prazo: new Date().toISOString().split('T')[0],
        progresso: '' as any,
        escalacoes: '',
        acoes_proximos_passos: '',
        log: ''
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Task);
  };

  const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-slate-800 focus:border-violet-500 outline-none transition-all font-medium text-slate-200 placeholder-slate-500";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block px-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E293B] w-full max-w-5xl rounded-[2.5rem] shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="px-10 py-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
          <div className="flex items-center gap-4">
            <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-500/20">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {task ? 'Editar Registro' : 'Novo Registro PMO'}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Preencha os detalhes técnicos abaixo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {/* Tipo de Registro Selector */}
          <div className="flex gap-4 mb-10 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800/50 w-fit">
            {[TaskType.TAREFA_DIARIA, TaskType.PROJETO].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, tipo: type })}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  formData.tipo === type 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {type === TaskType.PROJETO ? <Briefcase size={16} /> : <ListTodo size={16} />}
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            <div className={formData.tipo === TaskType.TAREFA_DIARIA ? "lg:col-span-1" : "lg:col-span-2"}>
              <label className={labelClass}>Título da Tarefa / Projeto</label>
              <input 
                required
                value={formData.tarefa}
                onChange={e => setFormData({...formData, tarefa: e.target.value})}
                className={inputClass}
                placeholder="Ex: Migração de Servidores LatAm"
              />
            </div>

            {formData.tipo === TaskType.TAREFA_DIARIA && (
              <div>
                <label className={labelClass}>Resumo / Tipo de Solicitação</label>
                <input 
                  value={formData.resumo}
                  onChange={e => setFormData({...formData, resumo: e.target.value})}
                  className={inputClass}
                  placeholder="Ex: Falha Sistêmica, Apoio Operacional..."
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Solicitante (Empresa/Área)</label>
              <input 
                required
                value={formData.solicitante}
                onChange={e => setFormData({...formData, solicitante: e.target.value})}
                className={inputClass}
                placeholder="Ex: Stellantis"
              />
            </div>

            <div>
              <label className={labelClass}>Nome do Solicitante</label>
              <input 
                value={formData.nome_solicitante}
                onChange={e => setFormData({...formData, nome_solicitante: e.target.value})}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Owner Responsável</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  required
                  value={formData.owner_responsavel}
                  onChange={e => setFormData({...formData, owner_responsavel: e.target.value})}
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Atores Correlatos</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  value={formData.atores_correlatos}
                  onChange={e => setFormData({...formData, atores_correlatos: e.target.value})}
                  className={`${inputClass} pl-11`}
                  placeholder="Apoio / Stakeholders"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Status do Fluxo</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as Status})}
                className={inputClass}
              >
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Prioridade</label>
              <select 
                value={formData.prioridade}
                onChange={e => setFormData({...formData, prioridade: e.target.value as Priority})}
                className={inputClass}
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Data Início</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="date"
                  value={formData.inicio}
                  onChange={e => setFormData({...formData, inicio: e.target.value})}
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Prazo Final (Due Date)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="date"
                  value={formData.prazo}
                  onChange={e => setFormData({...formData, prazo: e.target.value})}
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Progresso Atual (%)</label>
              <div className="relative">
                <BarChart2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progresso === undefined ? '' : formData.progresso}
                  onChange={e => setFormData({...formData, progresso: e.target.value === '' ? undefined : parseInt(e.target.value)})}
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-800">
            <div className="flex flex-col gap-8">
              <div>
                <label className={labelClass}>Escalações / Bloqueios</label>
                <input 
                  type="text"
                  value={formData.escalacoes}
                  onChange={e => setFormData({...formData, escalacoes: e.target.value})}
                  className={inputClass}
                  placeholder="Impedimentos..."
                />
              </div>
              <div>
                <label className={labelClass}>Ações e Próximos Passos</label>
                <textarea 
                  value={formData.acoes_proximos_passos}
                  onChange={e => setFormData({...formData, acoes_proximos_passos: e.target.value})}
                  className={`${inputClass} h-32 resize-none leading-relaxed`}
                  placeholder="Defina os próximos passos..."
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Log de Evolução / Histórico</label>
              <textarea 
                value={formData.log}
                onChange={e => setFormData({...formData, log: e.target.value})}
                className={`${inputClass} h-[240px] resize-none leading-relaxed`}
                placeholder="Notas de evolução, decisões tomadas..."
              />
            </div>
          </div>
        </form>

        <div className="px-10 py-8 border-t border-slate-800 bg-slate-800/40 flex justify-end gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-violet-600 hover:bg-violet-500 text-white px-10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-violet-500/10 active:scale-95"
          >
            <Save size={18} /> {task ? 'Salvar Alterações' : 'Criar Registro'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
