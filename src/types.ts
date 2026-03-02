
export enum Status {
  STAND_BY = 'Stand By',
  NAO_INICIADO = 'Não Iniciado',
  AGUARDANDO = 'Aguardando',
  EM_ANDAMENTO = 'Em Andamento',
  CONCLUIDO = 'Concluído'
}

export enum Priority {
  BAIXA = 'Baixa',
  MEDIA = 'Média',
  ALTA = 'Alta'
}

export enum TaskType {
  PROJETO = 'Projeto',
  TAREFA_DIARIA = 'Tarefa Diária'
}

export interface Task {
  id: string;
  tipo: TaskType;
  solicitante: string;
  nome_solicitante: string;
  tarefa: string;
  status: Status;
  prioridade: Priority;
  owner_responsavel: string;
  atores_correlatos: string;
  inicio: string;
  prazo: string;
  progresso: number;
  resumo?: string;
  escalacoes: string;
  acoes_proximos_passos?: string;
  log: string;
}

export type TabType = 'KANBAN_TAREFAS' | 'KANBAN_PROJETOS' | 'DASHBOARD' | 'DATABASE' | 'CALENDARIO';
