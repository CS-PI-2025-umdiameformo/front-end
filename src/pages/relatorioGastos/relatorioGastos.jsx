import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { MultiSelect } from 'primereact/multiselect';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { clientesApi, agendamentosApi, servicosApi } from '../../utils/localStorageApi';
import { calcularGastosPorCliente, calcularGastosPorPeriodo } from '../../utils/relatorioUtils';
import { restaurarDadosTeste } from '../../utils/testDataManager';
import './relatorioGastos.css';

const RelatorioGastos = () => {
    const toast = useRef(null);
    const [clientesDisponiveis, setClientesDisponiveis] = useState([]);
    const [clientesSelecionados, setClientesSelecionados] = useState([]);
    const [tipoGrafico, setTipoGrafico] = useState('bar');
    const [periodoDados, setPeriodoDados] = useState('mensal');
    const [dataInicio, setDataInicio] = useState(new Date(new Date().setMonth(new Date().getMonth() - 3)));
    const [dataFim, setDataFim] = useState(new Date());
    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);
    const [carregando, setCarregando] = useState(false);

    const tiposGrafico = [
        { label: 'Gráfico de Barras', value: 'bar' },
        { label: 'Gráfico de Linha', value: 'line' },
        { label: 'Gráfico de Pizza', value: 'pie' },
    ];

    const periodoOptions = [
        { label: 'Mensal', value: 'mensal' },
        { label: 'Trimestral', value: 'trimestral' },
        { label: 'Anual', value: 'anual' },
    ];

    useEffect(() => {
        carregarClientes();
    }, []);

    useEffect(() => {
        if (clientesSelecionados.length > 0) {
            atualizarGrafico();
        }
    }, [clientesSelecionados, tipoGrafico, periodoDados, dataInicio, dataFim]);

    const carregarClientes = () => {
        try {
            const clientes = clientesApi.getAll();
            setClientesDisponiveis(clientes.map(c => ({ label: c.nome, value: c.id })));
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possível carregar os clientes',
                life: 3000
            });
        }
    };

    const atualizarGrafico = async () => {
        try {
            setCarregando(true);
            
            // Obtém todos os agendamentos
            const todosAgendamentos = agendamentosApi.getAll();
            
            // Filtra agendamentos pelo período selecionado
            const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
            const dataFimFormatada = dataFim.toISOString().split('T')[0];
            
            // Calcula gastos com base nos clientes selecionados e período
            // Verifica se há agendamentos associados aos clientes selecionados
            const clientesIds = clientesSelecionados.map(c => c.value);
            const agendamentosFiltrados = todosAgendamentos.filter(ag => 
                clientesIds.includes(ag.clienteId)
            );
            
            // Obter serviços para referência
            const tiposServico = servicosApi.getAll();
            
            // Adiciona logs para depurar
            console.log('Calculando gastos com:', {
                todosAgendamentos: todosAgendamentos.length,
                agendamentosFiltrados: agendamentosFiltrados.length,
                agendamentosDetalhes: agendamentosFiltrados.map(ag => {
                    const servico = tiposServico.find(ts => ts.id === ag.tipoServicoId);
                    return {
                        id: ag.id,
                        titulo: ag.titulo,
                        clienteId: ag.clienteId,
                        tipoServicoId: ag.tipoServicoId,
                        tipoServicoNome: servico?.nome || 'Desconhecido',
                        valorAgendamento: ag.valor,
                        valorServico: servico?.valor || 0,
                        data: ag.data
                    };
                }),
                clientesSelecionados: clientesIds,
                periodoDados,
                dataInicio: dataInicioFormatada,
                dataFim: dataFimFormatada
            });
            
            // Se não houver agendamentos filtrados, exibir aviso
            if (agendamentosFiltrados.length === 0) {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Sem dados',
                    detail: 'Não há agendamentos para os clientes selecionados no período especificado',
                    life: 3000
                });
            }
            
            const dadosGastos = await calcularGastosPorPeriodo(
                todosAgendamentos,
                clientesIds,
                periodoDados,
                dataInicioFormatada,
                dataFimFormatada
            );
            
            console.log('Resultado do cálculo:', dadosGastos);
            
            configurarGrafico(dadosGastos);
        } catch (error) {
            console.error('Erro ao atualizar gráfico:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Falha ao gerar o gráfico',
                life: 3000
            });
        } finally {
            setCarregando(false);
        }
    };

    const configurarGrafico = (dadosGastos) => {
        console.log('Configurando gráfico com dados:', dadosGastos);

        // Verifica se os dados estão vazios ou não têm a estrutura esperada
        if (!dadosGastos || !dadosGastos.clientesNomes || !dadosGastos.valores) {
            console.error('Dados para o gráfico estão vazios ou em formato inválido:', dadosGastos);
            toast.current.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Dados para o gráfico estão incompletos ou inválidos.',
                life: 3000
            });
            return;
        }
        
        if (tipoGrafico === 'pie') {
            // Configuração para gráfico de pizza
            const totaisPorCliente = dadosGastos.clientesNomes.map(nome => {
                const total = dadosGastos.valores.reduce((total, item) => 
                    total + (item.clientesValores[nome] || 0), 0);
                console.log(`Total para cliente ${nome}: ${total}`);
                return total;
            });
            
            console.log('Totais por cliente para pizza:', totaisPorCliente);
            
            const data = {
                labels: dadosGastos.clientesNomes,
                datasets: [
                    {
                        data: totaisPorCliente,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                            '#FF9F40', '#8BC34A', '#E91E63', '#3F51B5', '#607D8B'
                        ]
                    }
                ]
            };

            const options = {
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Distribuição de Gastos por Cliente',
                        font: {
                            size: 16
                        }
                    }
                }
            };

            setChartData(data);
            setChartOptions(options);
        } else {
            // Configuração para gráfico de barras ou linhas
            const datasets = dadosGastos.clientesNomes.map((cliente, index) => {
                const cor = [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#8BC34A', '#E91E63', '#3F51B5', '#607D8B'
                ][index % 10];

                // Obter valores para este cliente e converter para número
                const dadosCliente = dadosGastos.valores.map(item => {
                    const valor = item.clientesValores[cliente] || 0;
                    return parseFloat(valor);
                });
                
                console.log(`Dados para cliente ${cliente}:`, dadosCliente);

                return {
                    label: cliente,
                    data: dadosCliente,
                    backgroundColor: tipoGrafico === 'bar' ? cor : 'rgba(255, 255, 255, 0.2)',
                    borderColor: cor,
                    tension: 0.4,
                    fill: tipoGrafico === 'line'
                };
            });

            const data = {
                labels: dadosGastos.valores.map(item => item.periodo),
                datasets
            };

            const options = {
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: `Gastos por Cliente - Período ${periodoDados}`,
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const valor = context.raw;
                                return `${context.dataset.label}: R$ ${valor.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Período'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Valor (R$)'
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return `R$ ${value}`;
                            }
                        }
                    }
                }
            };

            setChartData(data);
            setChartOptions(options);
        }
    };

    const exportarCSV = () => {
        if (!chartData || !chartData.datasets) {
            toast.current.show({
                severity: 'warn',
                summary: 'Aviso',
                detail: 'Não há dados para exportar',
                life: 3000
            });
            return;
        }

        // Construir o conteúdo CSV
        const header = ['Período', ...chartData.datasets.map(ds => ds.label)];
        const rows = chartData.labels.map((periodo, idx) => {
            const row = [periodo];
            chartData.datasets.forEach(ds => {
                row.push(ds.data[idx]);
            });
            return row;
        });

        const csvContent = [
            header.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Criar e fazer download do arquivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio-gastos-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Dados exportados com sucesso',
            life: 3000
        });
    };

    const exportarImagem = () => {
        if (!chartData) {
            toast.current.show({
                severity: 'warn',
                summary: 'Aviso',
                detail: 'Não há gráfico para exportar',
                life: 3000
            });
            return;
        }

        // Obter o canvas do gráfico e converter para imagem
        const canvas = document.querySelector('.p-chart');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `grafico-gastos-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.current.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Gráfico exportado com sucesso',
                life: 3000
            });
        }
    };
    
    // Função para reinicializar dados de teste com valores
    const reinicializarDadosDeTeste = () => {
        try {
            restaurarDadosTeste();
            // Adicionar alguns agendamentos com valores para testes
            const clientes = clientesApi.getAll();
            const servicos = servicosApi.getAll();
            
            const hoje = new Date();
            const umMesAtras = new Date();
            umMesAtras.setMonth(hoje.getMonth() - 1);
            const doisMesesAtras = new Date();
            doisMesesAtras.setMonth(hoje.getMonth() - 2);
            
            // Função para formatar data
            const formatarData = (data) => data.toISOString().split('T')[0];
            
            // Criar alguns agendamentos com valores para clientes
            if (clientes.length >= 2 && servicos.length >= 2) {
                // Adicionar mais agendamentos para teste
                const novosAgendamentos = [
                    {
                        id: 'teste-1',
                        titulo: 'Consulta Especial',
                        data: formatarData(hoje),
                        hora: '10:00',
                        duracao: 60,
                        descricao: 'Agendamento de teste com valor',
                        tipoServicoId: servicos[0].id,  // Consulta: R$ 200
                        clienteId: clientes[0].id, // Maria
                        valor: servicos[0].valor // Adicionar valor explicitamente
                    },
                    {
                        id: 'teste-2',
                        titulo: 'Procedimento Complexo',
                        data: formatarData(umMesAtras),
                        hora: '14:30',
                        duracao: 90,
                        descricao: 'Procedimento de teste com valor',
                        tipoServicoId: servicos[3].id,  // Procedimento: R$ 300
                        clienteId: clientes[1].id, // João
                        valor: servicos[3].valor // Adicionar valor explicitamente
                    },
                    {
                        id: 'teste-3',
                        titulo: 'Exame de Rotina',
                        data: formatarData(doisMesesAtras),
                        hora: '09:15',
                        duracao: 45,
                        descricao: 'Exame de teste com valor',
                        tipoServicoId: servicos[1].id,  // Exame: R$ 150
                        clienteId: clientes[0].id, // Maria
                        valor: servicos[1].valor // Adicionar valor explicitamente
                    },
                    {
                        id: 'teste-4',
                        titulo: 'Retorno',
                        data: formatarData(umMesAtras),
                        hora: '16:00',
                        duracao: 30,
                        descricao: 'Retorno de teste com valor',
                        tipoServicoId: servicos[2].id,  // Retorno: R$ 100
                        clienteId: clientes[1].id, // João
                        valor: servicos[2].valor // Adicionar valor explicitamente
                    }
                ];
                
                // Exibe detalhes dos agendamentos no console para debug
                console.log('Novos agendamentos com valores:', novosAgendamentos.map(ag => ({
                    titulo: ag.titulo,
                    valor: ag.valor,
                    tipoServicoId: ag.tipoServicoId,
                    clienteId: ag.clienteId
                })));
                
                // Obter agendamentos existentes
                const agendamentosAtuais = agendamentosApi.getAll();
                
                // Adicionar novos agendamentos (substituindo se já existirem com mesmo ID)
                novosAgendamentos.forEach(novoAg => {
                    const index = agendamentosAtuais.findIndex(ag => ag.id === novoAg.id);
                    if (index >= 0) {
                        agendamentosAtuais[index] = novoAg;
                    } else {
                        agendamentosAtuais.push(novoAg);
                    }
                });
                
                // Salvar de volta no localStorage
                localStorage.setItem('agendamentos', JSON.stringify(agendamentosAtuais));
                
                toast.current.show({
                    severity: 'info',
                    summary: 'Dados de Teste',
                    detail: 'Dados de teste com valores foram adicionados. Recarregando...',
                    life: 3000
                });
                
                // Recarregar clientes e atualizar gráfico
                setTimeout(() => {
                    carregarClientes();
                    // Forçar seleção de todos os clientes para visualização imediata
                    const todosClientes = clientesApi.getAll().map(c => ({ label: c.nome, value: c.id }));
                    setClientesSelecionados(todosClientes);
                    
                    // Atualizar o gráfico explicitamente
                    atualizarGrafico();
                }, 1000);
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não há clientes ou serviços suficientes para criar dados de teste',
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Erro ao reinicializar dados:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao reinicializar dados de teste',
                life: 3000
            });
        }
    };

    return (
        <div className="relatorio-gastos-page">
            <Toast ref={toast} />

            <div className="card">
                <h2>Relatório de Gastos por Cliente</h2>
                <p className="subtitulo">
                    Visualize e analise os gastos de cada cliente ao longo do tempo.
                </p>

                <div className="p-grid filtros-container">
                    <div className="p-col-12 p-md-6 p-lg-3">
                        <h3>Clientes</h3>
                        <MultiSelect 
                            value={clientesSelecionados}
                            options={clientesDisponiveis}
                            onChange={(e) => setClientesSelecionados(e.value)}
                            optionLabel="label"
                            placeholder="Selecione os clientes"
                            maxSelectedLabels={3}
                            className="w-full"
                        />
                    </div>

                    <div className="p-col-12 p-md-6 p-lg-3">
                        <h3>Período</h3>
                        <Dropdown
                            value={periodoDados}
                            options={periodoOptions}
                            onChange={(e) => setPeriodoDados(e.value)}
                            optionLabel="label"
                            placeholder="Selecione o período"
                            className="w-full"
                        />
                    </div>

                    <div className="p-col-12 p-md-6 p-lg-2">
                        <h3>Data Início</h3>
                        <Calendar
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.value)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>

                    <div className="p-col-12 p-md-6 p-lg-2">
                        <h3>Data Fim</h3>
                        <Calendar
                            value={dataFim}
                            onChange={(e) => setDataFim(e.value)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>

                    <div className="p-col-12 p-md-6 p-lg-2">
                        <h3>Tipo de Gráfico</h3>
                        <Dropdown
                            value={tipoGrafico}
                            options={tiposGrafico}
                            onChange={(e) => setTipoGrafico(e.value)}
                            optionLabel="label"
                            placeholder="Selecione o tipo"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="p-grid mt-3">
                    <div className="p-col-12 p-md-6">
                        <Button 
                            label="Exportar CSV" 
                            icon="pi pi-download" 
                            className="p-button-outlined p-button-success"
                            onClick={exportarCSV}
                            disabled={!chartData || carregando}
                        />
                        <Button 
                            label="Exportar Imagem" 
                            icon="pi pi-image" 
                            className="p-button-outlined p-button-info ml-2"
                            onClick={exportarImagem}
                            disabled={!chartData || carregando}
                        />
                    </div>
                    <div className="p-col-12 p-md-6 text-right">
                        <Button 
                            label="Carregar Dados de Teste" 
                            icon="pi pi-database" 
                            className="p-button-outlined p-button-help"
                            onClick={reinicializarDadosDeTeste}
                            tooltip="Adiciona agendamentos com valores para teste"
                        />
                    </div>
                </div>

                <div className="grafico-container mt-4">
                    {carregando ? (
                        <div className="carregando-container">
                            <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" />
                            <p>Carregando dados...</p>
                        </div>
                    ) : !chartData ? (
                        <Card className="sem-dados-card">
                            <div className="empty-state">
                                <i className="pi pi-chart-bar" style={{fontSize: '3rem', color: '#aaa'}}></i>
                                <h3>Nenhum dado disponível</h3>
                                <p>Selecione pelo menos um cliente para visualizar o gráfico.</p>
                            </div>
                        </Card>
                    ) : (
                        <Chart type={tipoGrafico} data={chartData} options={chartOptions} className="grafico" />
                    )}
                </div>

                {chartData && chartData.datasets && chartData.datasets.length > 0 && clientesSelecionados.length > 0 && (
                    <div className="resumo-container mt-4">
                        <h3>Resumo de Gastos</h3>
                        <div className="p-grid">
                            {clientesSelecionados.map((cliente, index) => {
                                const clienteNome = cliente.label;

                                // Encontra dataset do cliente (pode ser undefined)
                                const datasetForCliente = chartData.datasets.find(ds => ds.label === clienteNome);

                                // Calcula total de forma defensiva
                                let totalGasto = 0;
                                if (datasetForCliente && Array.isArray(datasetForCliente.data)) {
                                    totalGasto = datasetForCliente.data.reduce((acc, val) => acc + (Number(val) || 0), 0);
                                } else if (tipoGrafico === 'pie' && chartData.datasets[0] && Array.isArray(chartData.datasets[0].data)) {
                                    totalGasto = Number(chartData.datasets[0].data[index]) || 0;
                                }

                                // Garantir número antes de toFixed
                                totalGasto = Number(totalGasto) || 0;

                                return (
                                    <div className="p-col-12 p-md-4 p-lg-3" key={cliente.value}>
                                        <Card title={clienteNome} className="cliente-card">
                                            <p className="valor-total">R$ {totalGasto.toFixed(2)}</p>
                                            <p className="periodo-label">
                                                {new Date(dataInicio).toLocaleDateString()} até {new Date(dataFim).toLocaleDateString()}
                                            </p>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RelatorioGastos;