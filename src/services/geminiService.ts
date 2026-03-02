import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async analyzeTask(task: Task) {
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      Você é um Consultor de PMO Sênior. Analise a seguinte tarefa/projeto e forneça insights estratégicos.
      
      DADOS DA TAREFA:
      - Título: ${task.tarefa}
      - Resumo: ${task.resumo || 'Não informado'}
      - Status: ${task.status}
      - Progresso: ${task.progresso}%
      - Prazo: ${task.prazo}
      - Escalações/Bloqueios: ${task.escalacoes || 'Nenhum'}
      - Log de Evolução: ${task.log || 'Sem histórico'}
      - Próximos Passos Atuais: ${task.acoes_proximos_passos || 'Não definidos'}
      
      REQUISITOS DA RESPOSTA (Seja conciso e direto):
      1. **Análise de Risco**: Avalie a saúde do prazo (Baixo, Médio ou Alto Risco).
      2. **Recomendações**: Sugira 2 ações concretas para acelerar ou destravar.
      3. **Resumo Executivo**: Um parágrafo curto sobre o estado atual.
      
      Responda em Markdown formatado para leitura rápida.
    `;

    try {
      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });
      
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Falha ao gerar insights com IA.");
    }
  },

  async analyzeDashboard(tasks: Task[], type: string) {
    const model = "gemini-3-flash-preview";
    
    const taskSummary = tasks.map(t => ({
      tarefa: t.tarefa,
      status: t.status,
      progresso: t.progresso,
      prioridade: t.prioridade,
      resumo: t.resumo,
      escalacoes: t.escalacoes,
      inicio: t.inicio,
      prazo: t.prazo
    }));

    const prompt = `
      Você é um Consultor de PMO Sênior especializado em apresentações executivas para Diretoria. 
      Analise o conjunto de ${type}s abaixo e forneça um relatório estruturado para um slide de PowerPoint.
      
      DADOS FILTRADOS:
      ${JSON.stringify(taskSummary, null, 2)}
      
      REQUISITOS DA ANÁLISE:
      1. **Clustering Inteligente**: Agrupe as tarefas por temas recorrentes (ex: "Falhas Sistêmicas", "Integração de Dados", "Infraestrutura"). Não use categorias genéricas se houver padrões específicos nos nomes ou resumos.
      2. **Saúde por Cluster**: Para cada cluster, defina se está "Estável" ou "Crítico" e dê um insight de 1 frase sobre o porquê.
      3. **Destaque de Criticidade**: Identifique a tarefa MAIS CRÍTICA. Calcule os dias restantes para o prazo (hoje é ${new Date().toISOString().split('T')[0]}).
      4. **Correlação de Impacto**: Explique como os bloqueios (escalações) de um cluster podem estar afetando o cronograma geral.
      
      RETORNE APENAS UM JSON no seguinte formato:
      {
        "slideTitle": "Título Executivo do Slide",
        "executiveSummary": "Resumo de 1 parágrafo focado em resultados e riscos.",
        "clusters": [
          { "name": "Nome do Cluster", "count": 0, "health": "Estável/Crítico", "insight": "Insight estratégico curto" }
        ],
        "criticalTask": { "name": "Nome da Tarefa", "reason": "Justificativa da criticidade baseada em logs/bloqueios", "daysToDeadline": 0 },
        "correlationInsight": "Explicação de como os clusters e bloqueios impactam o todo.",
        "recommendations": ["Ação imediata 1", "Ação imediata 2"]
      }
    `;

    try {
      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Falha ao gerar análise de Dashboard com IA.");
    }
  }
};
