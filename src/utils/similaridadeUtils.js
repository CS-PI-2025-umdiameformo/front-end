/**
 * Utilitários para calcular similaridade entre strings
 * Usado para identificar e sugerir unificação de entradas duplicadas
 */

/**
 * Calcula a distância de Levenshtein entre duas strings (versão simplificada)
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {number} Distância de Levenshtein
 */
export const calcularDistanciaLevenshtein = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Matriz de distâncias
  const matriz = Array(s1.length + 1).fill(null).map(() => 
    Array(s2.length + 1).fill(0)
  );
  
  // Inicializa primeira linha e coluna
  for (let i = 0; i <= s1.length; i++) matriz[i][0] = i;
  for (let j = 0; j <= s2.length; j++) matriz[0][j] = j;
  
  // Calcula distâncias
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const custo = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1,      // deleção
        matriz[i][j - 1] + 1,      // inserção
        matriz[i - 1][j - 1] + custo // substituição
      );
    }
  }
  
  return matriz[s1.length][s2.length];
};

/**
 * Calcula a similaridade percentual entre duas strings usando Levenshtein
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {number} Percentual de similaridade (0-100)
 */
export const calcularSimilaridade = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const distancia = calcularDistanciaLevenshtein(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  if (maxLength === 0) return 100;
  
  const similaridade = ((maxLength - distancia) / maxLength) * 100;
  return Math.round(similaridade * 100) / 100;
};

/**
 * Normaliza string removendo acentos e caracteres especiais
 * @param {string} str - String para normalizar
 * @returns {string} String normalizada
 */
export const normalizarString = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, ' '); // Normaliza espaços
};

/**
 * Verifica se duas strings são similares após normalização
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {boolean} True se são similares
 */
export const saoSimilares = (str1, str2) => {
  const n1 = normalizarString(str1);
  const n2 = normalizarString(str2);
  return n1 === n2 || calcularSimilaridade(n1, n2) >= 85;
};

/**
 * Calcula similaridade composta (versão otimizada)
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {object} Objeto com métricas de similaridade
 */
export const calcularSimilaridadeComposta = (str1, str2) => {
  // Similaridade básica (case-insensitive)
  const similaridadeBasica = calcularSimilaridade(str1, str2);
  
  // Similaridade normalizada (sem acentos)
  const similaridadeNormalizada = calcularSimilaridade(
    normalizarString(str1),
    normalizarString(str2)
  );
  
  // Pontuação: média ponderada (70% básica, 30% normalizada)
  const pontuacao = Math.round(
    similaridadeBasica * 0.7 + similaridadeNormalizada * 0.3
  );
  
  return {
    pontuacao,
    similaridadeExata: str1 === str2 ? 100 : 0,
    similaridadeLevenshtein: similaridadeBasica,
    similaridadeNormalizada,
    similaridadeFonetica: saoSimilares(str1, str2) ? 100 : 0,
    nivelConfianca: obterNivelConfianca(pontuacao)
  };
};

/**
 * Determina o nível de confiança baseado na pontuação
 * @param {number} pontuacao - Pontuação de similaridade (0-100)
 * @returns {string} Nível de confiança (alta, media, baixa)
 */
export const obterNivelConfianca = (pontuacao) => {
  if (pontuacao >= 85) return 'alta';
  if (pontuacao >= 70) return 'media';
  return 'baixa';
};

/**
 * Busca entradas similares em uma lista (versão simplificada)
 * @param {string} termo - Termo de busca
 * @param {array} lista - Lista de objetos para comparar
 * @param {string} campo - Campo do objeto a ser comparado
 * @param {number} limiarMinimo - Limiar mínimo de similaridade (0-100)
 * @returns {array} Array de resultados similares com pontuação
 */
export const buscarEntradasSimilares = (termo, lista, campo, limiarMinimo = 70) => {
  if (!termo || !lista || lista.length === 0) return [];
  
  return lista
    .map(item => {
      const valorCampo = item[campo];
      if (!valorCampo) return null;
      
      const metricas = calcularSimilaridadeComposta(termo, valorCampo);
      
      return {
        item,
        metricas,
        campo: valorCampo
      };
    })
    .filter(resultado => resultado && resultado.metricas.pontuacao >= limiarMinimo)
    .sort((a, b) => b.metricas.pontuacao - a.metricas.pontuacao);
};

/**
 * Agrupa entradas similares (versão otimizada)
 * @param {array} lista - Lista de objetos
 * @param {string} campo - Campo a ser comparado
 * @param {number} limiarMinimo - Limiar mínimo de similaridade
 * @returns {array} Array de grupos de entradas similares
 */
export const agruparEntradasSimilares = (lista, campo, limiarMinimo = 75) => {
  if (!lista || lista.length === 0) return [];
  
  const grupos = [];
  const usados = new Set();
  
  for (let i = 0; i < lista.length; i++) {
    if (usados.has(i)) continue;
    
    const grupo = {
      principal: lista[i],
      similares: [],
      metricas: []
    };
    
    for (let j = i + 1; j < lista.length; j++) {
      if (usados.has(j)) continue;
      
      const metricas = calcularSimilaridadeComposta(lista[i][campo], lista[j][campo]);
      
      if (metricas.pontuacao >= limiarMinimo) {
        grupo.similares.push(lista[j]);
        grupo.metricas.push(metricas);
        usados.add(j);
      }
    }
    
    if (grupo.similares.length > 0) {
      usados.add(i);
      grupos.push(grupo);
    }
  }
  
  return grupos;
};

/**
 * Gera sugestões de unificação (versão simplificada)
 * @param {array} lista - Lista de objetos
 * @param {string} campo - Campo a ser comparado
 * @param {number} limiarMinimo - Limiar mínimo de similaridade
 * @returns {array} Array de sugestões de unificação
 */
export const gerarSugestoesUnificacao = (lista, campo, limiarMinimo = 75) => {
  const grupos = agruparEntradasSimilares(lista, campo, limiarMinimo);
  
  return grupos.map((grupo, index) => {
    // Calcula pontuação média do grupo
    const pontuacaoMedia = grupo.metricas.length > 0
      ? grupo.metricas.reduce((sum, m) => sum + m.pontuacao, 0) / grupo.metricas.length
      : 0;
    
    return {
      id: `sugestao_${index}_${Date.now()}`,
      itemPrincipal: grupo.principal,
      itensSimilares: grupo.similares,
      metricas: grupo.metricas,
      campo,
      nivelConfianca: obterNivelConfianca(pontuacaoMedia),
      dataGeracao: new Date().toISOString(),
      status: 'pendente'
    };
  });
};

/**
 * Formata a exibição do nível de confiança
 * @param {string} nivel - Nível de confiança
 * @returns {object} Objeto com cor e ícone
 */
export const formatarNivelConfianca = (nivel) => {
  const formatos = {
    alta: {
      cor: '#4caf50',
      corFundo: '#e8f5e9',
      icone: '✓',
      texto: 'Alta Confiança'
    },
    media: {
      cor: '#ff9800',
      corFundo: '#fff3e0',
      icone: '⚠',
      texto: 'Média Confiança'
    },
    baixa: {
      cor: '#f44336',
      corFundo: '#ffebee',
      icone: '!',
      texto: 'Baixa Confiança'
    }
  };
  
  return formatos[nivel] || formatos.baixa;
};
