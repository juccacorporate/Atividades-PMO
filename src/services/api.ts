
import { Task, Status, Priority, TaskType } from '../types';

const API_URL = 'https://sheetdb.io/api/v1/gs249z65ewued';

export const api = {
  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Falha ao buscar tarefas');
      const data = await response.json();
      
      return data
        .filter((item: any) => item.id)
        .map((item: any) => ({
          ...item,
          id: item.id,
          progresso: parseInt(item.progresso) || 0,
          tipo: item.tipo || TaskType.TAREFA_DIARIA,
          status: item.status || Status.NAO_INICIADO,
          prioridade: item.prioridade || Priority.MEDIA,
        }));
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async createTask(task: Task): Promise<void> {
    const cleanData = {
      id: String(task.id || Date.now().toString()),
      tipo: String(task.tipo || ''),
      solicitante: String(task.solicitante || ''),
      nome_solicitante: String(task.nome_solicitante || ''),
      tarefa: String(task.tarefa || ''),
      resumo: String(task.resumo || ''),
      status: String(task.status || ''),
      prioridade: String(task.prioridade || ''),
      owner_responsavel: String(task.owner_responsavel || ''),
      atores_correlatos: String(task.atores_correlatos || ''),
      inicio: String(task.inicio || ''),
      prazo: String(task.prazo || ''),
      progresso: String(task.progresso || '0'),
      escalacoes: String(task.escalacoes || ''),
      acoes_proximos_passos: String(task.acoes_proximos_passos || ''),
      log: String(task.log || '')
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ data: [cleanData] }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SheetDB Error: ${errorText}`);
    }
  },

  async updateTask(id: string, task: Partial<Task>): Promise<void> {
    if (!id) throw new Error('Cannot update task without an ID');

    const cleanData: any = {};
    if (task.id !== undefined) cleanData.id = String(task.id);
    if (task.tipo !== undefined) cleanData.tipo = String(task.tipo);
    if (task.solicitante !== undefined) cleanData.solicitante = String(task.solicitante);
    if (task.nome_solicitante !== undefined) cleanData.nome_solicitante = String(task.nome_solicitante);
    if (task.tarefa !== undefined) cleanData.tarefa = String(task.tarefa);
    if (task.resumo !== undefined) cleanData.resumo = String(task.resumo);
    if (task.status !== undefined) cleanData.status = String(task.status);
    if (task.prioridade !== undefined) cleanData.prioridade = String(task.prioridade);
    if (task.owner_responsavel !== undefined) cleanData.owner_responsavel = String(task.owner_responsavel);
    if (task.atores_correlatos !== undefined) cleanData.atores_correlatos = String(task.atores_correlatos);
    if (task.inicio !== undefined) cleanData.inicio = String(task.inicio);
    if (task.prazo !== undefined) cleanData.prazo = String(task.prazo);
    if (task.progresso !== undefined) cleanData.progresso = String(task.progresso);
    if (task.escalacoes !== undefined) cleanData.escalacoes = String(task.escalacoes);
    if (task.acoes_proximos_passos !== undefined) cleanData.acoes_proximos_passos = String(task.acoes_proximos_passos);
    if (task.log !== undefined) cleanData.log = String(task.log);

    const response = await fetch(`${API_URL}/id/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ data: cleanData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SheetDB Error: ${errorText}`);
    }
  },

  async deleteTask(id: string): Promise<void> {
    if (!id) throw new Error('Cannot delete task without an ID');
    
    const response = await fetch(`${API_URL}/id/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SheetDB Error: ${errorText}`);
    }
  }
};
