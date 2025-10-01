/**
 * API para interagir com LocalStorageUDMF de forma simplificada
 * Este módulo serve como uma fachada para o serviço de armazenamento local
 */
import storageService from './LocalStorageUDMF';
import { v4 as uuidv4 } from 'uuid';

/**
 * API de gerenciamento de clientes
 */
export const clientesApi = {
  /**
   * Obter todos os clientes
   * @returns {array} Lista de clientes
   */
  getAll: () => {
    return storageService.getClients();
  },

  /**
   * Obter um cliente pelo ID
   * @param {string} id ID do cliente
   * @returns {object|null} Cliente encontrado ou null
   */
  getById: (id) => {
    const clientes = storageService.getClients();
    return clientes.find(cliente => cliente.id === id) || null;
  },

  /**
   * Adicionar um novo cliente
   * @param {object} cliente Dados do cliente (sem ID)
   * @returns {object} Cliente criado com ID
   */
  add: (cliente) => {
    const clientes = storageService.getClients();
    const novoCliente = {
      ...cliente,
      id: cliente.id || uuidv4()
    };
    const clientesAtualizados = [...clientes, novoCliente];
    storageService.setClients(clientesAtualizados);
    return novoCliente;
  },

  /**
   * Atualizar um cliente existente
   * @param {object} cliente Cliente com ID
   * @returns {object|null} Cliente atualizado ou null se não encontrado
   */
  update: (cliente) => {
    if (!cliente.id) return null;
    
    const clientes = storageService.getClients();
    const index = clientes.findIndex(c => c.id === cliente.id);
    
    if (index === -1) return null;
    
    const clientesAtualizados = [...clientes];
    clientesAtualizados[index] = { ...cliente };
    
    storageService.setClients(clientesAtualizados);
    return cliente;
  },

  /**
   * Excluir um cliente pelo ID
   * @param {string} id ID do cliente a excluir
   * @returns {boolean} true se excluído, false se não encontrado
   */
  delete: (id) => {
    const clientes = storageService.getClients();
    const clientesAtualizados = clientes.filter(c => c.id !== id);
    
    if (clientesAtualizados.length === clientes.length) {
      return false;
    }
    
    storageService.setClients(clientesAtualizados);
    return true;
  },

  /**
   * Buscar clientes por termo de pesquisa
   * @param {string} termo Termo para busca em nome, email ou telefone
   * @returns {array} Clientes filtrados
   */
  buscar: (termo) => {
    if (!termo) return storageService.getClients();
    
    const termoNormalizado = termo.toLowerCase().trim();
    const clientes = storageService.getClients();
    
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(termoNormalizado) ||
      (cliente.email && cliente.email.toLowerCase().includes(termoNormalizado)) ||
      (cliente.telefone && cliente.telefone.includes(termoNormalizado)) ||
      (cliente.documentos && cliente.documentos.cpf && cliente.documentos.cpf.includes(termoNormalizado))
    );
  }
};

/**
 * API de gerenciamento de serviços
 */
