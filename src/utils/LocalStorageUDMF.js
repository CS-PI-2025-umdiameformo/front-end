/**
 * Unified Data Management Facade (UDMF)
 * Classe utilitária para gerenciar dados no localStorage para facilitar testes e persistência
 */
class LocalStorageUDMF {

    constructor() {
        this.storage = window.localStorage;
        this.keyPrefixes = {
            clients: 'clients',
            serviceTypes: 'serviceTypes',
            agendamentos: 'agendamentos',
            userPreferences: 'userPreferences',
            formData: 'formData_',
            lembretesEmail: 'lembretesEmail'
        };
    }
    
    /**
     * Obtém dados do localStorage
     * @param {string} key - Chave para buscar
     * @returns {object|array|null} - Dados convertidos de JSON ou null
     */
    get(key) {
        const value = this.storage.getItem(key);
        return value ? JSON.parse(value) : null;
    }
    
    /**
     * Armazena dados no localStorage
     * @param {string} key - Chave para armazenar
     * @param {object|array} value - Valor a ser armazenado
     */
    set(key, value) {
        this.storage.setItem(key, JSON.stringify(value));
    }
    
    /**
     * Remove dados do localStorage
     * @param {string} key - Chave a ser removida
     */
    remove(key) {
        this.storage.removeItem(key);
    }
    
    /**
     * Limpa todo o localStorage
     */
    clear() {
        this.storage.clear();
    }

    /**
     * Verifica se uma chave existe no localStorage
     * @param {string} key - Chave para verificar
     * @returns {boolean}
     */
    exists(key) {
        return this.storage.getItem(key) !== null;
    }

    /**
     * Carrega clientes do localStorage ou inicializa com dados de exemplo
     * @returns {array} - Lista de clientes
     */
    getClients() {
        const clients = this.get(this.keyPrefixes.clients);
        if (clients) {
            return clients;
        } else {
            return this.initializeExampleClients();
        }
    }

    /**
     * Salva clientes no localStorage
     * @param {array} clients - Lista de clientes
     */
    setClients(clients) {
        this.set(this.keyPrefixes.clients, clients);
    }

    /**
     * Inicializa clientes com dados de exemplo
     * @returns {array} - Lista de clientes de exemplo
     */
    initializeExampleClients() {
        const { v4: uuidv4 } = require('uuid');
        const exampleClients = [
            {
                id: uuidv4(),
                nome: 'Maria Silva',
                telefone: '(11) 99999-8888',
                email: 'maria.silva@email.com',
                endereco: 'Rua das Flores, 123',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01234-567',
                dataNascimento: '1985-06-15',
                observacoes: 'Preferência para horários da manhã',
                genero: 'feminino',
                documentos: {
                    cpf: '123.456.789-00',
                    rg: '12.345.678-9'
                }
            },
            {
                id: uuidv4(),
                nome: 'João Oliveira',
                telefone: '(11) 97777-6666',
                email: 'joao.oliveira@email.com',
                endereco: 'Av. Paulista, 1000',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01311-000',
                dataNascimento: '1990-03-22',
                observacoes: 'Alergias a medicamentos',
                genero: 'masculino',
                documentos: {
                    cpf: '987.654.321-00',
                    rg: '98.765.432-1'
                }
            }
        ];
        this.setClients(exampleClients);
        return exampleClients;
    }

    /**
     * Carrega tipos de serviço do localStorage ou inicializa com dados de exemplo
     * @returns {array} - Lista de tipos de serviço
     */
    getServiceTypes() {
        const serviceTypes = this.get(this.keyPrefixes.serviceTypes);
        if (serviceTypes) {
            return serviceTypes;
        } else {
            return this.initializeExampleServiceTypes();
        }
    }

    /**
     * Salva tipos de serviço no localStorage
     * @param {array} serviceTypes - Lista de tipos de serviço
     */
    setServiceTypes(serviceTypes) {
        this.set(this.keyPrefixes.serviceTypes, serviceTypes);
    }

    /**
     * Inicializa tipos de serviço com dados de exemplo
     * @returns {array} - Lista de tipos de serviço de exemplo
     */
    initializeExampleServiceTypes() {
        const { v4: uuidv4 } = require('uuid');
        const exampleServiceTypes = [
            {
                id: uuidv4(),
                nome: 'Consulta',
                descricao: 'Consulta médica regular',
                duracao: 60,
                valor: 200,
                cor: '007ad9',
                tags: ['rotina', 'atendimento']
            },
            {
                id: uuidv4(),
                nome: 'Exame',
                descricao: 'Procedimento diagnóstico',
                duracao: 45,
                valor: 150,
                cor: '34A835',
                tags: ['diagnóstico', 'avaliação']
            },
            {
                id: uuidv4(),
                nome: 'Retorno',
                descricao: 'Avaliação de acompanhamento',
                duracao: 30,
                valor: 100,
                cor: 'FFC107',
                tags: ['acompanhamento', 'breve']
            },
            {
                id: uuidv4(),
                nome: 'Procedimento',
                descricao: 'Procedimentos especializados',
                duracao: 90,
                valor: 300,
                cor: 'FF5722',
                tags: ['especializado', 'complexo']
            }
        ];
        this.setServiceTypes(exampleServiceTypes);
        return exampleServiceTypes;
    }

