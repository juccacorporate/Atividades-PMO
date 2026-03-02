import React, { useState } from 'react';
import { Task, Status, Priority, TaskType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle, Clock, AlertCircle, Activity, ListTodo, Briefcase, Sparkles, Loader2, X } from 'lucide-react';
import { isBefore, parseISO } from 'date-fns';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface DashboardViewProps {
  tasks: Task[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ tasks }) => {
  const [taskType, setTaskType] = useState<TaskType>(TaskType.TAREFA_DIARIA);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const dashboardTasks = tasks.filter(t => t.tipo === taskType);

  const handleGenerateDashboardAi = async () => {
    setLoadingAi(true);
    try {
      const analysis = await geminiService.analyzeDashboard(dashboardTasks, taskType);
      setAiAnalysis(analysis);
    } catch (error) {
      alert('Erro ao conectar com o Gemini. Verifique sua API Key.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!aiAnalysis) return;
    const text = `
${aiAnalysis.slideTitle.toUpperCase()}
--------------------------------------------------
SUMÁRIO EXECUTIVO:
${aiAnalysis.executiveSummary}

AGRUPAMENTOS (CLUSTERS):
${aiAnalysis.clusters.map((c: any) => `- ${c.name} (${c.count} itens): ${c.health} | ${c.insight}`).join('\n')}

ATIVIDADE CRÍTICA:
${aiAnalysis.criticalTask.name}
Motivo: ${aiAnalysis.criticalTask.reason}
Prazo: ${aiAnalysis.criticalTask.daysToDeadline} dias restantes

CORRELAÇÃO E IMPACTO:
${aiAnalysis.correlationInsight}

RECOMENDAÇÕES ESTRATÉGICAS:
${aiAnalysis.recommendations.map((r: string, i: number) => `${i+1}. ${r}`).join('\n')}
--------------------------------------------------
    `;
    navigator.clipboard.writeText(text);
    alert('Análise formatada para o PowerPoint copiada!');
  };

  const metrics = {
    total: dashboardTasks.length,
    concluidas: dashboardTasks.filter(t => t.status === Status.CONCLUIDO).length,
    emAndamento: dashboardTasks.filter(t => t.status === Status.EM_ANDAMENTO).length,
    atrasadas: dashboardTasks.filter(t => t.progresso < 100 && isBefore(parseISO(t.prazo), new Date())).length,
  };

  const statusData = Object.values(Status).map(status => ({
    name: status,
    value: dashboardTasks.filter(t => t.status === status).length
  })).filter(d => d.value > 0);

  const STATUS_COLORS = {
    [Status.STAND_BY]: '#64748B',
    [Status.NAO_INICIADO]: '#94A3B8',
    [Status.AGUARDANDO]: '#F59E0B',
    [Status.EM_ANDAMENTO]: '#3B82F6',
    [Status.CONCLUIDO]: '#10B981',
  };

  const solicitantesData = Object.entries(
    dashboardTasks.reduce((acc, task) => {
      acc[task.solicitante] = (acc[task.solicitante] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value: Number(value) })).sort((a, b) => b.value - a.value).slice(0, 5);

  const resumoCounts = dashboardTasks.reduce((acc, task) => {
    const key = task.resumo || 'Sem Resumo';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topResumos = Object.entries(resumoCounts)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-slate-800/30 p-1.5 rounded-2xl w-fit border border-slate-700/50">
          <button
            onClick={() => setTaskType(TaskType.TAREFA_DIARIA)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              taskType === TaskType.TAREFA_DIARIA 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ListTodo size={16} /> Tarefas Diárias
          </button>
          <button
            onClick={() => setTaskType(TaskType.PROJETO)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              taskType === TaskType.PROJETO 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Briefcase size={16} /> Projetos
          </button>
        </div>

        <button
          onClick={handleGenerateDashboardAi}
          disabled={loadingAi || dashboardTasks.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20 active:scale-95"
        >
          {loadingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Gerar Insights com IA
        </button>
      </div>

      {aiAnalysis && (
        <div className="bg-slate-900 border border-violet-500/30 rounded-[2.5rem] p-10 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-6 flex gap-3">
            <button 
              onClick={handleCopyAnalysis}
              className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
              Copiar para Slide
            </button>
            <button onClick={() => setAiAnalysis(null)} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">{aiAnalysis.slideTitle}</h3>
              <p className="text-xs text-violet-400 font-bold uppercase tracking-[0.2em]">Relatório Estratégico de IA</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 border-b border-slate-800 pb-2">Sumário Executivo</h4>
                <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{aiAnalysis.executiveSummary}"</p>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 border-b border-slate-800 pb-2">Agrupamentos (Clusters)</h4>
                <div className="grid grid-cols-1 gap-3">
                  {aiAnalysis.clusters.map((cluster: any, idx: number) => (
                    <div key={idx} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between group/item hover:border-violet-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-8 rounded-full ${cluster.health === 'Crítico' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                        <div>
                          <span className="text-xs font-black text-slate-200 block uppercase tracking-wider">{cluster.name}</span>
                          <span className="text-[10px] text-slate-400">{cluster.insight}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-violet-400 block">{cluster.count}</span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Itens</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6">
                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <AlertCircle size={14} /> Atividade Crítica do Período
                </h4>
                <div className="space-y-3">
                  <h5 className="text-lg font-black text-rose-100 leading-tight">{aiAnalysis.criticalTask.name}</h5>
                  <p className="text-xs text-rose-200/70 leading-relaxed">{aiAnalysis.criticalTask.reason}</p>
                  <div className="pt-4 flex items-center gap-2">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Prazo:</span>
                    <span className="text-xs font-black text-rose-100 bg-rose-500/20 px-3 py-1 rounded-lg">
                      {aiAnalysis.criticalTask.daysToDeadline} Dias Restantes
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 border-b border-slate-800 pb-2">Correlação e Impacto</h4>
                <div className="bg-violet-500/5 p-4 rounded-2xl border border-violet-500/10">
                  <p className="text-xs text-slate-300 leading-relaxed italic">{aiAnalysis.correlationInsight}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 border-b border-slate-800 pb-2">Recomendações Estratégicas</h4>
                <ul className="space-y-3">
                  {aiAnalysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                      <div className="bg-violet-500/20 p-1 rounded-md mt-0.5">
                        <CheckCircle size={10} className="text-violet-400" />
                      </div>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between group hover:border-violet-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Volume Filtrado</span>
            <Activity className="text-violet-400 w-5 h-5" />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-slate-100">{metrics.total}</span>
            <span className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Registros</span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Entregas Concluídas</span>
            <CheckCircle className="text-emerald-400 w-5 h-5" />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-emerald-400">{metrics.concluidas}</span>
            <span className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Finalizados</span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Em Execução</span>
            <Clock className="text-blue-400 w-5 h-5" />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-blue-400">{metrics.emAndamento}</span>
            <span className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Em Andamento</span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Atenção / Críticos</span>
            <AlertCircle className="text-rose-400 w-5 h-5" />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-rose-400">{metrics.atrasadas}</span>
            <span className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Atrasados</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Distribuição de Fluxo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as Status]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {statusData.map((status, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status.name as Status] }}></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest truncate">{status.name}: {status.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Top Solicitantes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={solicitantesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={({ name, value }) => `${name}: ${Math.round(value)}`}
                >
                  {solicitantesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(value: number) => [Math.round(value), 'Solicitações']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {solicitantesData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'][i % 5] }}></div>
                  <span className="truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="text-emerald-400">{Math.round(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Contagem por Resumo</h3>
          <div className="flex flex-col gap-2">
            {topResumos.slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-xl border border-slate-700/30">
                <span className="text-[10px] font-bold text-slate-300 truncate pr-4">{item.name}</span>
                <span className="text-[10px] font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg">{Math.round(item.value)}</span>
              </div>
            ))}
            {topResumos.length === 0 && (
              <span className="text-xs text-slate-500">Nenhum dado encontrado.</span>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Detalhamento e Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {dashboardTasks.map(task => (
              <div key={task.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block truncate">{task.tarefa}</span>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-widest truncate">{task.resumo || 'Sem resumo'}</span>
                  </div>
                  <span className={`shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                    task.status === Status.CONCLUIDO ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    task.status === Status.EM_ANDAMENTO ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {task.status}
                  </span>
                </div>
                {task.log && (
                  <div className="mt-2 pt-2 border-t border-slate-800/50">
                    <p className="text-[10px] text-slate-400 line-clamp-2 italic leading-tight">"{task.log}"</p>
                  </div>
                )}
              </div>
            ))}
            {dashboardTasks.length === 0 && (
              <span className="text-xs text-slate-500">Nenhum registro encontrado.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
