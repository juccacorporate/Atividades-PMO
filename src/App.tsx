import React, { useState, useEffect, useMemo } from 'react';
import { Task, Status, Priority, TabType, TaskType } from './types';
import { api } from './services/api';
import { 
  LayoutDashboard, 
  Database as DatabaseIcon, 
  Trello, 
  Calendar, 
  Plus, 
  Search,
  Briefcase,
  ListTodo,
  Activity,
  FileText,
  X,
  Copy,
  Mail
} from 'lucide-react';
import KanbanView from './components/KanbanView';
import DatabaseView from './components/DatabaseView';
import DashboardView from './components/DashboardView';
import TaskModal from './components/TaskModal';
import TaskSidePanel from './components/TaskSidePanel';
import LoginScreen from './components/LoginScreen';
import { isBefore, parseISO, format, startOfYear, endOfYear, addMonths, differenceInMonths, startOfMonth, endOfMonth } from 'date-fns';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('KANBAN_TAREFAS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filtros
  const [filterSolicitante, setFilterSolicitante] = useState('Todos');
  const [filterPrioridade, setFilterPrioridade] = useState('Todos');
  const [filterOwner, setFilterOwner] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  
  // Date Range Slider State (Monthly)
  const baseDate = useMemo(() => new Date(2023, 0, 1), []);
  const maxDate = useMemo(() => new Date(2030, 11, 31), []);
  const totalMonths = useMemo(() => differenceInMonths(maxDate, baseDate), [baseDate, maxDate]);
  
  const currentYearStartOffset = useMemo(() => differenceInMonths(startOfYear(new Date()), baseDate), [baseDate]);
  const currentYearEndOffset = useMemo(() => differenceInMonths(endOfYear(new Date()), baseDate), [baseDate]);
  
  const [dateRange, setDateRange] = useState<number[]>([currentYearStartOffset, currentYearEndOffset]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState({ title: '', body: '' });

  const startDate = useMemo(() => format(startOfMonth(addMonths(baseDate, dateRange[0])), 'yyyy-MM-dd'), [baseDate, dateRange[0]]);
  const endDate = useMemo(() => format(endOfMonth(addMonths(baseDate, dateRange[1])), 'yyyy-MM-dd'), [baseDate, dateRange[1]]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('Erro ao carregar dados. Verifique a conexão com o SheetDB.');
    }
    setLoading(false);
  };

  const solicitantes = useMemo(() => 
    ['Todos', ...Array.from(new Set(tasks.map(t => t.solicitante)))], 
    [tasks]
  );

  const owners = useMemo(() => 
    ['Todos', ...Array.from(new Set(tasks.map(t => t.owner_responsavel)))], 
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSolicitante = filterSolicitante === 'Todos' || task.solicitante === filterSolicitante;
      const matchPrioridade = filterPrioridade === 'Todos' || task.prioridade === filterPrioridade;
      const matchOwner = filterOwner === 'Todos' || task.owner_responsavel === filterOwner;
      const matchStatus = filterStatus === 'Todos' ? task.status !== Status.CONCLUIDO : task.status === filterStatus;
      const matchSearch = task.tarefa.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.nome_solicitante.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchDate = true;
      if (startDate && task.prazo < startDate) matchDate = false;
      if (endDate && task.prazo > endDate) matchDate = false;

      return matchSolicitante && matchPrioridade && matchOwner && matchStatus && matchSearch && matchDate;
    });
  }, [tasks, filterSolicitante, filterPrioridade, filterOwner, filterStatus, searchQuery, startDate, endDate]);

  const kanbanTasks = useMemo(() => {
    const type = activeTab === 'KANBAN_PROJETOS' ? TaskType.PROJETO : TaskType.TAREFA_DIARIA;
    return filteredTasks.filter(t => t.tipo === type);
  }, [filteredTasks, activeTab]);

  const handleSaveTask = async (taskData: Task) => {
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, taskData);
      } else {
        // Garantir que o ID seja único e numérico para evitar conflitos no SheetDB
        const newId = Date.now().toString();
        await api.createTask({ ...taskData, id: newId });
      }
      await loadTasks();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving task:', error);
      alert(`Erro ao salvar registro: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Deseja realmente excluir esta tarefa?')) {
      await api.deleteTask(id);
      loadTasks();
    }
  };

  const handleQuickUpdate = async (id: string, updates: Partial<Task>) => {
    try {
      await api.updateTask(id, updates);
      await loadTasks();
    } catch (error: any) {
      console.error('Error quick updating task:', error);
      alert(`Erro ao atualizar registro: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleGenerateReport = () => {
    const type = activeTab === 'KANBAN_PROJETOS' ? TaskType.PROJETO : TaskType.TAREFA_DIARIA;
    const reportTasks = filteredTasks.filter(t => t.tipo === type && t.status !== Status.CONCLUIDO);
    
    let reportText = `Relatório de Status - ${type}s em Andamento\nData: ${format(new Date(), 'dd/MM/yyyy')}\n\n`;
    
    if (reportTasks.length === 0) {
      reportText += 'Nenhum registro em andamento no momento.\n';
    } else {
      reportTasks.forEach(t => {
        reportText += `[${t.status}] ${t.tarefa}\n`;
        reportText += `Responsável: ${t.owner_responsavel} | Prazo: ${format(parseISO(t.prazo), 'dd/MM/yyyy')} | Progresso: ${t.progresso}%\n`;
        if (t.resumo) reportText += `Resumo: ${t.resumo}\n`;
        if (t.escalacoes) reportText += `Escalações/Bloqueios: ${t.escalacoes}\n`;
        if (t.acoes_proximos_passos) reportText += `Próximos Passos: ${t.acoes_proximos_passos}\n`;
        reportText += `--------------------------------------------------\n\n`;
      });
    }

    setReportData({
      title: `Relatório de Status - ${type}s`,
      body: reportText
    });
    setIsReportModalOpen(true);
  };

  const handleLogin = (password: string) => {
    if (password === 'Stellantis2026!') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Senha incorreta. Acesso negado.');
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans text-slate-200 overflow-x-hidden">
      {/* Header Superior */}
      <header className="bg-[#1E293B] border-b border-slate-700/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-violet-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">PMO Hub</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestão de Projetos e Tarefas</p>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800/50 border-slate-700 focus:bg-slate-800 focus:border-violet-500 border rounded-xl text-sm transition-all w-64 outline-none text-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateReport}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all border border-slate-700 hover:border-slate-600 active:scale-95 uppercase tracking-wider"
          >
            <FileText size={18} /> Relatórios
          </button>
          <button 
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-violet-500/10 active:scale-95 uppercase tracking-wider"
          >
            <Plus size={18} /> Novo Registro
          </button>
        </div>
      </header>

      {/* Barra de Navegação e Filtros */}
      <div className="bg-[#1E293B]/80 backdrop-blur-md border-b border-slate-700/50 px-6 py-3 flex flex-wrap items-center gap-8">
        <nav className="flex gap-1.5 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/30">
          {[
            { id: 'KANBAN_TAREFAS', icon: ListTodo, label: 'Tarefas Diárias' },
            { id: 'KANBAN_PROJETOS', icon: Briefcase, label: 'Projetos' },
            { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'DATABASE', icon: DatabaseIcon, label: 'Base de Dados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all tracking-wider ${
                activeTab === tab.id 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-6 flex-1">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Solicitante</span>
            <select 
              value={filterSolicitante}
              onChange={(e) => setFilterSolicitante(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-violet-500 text-slate-300"
            >
              {solicitantes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Prioridade</span>
            <select 
              value={filterPrioridade}
              onChange={(e) => setFilterPrioridade(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-violet-500 text-slate-300"
            >
              <option value="Todos">Todas</option>
              {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Owner</span>
            <select 
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-violet-500 text-slate-300"
            >
              {owners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-violet-500 text-slate-300"
            >
              <option value="Todos">Todos</option>
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[200px]">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Intervalo de Datas</span>
              <span className="text-[9px] font-bold text-violet-400 uppercase">
                {format(addMonths(baseDate, dateRange[0]), 'MMM yyyy')} - {format(addMonths(baseDate, dateRange[1]), 'MMM yyyy')}
              </span>
            </div>
            <div className="px-2 py-2">
              <Slider
                range
                min={0}
                max={totalMonths}
                value={dateRange}
                onChange={(val) => setDateRange(val as number[])}
                trackStyle={[{ backgroundColor: '#8B5CF6' }]}
                handleStyle={[
                  { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6', opacity: 1, boxShadow: 'none' },
                  { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6', opacity: 1, boxShadow: 'none' }
                ]}
                railStyle={{ backgroundColor: '#334155' }}
              />
            </div>
          </div>

          <button 
            onClick={() => {
              setFilterSolicitante('Todos');
              setFilterPrioridade('Todos');
              setFilterOwner('Todos');
              setFilterStatus('Todos');
              setDateRange([currentYearStartOffset, currentYearEndOffset]);
              setSearchQuery('');
            }}
            className="mt-auto mb-1 px-3 py-1.5 text-[10px] font-black text-slate-500 hover:text-violet-400 transition-colors uppercase tracking-widest"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-violet-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Sincronizando Dados...</p>
          </div>
        ) : (
          <div className={`flex-1 overflow-hidden grid transition-all duration-500 gap-6 ${
            selectedTask && (activeTab === 'KANBAN_TAREFAS' || activeTab === 'KANBAN_PROJETOS') 
              ? 'grid-cols-[1fr_340px]' 
              : 'grid-cols-1'
          }`}>
            <div className="overflow-auto custom-scrollbar min-w-0">
              {(activeTab === 'KANBAN_TAREFAS' || activeTab === 'KANBAN_PROJETOS') && (
                <KanbanView 
                  tasks={kanbanTasks} 
                  onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }} 
                  onTaskClick={(t) => setSelectedTask(t)}
                  onQuickUpdate={handleQuickUpdate}
                />
              )}
              {activeTab === 'DATABASE' && (
                <DatabaseView 
                  tasks={filteredTasks} 
                  onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }}
                  onDelete={handleDeleteTask}
                />
              )}
              {activeTab === 'DASHBOARD' && (
                <DashboardView tasks={filteredTasks} />
              )}
            </div>
            
            {selectedTask && (activeTab === 'KANBAN_TAREFAS' || activeTab === 'KANBAN_PROJETOS') && (
              <TaskSidePanel 
                task={selectedTask} 
                onClose={() => setSelectedTask(null)} 
                onEdit={() => { setEditingTask(selectedTask); setIsModalOpen(true); }}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1E293B] border-t border-slate-700/50 px-8 py-4 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
        <div className="flex gap-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
            Total: {tasks.length}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            Concluídos: {tasks.filter(t => t.progresso === 100).length}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
            Atraso: {tasks.filter(t => t.progresso < 100 && isBefore(parseISO(t.prazo), new Date())).length}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-50">PMO Hub v2.0</span>
          <div className="w-px h-3 bg-slate-700"></div>
          <span>© 2026 Stellantis</span>
        </div>
      </footer>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
        task={editingTask}
      />

      {/* Modal de Relatório */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="bg-violet-500/20 p-2 rounded-xl">
                  <FileText className="text-violet-400 w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">{reportData.title}</h2>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-8">
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                {reportData.body}
              </pre>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-800/20 flex gap-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(reportData.body);
                  alert('Relatório copiado para a área de transferência!');
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Copy size={16} /> Copiar Texto
              </button>
              <button 
                onClick={() => {
                  const subject = encodeURIComponent(reportData.title);
                  const body = encodeURIComponent(reportData.body);
                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
              >
                <Mail size={16} /> Enviar por E-mail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
