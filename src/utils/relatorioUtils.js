/**
 * Utilitários para processamento de dados para relatórios
 */

/**
 * Calcula os gastos por cliente com base nos agendamentos
 * @param {Array} agendamentos Lista de agendamentos
 * @param {Array} clientesIds IDs dos clientes a serem incluídos (opcional)
 * @returns {Object} Dados de gastos por cliente
 */
export const calcularGastosPorCliente = async (agendamentos, clientesIds = null) => {
    // Importa as APIs necessárias
    const { clientesApi, servicosApi } = await import('./localStorageApi');
    
    console.log('Iniciando cálculo de gastos por cliente:', {
        totalAgendamentos: agendamentos?.length || 0,
        clientesIds
    });
    
    // Se não há agendamentos, retorna objeto vazio
    if (!agendamentos || agendamentos.length === 0) {
        console.warn('Nenhum agendamento encontrado para calcular gastos');
        return { clientes: {}, total: 0 };
    }
    
    // Filtrar por IDs de clientes, se fornecido
    const agendamentosFiltrados = clientesIds 
        ? agendamentos.filter(ag => ag.clienteId && clientesIds.includes(ag.clienteId))
        : agendamentos.filter(ag => ag.clienteId);
    
    console.log(`Agendamentos filtrados: ${agendamentosFiltrados.length}`);
    
    // Obter todos os clientes
    const todosClientes = clientesApi.getAll();
    console.log(`Total de clientes: ${todosClientes.length}`);
    
    // Obter todos os tipos de serviço
    const todosTiposServico = servicosApi.getAll();
    console.log(`Total de tipos de serviço: ${todosTiposServico.length}`);
    console.log('Tipos de serviço disponíveis:', todosTiposServico.map(ts => ({
        id: ts.id,
        nome: ts.nome,
        valor: ts.valor
    })));
    
    // Para diagnóstico, vamos verificar a estrutura dos agendamentos
    console.log('Amostra de agendamentos:', agendamentosFiltrados.slice(0, 2));
    
    // Calcular gastos por cliente
    const gastosPorCliente = agendamentosFiltrados.reduce((acc, ag) => {
        // Encontrar o cliente
        const cliente = todosClientes.find(c => c.id === ag.clienteId);
        if (!cliente) {
            console.warn(`Cliente não encontrado para agendamento ${ag.id}`);
            return acc;
        }
        
        // Se o agendamento já tiver um valor definido, usar esse valor
        let valorServico = ag.valor;
        
        // Declarar tipoServico fora do escopo do if
        let tipoServico = null;
        
        // Se não tiver valor definido, buscar pelo tipo de serviço
        if (valorServico === undefined || valorServico === null) {
            // Encontrar o tipo de serviço
            // Primeiro, tentamos com tipoServicoId
            tipoServico = todosTiposServico.find(ts => ts.id === ag.tipoServicoId);
            
            // Se não encontrar, tentamos com o campo tipo
            if (!tipoServico) {
                tipoServico = todosTiposServico.find(ts => ts.id === ag.tipo);
            }
            
            // Se ainda não encontrar, procuramos pelo nome, se disponível
            if (!tipoServico && ag.tipoServicoNome) {
                tipoServico = todosTiposServico.find(ts => ts.nome === ag.tipoServicoNome);
            }
            
            // Log do tipo de serviço encontrado ou não
            if (!tipoServico) {
                console.warn(`Tipo de serviço não encontrado para agendamento ${ag.id}. ID procurado: ${ag.tipoServicoId || ag.tipo}`);
            } else {
                console.log(`Tipo de serviço encontrado para agendamento ${ag.id}: ${tipoServico.nome}, valor: ${tipoServico.valor}`);
            }
            
            // Se não encontrar o tipo de serviço, usa valor padrão
            valorServico = tipoServico?.valor || 0;
        }
        
        console.log(`Agendamento ${ag.id}: valor do serviço = ${valorServico} (${ag.valor ? 'direto do agendamento' : 'do tipo de serviço'})`)
        
        // Adicionar ao acumulador
        if (!acc[cliente.id]) {
            acc[cliente.id] = {
                id: cliente.id,
                nome: cliente.nome,
                valor: 0,
                agendamentos: []
            };
        }
        
        acc[cliente.id].valor += valorServico;
        // Encontrar o nome do tipo de serviço para o agendamento
        let nomeServico = 'Não especificado';
        if (tipoServico && tipoServico.nome) {
            nomeServico = tipoServico.nome;
        }
        
        acc[cliente.id].agendamentos.push({
            id: ag.id,
            data: ag.data,
            titulo: ag.titulo,
            valor: valorServico,
            tipoServico: nomeServico
        });
        
        return acc;
    }, {});
    
    // Calcular total geral
    const totalGeral = Object.values(gastosPorCliente).reduce((total, cliente) => 
        total + cliente.valor, 0);
    
    const resultado = { 
        clientes: gastosPorCliente, 
        total: totalGeral 
    };
    
    console.log('Resultado do cálculo de gastos:', {
        totalClientes: Object.keys(gastosPorCliente).length,
        totalGeral
    });
    
    return resultado;
};

