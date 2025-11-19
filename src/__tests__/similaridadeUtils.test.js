import {
  calcularDistanciaLevenshtein,
  calcularSimilaridade,
  normalizarString,
  obterNivelConfianca,
  calcularSimilaridadeComposta,
  buscarEntradasSimilares,
  gerarSugestoesUnificacao,
  saoSimilares
} from '../utils/similaridadeUtils';

describe('Testes de Similaridade - Simplificado', () => {
  
  // Testes básicos de distância
  describe('calcularDistanciaLevenshtein', () => {
    test('strings idênticas têm distância 0', () => {
      expect(calcularDistanciaLevenshtein('banana', 'banana')).toBe(0);
      expect(calcularDistanciaLevenshtein('teste', 'teste')).toBe(0);
    });

    test('calcula distância corretamente', () => {
      expect(calcularDistanciaLevenshtein('banana', 'banhana')).toBe(1);
      expect(calcularDistanciaLevenshtein('gato', 'rato')).toBe(1);
    });

    test('é case-insensitive', () => {
      expect(calcularDistanciaLevenshtein('Banana', 'banana')).toBe(0);
    });
  });

  // Testes de similaridade percentual
  describe('calcularSimilaridade', () => {
    test('retorna 100 para strings idênticas', () => {
      expect(calcularSimilaridade('banana', 'banana')).toBe(100);
    });

    test('retorna alta similaridade para strings similares', () => {
      expect(calcularSimilaridade('banana', 'banhana')).toBeGreaterThan(80);
    });

    test('retorna 0 para strings vazias', () => {
      expect(calcularSimilaridade('', 'banana')).toBe(0);
    });
  });

  // Testes de normalização
  describe('normalizarString', () => {
    test('remove acentos', () => {
      expect(normalizarString('José')).toBe('jose');
      expect(normalizarString('Ação')).toBe('acao');
    });

    test('remove caracteres especiais', () => {
      expect(normalizarString('João-Silva!')).toBe('joaosilva');
    });

    test('normaliza espaços', () => {
      expect(normalizarString('  João   Silva  ')).toBe('joao silva');
    });
  });

  // Testes de similaridade
  describe('saoSimilares', () => {
    test('detecta strings normalizadas iguais', () => {
      expect(saoSimilares('José', 'Jose')).toBe(true);
      expect(saoSimilares('Ação', 'acao')).toBe(true);
    });

    test('detecta strings muito similares', () => {
      expect(saoSimilares('banana', 'banana')).toBe(true);
    });
  });

  // Testes de nível de confiança
  describe('obterNivelConfianca', () => {
    test('classifica corretamente', () => {
      expect(obterNivelConfianca(90)).toBe('alta');
      expect(obterNivelConfianca(75)).toBe('media');
      expect(obterNivelConfianca(60)).toBe('baixa');
    });
  });

  // Testes de similaridade composta
  describe('calcularSimilaridadeComposta', () => {
    test('retorna objeto com métricas', () => {
      const resultado = calcularSimilaridadeComposta('banana', 'banhana');
      
      expect(resultado).toHaveProperty('pontuacao');
      expect(resultado).toHaveProperty('nivelConfianca');
      expect(typeof resultado.pontuacao).toBe('number');
    });

    test('pontuação 100 para strings idênticas', () => {
      const resultado = calcularSimilaridadeComposta('teste', 'teste');
      expect(resultado.similaridadeExata).toBe(100);
    });
  });

  // Testes de busca
  describe('buscarEntradasSimilares', () => {
    const clientes = [
      { id: 1, nome: 'João Silva' },
      { id: 2, nome: 'João da Silva' },
      { id: 3, nome: 'Maria Santos' }
    ];

    test('encontra entradas similares', () => {
      const resultados = buscarEntradasSimilares('João Silva', clientes, 'nome', 70);
      expect(resultados.length).toBeGreaterThan(0);
    });

    test('ordena por pontuação', () => {
      const resultados = buscarEntradasSimilares('João Silva', clientes, 'nome', 70);
      if (resultados.length > 1) {
        expect(resultados[0].metricas.pontuacao).toBeGreaterThanOrEqual(
          resultados[resultados.length - 1].metricas.pontuacao
        );
      }
    });

    test('retorna array vazio para entrada inválida', () => {
      expect(buscarEntradasSimilares('', clientes, 'nome', 70)).toEqual([]);
    });
  });

  // Testes de sugestões
  describe('gerarSugestoesUnificacao', () => {
    const servicos = [
      { id: 1, nome: 'Consulta' },
      { id: 2, nome: 'consulta' },
      { id: 3, nome: 'Exame' }
    ];

    test('gera sugestões válidas', () => {
      const sugestoes = gerarSugestoesUnificacao(servicos, 'nome', 70);
      
      expect(Array.isArray(sugestoes)).toBe(true);
      sugestoes.forEach(sugestao => {
        expect(sugestao).toHaveProperty('id');
        expect(sugestao).toHaveProperty('itemPrincipal');
        expect(sugestao).toHaveProperty('itensSimilares');
        expect(sugestao).toHaveProperty('status');
        expect(sugestao.status).toBe('pendente');
      });
    });
  });

  // Casos de uso reais
  describe('Casos práticos', () => {
    test('detecta "Banhanha" e "banana" como similares', () => {
      expect(calcularSimilaridade('Banhanha', 'banana')).toBeGreaterThan(70);
    });

    test('detecta erros de digitação', () => {
      expect(calcularSimilaridade('João', 'Joao')).toBeGreaterThan(70);
      expect(calcularSimilaridade('José', 'Jose')).toBeGreaterThan(70);
    });

    test('sugere unificação para variações', () => {
      const servicos = [
        { id: 1, nome: 'Consulta' },
        { id: 2, nome: 'consulta' },
        { id: 3, nome: 'CONSULTA' }
      ];

      const sugestoes = gerarSugestoesUnificacao(servicos, 'nome', 70);
      expect(sugestoes.length).toBeGreaterThan(0);
    });
  });
});