export const servicosApi = {
  /**
   * Obter todos os tipos de serviço
   * @returns {array} Lista de tipos de serviço
   */
  getAll: () => {
    return storageService.getServiceTypes();
  },

  /**
   * Obter um tipo de serviço pelo ID
   * @param {string} id ID do tipo de serviço
   * @returns {object|null} Tipo de serviço encontrado ou null
   */
  getById: (id) => {
    const servicos = storageService.getServiceTypes();
    return servicos.find(servico => servico.id === id) || null;
  },

  /**
   * Adicionar um novo tipo de serviço
   * @param {object} servico Dados do tipo de serviço (sem ID)
   * @returns {object} Tipo de serviço criado com ID
   */
  add: (servico) => {
    const servicos = storageService.getServiceTypes();
    const novoServico = {
      ...servico,
      id: servico.id || uuidv4()
    };
    const servicosAtualizados = [...servicos, novoServico];
    storageService.setServiceTypes(servicosAtualizados);
    return novoServico;
  },

  /**
   * Atualizar um tipo de serviço existente
   * @param {object} servico Tipo de serviço com ID
   * @returns {object|null} Tipo de serviço atualizado ou null se não encontrado
   */
  update: (servico) => {
    if (!servico.id) return null;
    
    const servicos = storageService.getServiceTypes();
    const index = servicos.findIndex(s => s.id === servico.id);
    
    if (index === -1) return null;
    
    const servicosAtualizados = [...servicos];
    servicosAtualizados[index] = { ...servico };
    
    storageService.setServiceTypes(servicosAtualizados);
    return servico;
  },

  /**
   * Excluir um tipo de serviço pelo ID
   * @param {string} id ID do tipo de serviço a excluir
   * @returns {boolean} true se excluído, false se não encontrado
   */
  delete: (id) => {
    const servicos = storageService.getServiceTypes();
    const servicosAtualizados = servicos.filter(s => s.id !== id);
    
    if (servicosAtualizados.length === servicos.length) {
      return false;
    }
    
    storageService.setServiceTypes(servicosAtualizados);
    return true;
  },

  /**
   * Verificar se um serviço está em uso em agendamentos
   * @param {string} id ID do serviço
   * @returns {boolean} true se estiver em uso
   */
  verificarEmUso: (id) => {
    const agendamentos = storageService.getAgendamentos();
    return agendamentos.some(a => a.tipoServicoId === id);
  }
};

/**
 * API de gerenciamento de agendamentos
 */
export const agendamentosApi = {
  /**
   * Obter todos os agendamentos
   * @returns {array} Lista de agendamentos
   */
  getAll: () => {
    return storageService.getAgendamentos();
  },

  /**
   * Obter um agendamento pelo ID
   * @param {string} id ID do agendamento
   * @returns {object|null} Agendamento encontrado ou null
   */
  getById: (id) => {
    const agendamentos = storageService.getAgendamentos();
    return agendamentos.find(agendamento => agendamento.id === id) || null;
  },

  /**
   * Adicionar um novo agendamento
   * @param {object} agendamento Dados do agendamento (sem ID)
   * @returns {object} Agendamento criado com ID
   */
  add: (agendamento) => {
    const agendamentos = storageService.getAgendamentos();
    const novoAgendamento = {
      ...agendamento,
      id: agendamento.id || uuidv4()
    };
    const agendamentosAtualizados = [...agendamentos, novoAgendamento];
    storageService.setAgendamentos(agendamentosAtualizados);
    return novoAgendamento;
  },

  /**
   * Atualizar um agendamento existente
   * @param {object} agendamento Agendamento com ID
   * @returns {object|null} Agendamento atualizado ou null se não encontrado
   */
  update: (agendamento) => {
    if (!agendamento.id) return null;
    
    const agendamentos = storageService.getAgendamentos();
    const index = agendamentos.findIndex(a => a.id === agendamento.id);
    
    if (index === -1) return null;
    
    const agendamentosAtualizados = [...agendamentos];
    agendamentosAtualizados[index] = { ...agendamento };
    
    storageService.setAgendamentos(agendamentosAtualizados);
    return agendamento;
  },

  /**
   * Excluir um agendamento pelo ID
   * @param {string} id ID do agendamento a excluir
   * @returns {boolean} true se excluído, false se não encontrado
   */
  delete: (id) => {
    const agendamentos = storageService.getAgendamentos();
    const agendamentosAtualizados = agendamentos.filter(a => a.id !== id);
    
    if (agendamentosAtualizados.length === agendamentos.length) {
      return false;
    }
    
    storageService.setAgendamentos(agendamentosAtualizados);
    return true;
  },

  /**
   * Buscar agendamentos por intervalo de datas
   * @param {string} dataInicio Data inicial (formato YYYY-MM-DD)
   * @param {string} dataFim Data final (formato YYYY-MM-DD)
   * @returns {array} Agendamentos filtrados
   */
  buscarPorPeriodo: (dataInicio, dataFim) => {
    const agendamentos = storageService.getAgendamentos();
    
    if (!dataInicio && !dataFim) return agendamentos;
    
    return agendamentos.filter(agendamento => {
      const dataAgendamento = agendamento.data;
      
      if (dataInicio && dataFim) {
        return dataAgendamento >= dataInicio && dataAgendamento <= dataFim;
      }
      
      if (dataInicio) {
        return dataAgendamento >= dataInicio;
      }
      
      if (dataFim) {
        return dataAgendamento <= dataFim;
      }
      
      return true;
    });
  },

  /**
   * Buscar agendamentos por cliente
   * @param {string} clienteId ID do cliente
   * @returns {array} Agendamentos filtrados
   */
  buscarPorCliente: (clienteId) => {
    if (!clienteId) return [];
    
    const agendamentos = storageService.getAgendamentos();
    return agendamentos.filter(a => a.clienteId === clienteId);
  },

  /**
   * Buscar agendamentos por tipo de serviço
   * @param {string} tipoServicoId ID do tipo de serviço
   * @returns {array} Agendamentos filtrados
   */
  buscarPorServico: (tipoServicoId) => {
    if (!tipoServicoId) return [];
    
    const agendamentos = storageService.getAgendamentos();
    return agendamentos.filter(a => a.tipoServicoId === tipoServicoId);
  }
};

