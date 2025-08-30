import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './agendamento.css';
import { LocalStorageUDMF } from '../../utils/LocalStorageUDMF';

function Agendamento() {
    const [titulo, setTitulo] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [descricao, setDescricao] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [agendamentos, setAgendamentos] = useState([]);
    const [indiceEdicao, setIndiceEdicao] = useState(null);
    const [popupVisivel, setPopupVisivel] = useState(false);
    const [indiceExcluir, setIndiceExcluir] = useState(null);
    const [modalVisivel, setModalVisivel] = useState(false);
    const [agendamentosDoDia, setAgendamentosDoDia] = useState([]);
    const [modalCriacaoVisivel, setModalCriacaoVisivel] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [modalOpcoesVisivel, setModalOpcoesVisivel] = useState(false);
    const [origemCriacao, setOrigemCriacao] = useState(null);
    const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);
     const [usuario, setUsuario] = useState(null);
    
    useEffect(() => {
        const localStorage = new LocalStorageUDMF();
        const usuarioData = localStorage.get("usuario");
        if (usuarioData) {
            setUsuario(usuarioData);
        }
    }, []);

    // 1. Adicione esta única função utilitária que normaliza datas
    const normalizarData = (date) => {
        if (date instanceof Date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
        }
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = date.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0);
        }
        return new Date();
    };

    const limparCampos = () => {
        setTitulo('');
        setData('');
        setHora('');
        setDescricao('');
        setIndiceEdicao(null);
    };

    const handleExcluir = () => {
        setAgendamentos((prev) => prev.filter((_, i) => i !== indiceExcluir));
        setAgendamentosDoDia((prev) => prev.filter((_, i) => i !== indiceExcluir));
        setMensagem('Agendamento excluído com sucesso!');
        setPopupVisivel(false);
        setIndiceExcluir(null);
        setTimeout(() => setMensagem(''), 3000);
    };

    const abrirPopupExcluir = (index) => {
        setIndiceExcluir(index);
        setPopupVisivel(true);
    };

    const cancelarExcluir = () => {
        setIndiceExcluir(null);
        setPopupVisivel(false);
    };

    const handleEditar = (index) => {
        const agendamento = agendamentosDoDia[index];
        setTitulo(agendamento.titulo);
        setHora(agendamento.hora);
        setDescricao(agendamento.descricao || '');
        setIndiceEdicao(index);
        setDataSelecionada(agendamento.data);
        setModalVisivel(false);
        setModalEdicaoVisivel(true);
    };

    const handleDataSelecionada = (date) => {
        setData(date);
    };

    const abrirModalAgendamentos = (dataFormatada) => {
        const agendamentosNaData = agendamentos.filter((ag) => ag.data === dataFormatada);
        setAgendamentosDoDia(agendamentosNaData);
        setModalVisivel(true);
        if (agendamentosNaData.length === 0) {
            setMensagem('Não há agendamentos para esta data.');
            setTimeout(() => setMensagem(''), 3000);
        }
    };

    const abrirModalOpcoes = (dataFormatada) => {
        setDataSelecionada(dataFormatada);
        setModalOpcoesVisivel(true);
    };

    const renderTileContent = ({ date, view }) => {
        if (view === 'month') {
            const normalizedDate = normalizarData(date);
            const temAgendamento = agendamentos.some(ag => {
                const agendamentoDate = normalizarData(ag.data);
                return agendamentoDate.getTime() === normalizedDate.getTime();
            });
            if (temAgendamento) {
                return <div className="calendar-marker"></div>;
            }
        }
        return null;
    };

    const verificarDataPassada = (dataString, horaString) => {
        const hoje = new Date();
        const dataSelecionada = normalizarData(dataString);
        if (
            dataSelecionada.getDate() === hoje.getDate() &&
            dataSelecionada.getMonth() === hoje.getMonth() &&
            dataSelecionada.getFullYear() === hoje.getFullYear()
        ) {
            const [horaAgendamento, minutoAgendamento] = horaString.split(':').map(Number);
            return (
                hoje.getHours() > horaAgendamento ||
                (hoje.getHours() === horaAgendamento && hoje.getMinutes() > minutoAgendamento)
            );
        }
        return dataSelecionada < hoje;
    };

    const handleSalvarNoModal = () => {
        if (!titulo || !hora) {
            setMensagem('Preencha todos os campos obrigatórios com (*).');
            return;
        }

        if (verificarDataPassada(dataSelecionada, hora)) {
            setMensagem('Não é possível criar compromissos no passado.');
            return;
        }

        const novoAgendamento = {
            titulo,
            data: dataSelecionada,
            hora,
            descricao
        };

        setAgendamentos((prev) => [...prev, novoAgendamento]);
        mostrarMensagemTemporaria('Agendamento salvo com sucesso!', 'sucesso');
        setTitulo('');
        setHora('');
        setDescricao('');
        setTimeout(() => setMensagem(''), 3000);
    };

    const handleSalvarEdicao = () => {
        if (!titulo || !hora) {
            setMensagem('Preencha todos os campos obrigatórios com (*).');
            return;
        }

        if (verificarDataPassada(dataSelecionada, hora)) {
            setMensagem('Não é possível criar compromissos no passado.');
            return;
        }

        const agendamentoEditado = {
            titulo,
            data: dataSelecionada,
            hora,
            descricao
        };

        const agendamentosAtualizados = [...agendamentos];
        const indiceNoArrayPrincipal = agendamentos.findIndex(
            ag =>
                ag.titulo === agendamentosDoDia[indiceEdicao].titulo &&
                ag.data === agendamentosDoDia[indiceEdicao].data &&
                ag.hora === agendamentosDoDia[indiceEdicao].hora
        );

        if (indiceNoArrayPrincipal !== -1) {
            agendamentosAtualizados[indiceNoArrayPrincipal] = agendamentoEditado;
            setAgendamentos(agendamentosAtualizados);

            const agendamentosDoDiaAtualizados = [...agendamentosDoDia];
            agendamentosDoDiaAtualizados[indiceEdicao] = agendamentoEditado;
            setAgendamentosDoDia(agendamentosDoDiaAtualizados);

            setModalEdicaoVisivel(false);
            setModalVisivel(true);
            setMensagem('Agendamento atualizado com sucesso!');
            limparCampos();
            setTimeout(() => setMensagem(''), 3000);
        }
    };

    const mostrarMensagemTemporaria = (texto, tipo = 'info', duracao = 3000) => {
        setMensagem(texto);
        setTimeout(() => setMensagem(''), duracao);
    };

    return (
        <>
            <h2>Agenda de Compromissos</h2>
            {usuario && (
                <div className="mensagem-boas-vindas">
                    Bem-vindo à sua agenda, {usuario.nome}!
                </div>
            )}
            <div className="container">
                <div className="calendario-container">
                    <Calendar
                        onChange={handleDataSelecionada}
                        value={data ? new Date(data) : new Date()}
                        selectRange={false}
                        tileContent={renderTileContent}
                        showNeighboringMonth={false}
                        onClickDay={(date) => {
                            const dataObj = normalizarData(date);
                            const dataFormatada = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}-${String(dataObj.getDate()).padStart(2, '0')}`;
                            setDataSelecionada(dataFormatada);
                            setData(dataObj);

                            const agendamentosNaData = agendamentos.filter(ag => {
                                const agDate = normalizarData(ag.data);
                                return agDate.getTime() === dataObj.getTime();
                            });

                            if (agendamentosNaData.length > 0) {
                                abrirModalOpcoes(dataFormatada);
                            } else {
                                setOrigemCriacao('direto');
                                setModalCriacaoVisivel(true);
                            }
                        }}
                        className="calendario-standalone"
                    />
                    {mensagem && <div className="mensagem">{mensagem}</div>}
                </div>
            </div>

            {popupVisivel && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Confirmação de Exclusão</h3>
                        <p>Tem certeza de que deseja excluir este agendamento?</p>
                        <div className="modal-actions">
                            <button onClick={handleExcluir}>Confirmar</button>
                            <button onClick={cancelarExcluir}>Voltar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalVisivel && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Agendamentos do dia</h3>
                        {mensagem && <div className="mensagem">{mensagem}</div>}
                        {agendamentosDoDia.length > 0 ? (
                            agendamentosDoDia.map((ag, index) => (
                                <div key={index} className="agendamento-modal">
                                    <p><strong>{ag.titulo}</strong></p>
                                    <p>{ag.hora}</p>
                                    {ag.descricao && <p>{ag.descricao}</p>}
                                    <div className="agendamento-acoes">
                                        <button onClick={() => handleEditar(index)}>Editar</button>
                                        <button onClick={() => abrirPopupExcluir(index)}>Excluir</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Nenhum agendamento para este dia.</p>
                        )}
                        <div className="modal-actions">
                            <button onClick={() => {
                                setModalVisivel(false);
                                if (modalOpcoesVisivel === false) {
                                    setModalOpcoesVisivel(true);
                                }
                            }}>Voltar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalCriacaoVisivel && (
                <div className="modal" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <h3>Criar Agendamento</h3>
                        {mensagem && <div className="mensagem">{mensagem}</div>}
                        <div className="form-group">
                            <label>Título *</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Data</label>
                            <p>{dataSelecionada ? normalizarData(dataSelecionada).toLocaleDateString('pt-BR') : ''}</p>
                        </div>
                        <div className="form-group">
                            <label>Hora *</label>
                            <input
                                type="time"
                                value={hora}
                                onChange={(e) => setHora(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Descrição (opcional)</label>
                            <textarea
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleSalvarNoModal}>Adicionar</button>
                            <button onClick={() => {
                                setModalCriacaoVisivel(false);
                                // Verificar se há agendamentos na data atual (incluindo o recém-criado)
                                const agendamentosNaDataAtual = agendamentos.filter(ag =>
                                    normalizarData(ag.data).getTime() === normalizarData(dataSelecionada).getTime()
                                );
                                // Se veio do modal de opções ou se já existem agendamentos, mostrar modal de opções
                                if (origemCriacao === 'opcoes' || agendamentosNaDataAtual.length > 0) {
                                    setModalOpcoesVisivel(true);
                                }
                                // Limpar estado
                                setOrigemCriacao(null);
                                limparCampos();
                            }}>
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalOpcoesVisivel && (
                <div className="modal" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <h3>Opções para {dataSelecionada ? normalizarData(dataSelecionada).toLocaleDateString('pt-BR') : ''}</h3>
                        <div className="modal-options">
                            <button onClick={() => {
                                setModalOpcoesVisivel(false);
                                setOrigemCriacao('opcoes');
                                setModalCriacaoVisivel(true);
                            }}>
                                Criar Agendamento
                            </button>
                            <button onClick={() => {
                                setModalOpcoesVisivel(false);
                                abrirModalAgendamentos(dataSelecionada);
                            }}>
                                Ver Agendamentos
                            </button>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setModalOpcoesVisivel(false)}>Voltar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalEdicaoVisivel && (
                <div className="modal" role="dialog" aria-modal="true">
                    <div className="modal-content edicao">
                        <h3>Editar Agendamento</h3>
                        {mensagem && <div className="mensagem">{mensagem}</div>}
                        <div className="form-group">
                            <label>Título *</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Data</label>
                            <p>{dataSelecionada ? normalizarData(dataSelecionada).toLocaleDateString('pt-BR') : ''}</p>
                        </div>
                        <div className="form-group">
                            <label>Hora *</label>
                            <input
                                type="time"
                                value={hora}
                                onChange={(e) => setHora(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Descrição (opcional)</label>
                            <textarea
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleSalvarEdicao}>Salvar Alterações</button>
                            <button onClick={() => {
                                setModalEdicaoVisivel(false);
                                setModalVisivel(true); // Volta para o modal de visualização
                                limparCampos();
                            }}>Voltar</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de detalhes de agendamento ao clicar na notificação */}
            {agendamentoDetalheVisivel && agendamentoSelecionado && (
                <div className="modal" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <h3>Detalhes do Agendamento</h3>
                        <div className="agendamento-detalhe">
                            <p><strong>Título:</strong> {agendamentoSelecionado.titulo}</p>
                            <p><strong>Data:</strong> {normalizarData(agendamentoSelecionado.data).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Horário:</strong> {agendamentoSelecionado.hora}</p>
                            {agendamentoSelecionado.descricao && (
                                <p><strong>Descrição:</strong> {agendamentoSelecionado.descricao}</p>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setAgendamentoDetalheVisivel(false)}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Agendamento;