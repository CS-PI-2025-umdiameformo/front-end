/**
 * Utilitário para inicializar dados de teste
 * Permite iniciar a aplicação com um estado conhecido para testes
 */
import { initializeAllTestData } from './localStorageApi';

/**
 * Inicializa a aplicação com dados de teste
 * @param {boolean} force Se verdadeiro, força a reinicialização mesmo se já houver dados
 */
export const inicializarDadosTeste = (force = false) => {
  // Verificar se já existem dados no localStorage
  const temDados = localStorage.getItem('clients') !== null && 
                  localStorage.getItem('serviceTypes') !== null &&
                  localStorage.getItem('agendamentos') !== null;
  
  // Se não há dados ou se force é verdadeiro, inicializar dados
  if (force || !temDados) {
    console.log('Inicializando dados de teste para a aplicação...');
    initializeAllTestData();
    console.log('Dados de teste inicializados com sucesso!');
    return true;
  }
  
  console.log('Usando dados existentes do localStorage. Use force=true para reinicializar.');
  return false;
};

/**
 * Restaurar o estado original dos dados de teste
 * Útil para reverter modificações feitas durante testes
 */
export const restaurarDadosTeste = () => {
  console.log('Restaurando dados de teste para o estado original...');
  initializeAllTestData();
  console.log('Dados de teste restaurados com sucesso!');
};

/**
 * Limpa todos os dados do localStorage
 * CUIDADO: Isso apagará todos os dados da aplicação
 */
export const limparTodosDados = () => {
  if (window.confirm('ATENÇÃO: Esta ação irá apagar todos os dados da aplicação. Continuar?')) {
    localStorage.clear();
    console.log('Todos os dados foram removidos do localStorage.');
    return true;
  }
  return false;
};

/**
 * Exporta dados do localStorage para um arquivo JSON
 * Útil para backup dos dados de teste
 */
export const exportarDados = () => {
  const dadosExportados = {
    clients: JSON.parse(localStorage.getItem('clients') || '[]'),
    serviceTypes: JSON.parse(localStorage.getItem('serviceTypes') || '[]'),
    agendamentos: JSON.parse(localStorage.getItem('agendamentos') || '[]'),
    userPreferences: JSON.parse(localStorage.getItem('userPreferences') || '{}')
  };
  
  const blob = new Blob([JSON.stringify(dadosExportados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `sistema-agendamento-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Limpeza
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  return dadosExportados;
};

/**
 * Importa dados de um arquivo JSON para o localStorage
 * @param {File} arquivo Arquivo JSON com os dados
 * @returns {Promise} Promessa que resolve quando os dados forem importados
 */
export const importarDados = (arquivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const dadosImportados = JSON.parse(event.target.result);
        
        // Validação básica dos dados
        if (!dadosImportados.clients || !dadosImportados.serviceTypes || !dadosImportados.agendamentos) {
          throw new Error('Formato de arquivo inválido. Faltam propriedades obrigatórias.');
        }
        
        // Importar os dados
        localStorage.setItem('clients', JSON.stringify(dadosImportados.clients));
        localStorage.setItem('serviceTypes', JSON.stringify(dadosImportados.serviceTypes));
        localStorage.setItem('agendamentos', JSON.stringify(dadosImportados.agendamentos));
        
        if (dadosImportados.userPreferences) {
          localStorage.setItem('userPreferences', JSON.stringify(dadosImportados.userPreferences));
        }
        
        console.log('Dados importados com sucesso!');
        resolve(dadosImportados);
      } catch (erro) {
        console.error('Erro ao importar dados:', erro);
        reject(erro);
      }
    };
    
    reader.onerror = (erro) => {
      console.error('Erro ao ler o arquivo:', erro);
      reject(erro);
    };
    
    reader.readAsText(arquivo);
  });
};