    /**
     * Carrega agendamentos do localStorage ou inicializa com dados de exemplo
     * @returns {array} - Lista de agendamentos
     */
    getAgendamentos() {
        const agendamentos = this.get(this.keyPrefixes.agendamentos);
        if (agendamentos) {
            return agendamentos;
        } else {
            return this.initializeExampleAgendamentos();
        }
    }

    /**
     * Salva agendamentos no localStorage
     * @param {array} agendamentos - Lista de agendamentos
     */
    setAgendamentos(agendamentos) {
        this.set(this.keyPrefixes.agendamentos, agendamentos);
    }

    /**
     * Inicializa agendamentos com dados de exemplo
     * @returns {array} - Lista de agendamentos de exemplo
     */
    initializeExampleAgendamentos() {
        const { v4: uuidv4 } = require('uuid');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        const clients = this.getClients();
        const serviceTypes = this.getServiceTypes();
        
        const exampleAgendamentos = [
            {
                id: uuidv4(),
                titulo: 'Consulta Maria Silva',
                data: formatDate(today),
                hora: '09:30',
                duracao: 60,
                descricao: 'Consulta regular',
                tipoServicoId: serviceTypes[0].id,
                clienteId: clients[0].id
            },
            {
                id: uuidv4(),
                titulo: 'Exame João Oliveira',
                data: formatDate(tomorrow),
                hora: '14:00',
                duracao: 45,
                descricao: 'Exame de rotina',
                tipoServicoId: serviceTypes[1].id,
                clienteId: clients[1].id
            },
            {
                id: uuidv4(),
                titulo: 'Retorno Maria Silva',
                data: formatDate(dayAfterTomorrow),
                hora: '10:15',
                duracao: 30,
                descricao: 'Retorno para avaliação',
                tipoServicoId: serviceTypes[2].id,
                clienteId: clients[0].id
            }
        ];
        
        this.setAgendamentos(exampleAgendamentos);
        return exampleAgendamentos;
    }

    /**
     * Salva preferências do usuário
     * @param {object} preferences - Preferências do usuário
     */
    setUserPreferences(preferences) {
        this.set(this.keyPrefixes.userPreferences, preferences);
    }

    /**
     * Obtém preferências do usuário
     * @returns {object} - Preferências do usuário
     */
    getUserPreferences() {
        const preferences = this.get(this.keyPrefixes.userPreferences) || {};
        // Define valores padrão se não existirem
        if (preferences.lembretesEmailAtivos === undefined) {
            preferences.lembretesEmailAtivos = true;
        }
        return preferences;
    }

    /**
     * Carrega lembretes de email do localStorage
     * @returns {array} - Lista de lembretes agendados
     */
    getLembretesEmail() {
        return this.get(this.keyPrefixes.lembretesEmail) || [];
    }

    /**
     * Salva lembretes de email no localStorage
     * @param {array} lembretes - Lista de lembretes
     */
    setLembretesEmail(lembretes) {
        this.set(this.keyPrefixes.lembretesEmail, lembretes);
    }

    /**
     * Salva dados de formulário temporários
     * @param {string} formId - Identificador do formulário
     * @param {object} formData - Dados do formulário
     */
    saveFormData(formId, formData) {
        this.set(`${this.keyPrefixes.formData}${formId}`, formData);
    }

    /**
     * Obtém dados de formulário temporários
     * @param {string} formId - Identificador do formulário
     * @returns {object|null} - Dados do formulário ou null
     */
    getFormData(formId) {
        return this.get(`${this.keyPrefixes.formData}${formId}`);
    }

    /**
     * Remove dados de formulário temporários
     * @param {string} formId - Identificador do formulário
     */
    clearFormData(formId) {
        this.remove(`${this.keyPrefixes.formData}${formId}`);
    }

    /**
     * Preenche um formulário com dados do localStorage
     * @param {string} formId - Identificador do formulário
     * @param {object} formulario - Objeto do formulário para preencher
     * @returns {object} - Formulário preenchido
     */
    populate(formId, formulario) {
        const savedData = this.getFormData(formId);
        if (savedData) {
            // Mescla os dados salvos com o formulário
            return { ...formulario, ...savedData };
        }
        return formulario;
    }

    /**
     * Inicializa todos os dados de teste para o aplicativo
     */
    initializeAllTestData() {
        this.initializeExampleClients();
        this.initializeExampleServiceTypes();
        this.initializeExampleAgendamentos();
    }
}

// Exporta uma única instância para uso em toda a aplicação
const storageService = new LocalStorageUDMF();
export default storageService;
export { LocalStorageUDMF }; 