/**
 * API para gerenciamento de preferências do usuário
 */
export const preferencesApi = {
  /**
   * Obter todas as preferências
   * @returns {object} Preferências do usuário
   */
  getAll: () => {
    return storageService.getUserPreferences();
  },

  /**
   * Obter uma preferência específica
   * @param {string} key Chave da preferência
   * @param {any} defaultValue Valor padrão caso não exista
   * @returns {any} Valor da preferência ou valor padrão
   */
  get: (key, defaultValue = null) => {
    const preferences = storageService.getUserPreferences();
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  },

  /**
   * Definir uma preferência
   * @param {string} key Chave da preferência
   * @param {any} value Valor da preferência
   */
  set: (key, value) => {
    const preferences = storageService.getUserPreferences();
    preferences[key] = value;
    storageService.setUserPreferences(preferences);
  },

  /**
   * Definir múltiplas preferências
   * @param {object} preferences Objeto com preferências
   */
  setMultiple: (preferences) => {
    const currentPreferences = storageService.getUserPreferences();
    storageService.setUserPreferences({
      ...currentPreferences,
      ...preferences
    });
  },

  /**
   * Remover uma preferência
   * @param {string} key Chave da preferência
   */
  remove: (key) => {
    const preferences = storageService.getUserPreferences();
    delete preferences[key];
    storageService.setUserPreferences(preferences);
  }
};

/**
 * Inicializa todos os dados para testes
 */
export const initializeAllTestData = () => {
  storageService.initializeAllTestData();
};

/**
 * Referência direta ao serviço de armazenamento
 * Para casos de uso avançados
 */
export const storageUtils = {
  service: storageService,
  
  /**
   * Salvar dados de formulário temporário
   * @param {string} formId Identificador do formulário
   * @param {object} data Dados do formulário
   */
  saveFormData: (formId, data) => {
    storageService.saveFormData(formId, data);
  },
  
  /**
   * Carregar dados de formulário temporário
   * @param {string} formId Identificador do formulário
   * @returns {object|null} Dados do formulário ou null
   */
  getFormData: (formId) => {
    return storageService.getFormData(formId);
  },
  
  /**
   * Limpar dados de formulário temporário
   * @param {string} formId Identificador do formulário
   */
  clearFormData: (formId) => {
    storageService.clearFormData(formId);
  },
  
  /**
   * Preencher formulário com dados salvos
   * @param {string} formId Identificador do formulário
   * @param {object} formulario Objeto do formulário
   * @returns {object} Formulário preenchido
   */
  populate: (formId, formulario) => {
    return storageService.populate(formId, formulario);
  }
};