/**
 * Agrupa datas por período
 * @param {Date} data Data a ser processada
 * @param {string} tipoPeriodo Tipo de período (mensal, trimestral, anual)
 * @returns {string} String representando o período
 */
const agruparPorPeriodo = (data, tipoPeriodo) => {
    const dataObj = new Date(data);
    const ano = dataObj.getFullYear();
    const mes = dataObj.getMonth() + 1;
    
    switch (tipoPeriodo) {
        case 'trimestral':
            const trimestre = Math.ceil(mes / 3);
            return `${ano}/T${trimestre}`;
        
        case 'anual':
            return `${ano}`;
        
        case 'mensal':
        default:
            return `${ano}/${mes.toString().padStart(2, '0')}`;
    }
};

/**
 * Calcula gastos por período
 * @param {Array} agendamentos Lista de agendamentos
 * @param {Array} clientesIds IDs dos clientes a serem incluídos
 * @param {string} tipoPeriodo Tipo de período (mensal, trimestral, anual)
 * @param {string} dataInicio Data de início (formato YYYY-MM-DD)
 * @param {string} dataFim Data de fim (formato YYYY-MM-DD)
 * @returns {Object} Dados agrupados por período
 */
export const calcularGastosPorPeriodo = async (
    agendamentos,
    clientesIds,
    tipoPeriodo = 'mensal',
    dataInicio,
    dataFim
) => {
    // Importa as APIs necessárias
    const { clientesApi, servicosApi } = await import('./localStorageApi');
    
    // Log para debug
    console.log('Calculando gastos:', { 
        totalAgendamentos: agendamentos?.length || 0,
        clientesIds, 
        tipoPeriodo, 
        dataInicio, 
        dataFim 
    });
    
    // Se não há agendamentos, retorna array vazio
    if (!agendamentos || agendamentos.length === 0) {
        console.warn('Nenhum agendamento encontrado');
        return { valores: [], clientesNomes: [] };
    }
    
    // Obter todos os clientes
    const todosClientes = clientesApi.getAll();
    console.log('Total de clientes:', todosClientes.length);
    
    // Obter todos os tipos de serviço
    const todosTiposServico = servicosApi.getAll();
    console.log('Total de tipos de serviço:', todosTiposServico.length);
    
    // Log dos tipos de serviço para debug
    console.log('Tipos de serviço:', todosTiposServico.map(ts => ({ id: ts.id, nome: ts.nome, valor: ts.valor })));
    
    // Mapeamento de clientes selecionados
    const clientesSelecionados = todosClientes.filter(c => 
        clientesIds.includes(c.id)
    );
    console.log('Clientes selecionados:', clientesSelecionados.map(c => ({ id: c.id, nome: c.nome })));
    
    // Filtrar agendamentos por período e clientes
    const agendamentosFiltrados = agendamentos.filter(ag => {
        // Verificar se está dentro do período
        const dentroDoIntervalo = (!dataInicio || ag.data >= dataInicio) && 
                                 (!dataFim || ag.data <= dataFim);
        
        // Verificar se pertence aos clientes selecionados
        const clienteSelecionado = clientesIds.length === 0 || 
                                 (ag.clienteId && clientesIds.includes(ag.clienteId));
        
        return dentroDoIntervalo && clienteSelecionado;
    });
    
    console.log('Agendamentos filtrados:', agendamentosFiltrados.length);
    
    // Criar um mapa para armazenar os valores por período
    const periodoMap = {};
    let contadorTotais = 0;
    
    // Processar cada agendamento
    agendamentosFiltrados.forEach(ag => {
        console.log('Processando agendamento:', ag);
        
        // Encontrar o cliente
        const cliente = todosClientes.find(c => c.id === ag.clienteId);
        if (!cliente) {
            console.warn('Cliente não encontrado para agendamento:', ag);
            return;
        }
        
        // Se o agendamento já tiver um valor definido, usar esse valor
        let valorServico = ag.valor;
        
        // Se não tiver valor definido, buscar pelo tipo de serviço
        let tipoServico = null;
        if (valorServico === undefined || valorServico === null || valorServico === 0) {
            // Encontrar o tipo de serviço
            tipoServico = todosTiposServico.find(ts => 
                ts.id === ag.tipoServicoId || ts.id === ag.tipo
            );
            
            // Se não encontrar o tipo de serviço, usa valor padrão
            valorServico = tipoServico?.valor || 0;
        } else {
            // Também buscar o tipo de serviço para referência, mesmo com valor já definido
            tipoServico = todosTiposServico.find(ts => 
                ts.id === ag.tipoServicoId || ts.id === ag.tipo
            );
        }
        
        console.log(`Serviço: ${tipoServico?.nome || 'N/A'}, Valor: ${valorServico} (${ag.valor ? 'direto do agendamento' : 'do tipo de serviço'})`);
        
        // Verificar se o valor é um número válido
        if (isNaN(parseFloat(valorServico))) {
            console.warn(`Valor inválido para agendamento ${ag.id}: ${valorServico}`);
            valorServico = 0;
        } else {
            valorServico = parseFloat(valorServico);
            contadorTotais += valorServico;
        }
        
        // Determinar o período (evitando redeclarar a variável)
        const periodoAtual = agruparPorPeriodo(ag.data, tipoPeriodo);
        
        // Inicializar o período se não existir
        if (!periodoMap[periodoAtual]) {
            periodoMap[periodoAtual] = {
                periodo: periodoAtual,
                clientesValores: {}
            };
        }
        
        // Inicializar o cliente se não existir neste período
        if (!periodoMap[periodoAtual].clientesValores[cliente.nome]) {
            periodoMap[periodoAtual].clientesValores[cliente.nome] = 0;
        }
        
        // Somar o valor do serviço
        periodoMap[periodoAtual].clientesValores[cliente.nome] += valorServico;
        
        // Determinar o período
        const periodo = agruparPorPeriodo(ag.data, tipoPeriodo);
        
        // Inicializar o período se não existir
        if (!periodoMap[periodo]) {
            periodoMap[periodo] = {
                periodo,
                clientesValores: {}
            };
        }
        
        // Inicializar o cliente se não existir neste período
        if (!periodoMap[periodo].clientesValores[cliente.nome]) {
            periodoMap[periodo].clientesValores[cliente.nome] = 0;
        }
        
        // Somar o valor do serviço
        periodoMap[periodo].clientesValores[cliente.nome] += valorServico;
    });
    
    // Converter o mapa em array e ordenar por período
    const valores = Object.values(periodoMap).sort((a, b) => 
        a.periodo.localeCompare(b.periodo)
    );
    
    console.log('Períodos calculados:', valores);
    console.log('Total de valores somados:', contadorTotais);
    
    // Extrair nomes dos clientes selecionados
    const clientesNomes = clientesSelecionados.map(c => c.nome);
    
    // Verificar se temos dados para exibir
    if (valores.length === 0 || clientesNomes.length === 0 || contadorTotais === 0) {
        console.warn('Não há dados suficientes para gerar o gráfico:', {
            periodos: valores.length,
            clientes: clientesNomes.length,
            total: contadorTotais
        });
    }
    
    // Garantir que cada período tenha valores para todos os clientes
    valores.forEach(periodo => {
        clientesNomes.forEach(nomeCliente => {
            if (periodo.clientesValores[nomeCliente] === undefined) {
                periodo.clientesValores[nomeCliente] = 0;
            }
        });
    });
    
    const resultado = { valores, clientesNomes };
    console.log('Resultado final:', resultado);
    
    return resultado;
};

/**
 * Exporta dados para CSV
 * @param {Array} dados Dados a serem exportados
 * @param {string} nomeArquivo Nome do arquivo CSV
 */
export const exportarParaCSV = (dados, nomeArquivo = 'relatorio.csv') => {
    if (!dados || !dados.length) {
        console.error('Não há dados para exportar');
        return;
    }
    
    // Extrair cabeçalhos (todas as chaves existentes em todos os objetos)
    const cabecalhos = [...new Set(
        dados.flatMap(item => Object.keys(item))
    )];
    
    // Construir linhas
    const linhas = [
        cabecalhos.join(','), // Linha de cabeçalho
        ...dados.map(item => 
            cabecalhos.map(key => 
                item[key] !== undefined ? item[key] : ''
            ).join(',')
        )
    ];
    
    // Juntar linhas com quebra de linha
    const conteudo = linhas.join('\n');
    
    // Criar blob e fazer download
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};