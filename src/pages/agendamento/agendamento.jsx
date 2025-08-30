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
    const [origemCriacao, setOrigemCriacao] = useState(null); // 'direto' ou 'opcoes'
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
      // Se for um objeto Date
      if (date instanceof Date) {
        // Use hora 12 para evitar problemas de fuso horário
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      }
      
      // Se for uma string no formato ISO YYYY-MM-DD
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        // Use hora 12 para evitar problemas de fuso
        return new Date(year, month - 1, day, 12, 0, 0);
      }
      
      // Fallback
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
        // Remove o agendamento do array principal
        setAgendamentos((prev) => prev.filter((_, i) => i !== indiceExcluir));
        
        // Remove também do array de agendamentos do dia
        setAgendamentosDoDia((prev) => prev.filter((_, i) => i !== indiceExcluir));
        
        // Mostra mensagem de sucesso
        setMensagem('Agendamento excluído com sucesso!');
        
        // Fecha apenas o popup de confirmação, mantendo o modal de agendamentos aberto
        setPopupVisivel(false);
        
        // Limpa o índice de exclusão
        setIndiceExcluir(null);
        
        // Limpa a mensagem após 3 segundos
        setTimeout(() => {
            setMensagem('');
        }, 3000);
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
        setDataSelecionada(agendamento.data); // Certifique-se de definir a data selecionada
        setModalVisivel(false); // Fecha o modal de visualização
        setModalEdicaoVisivel(true); // Abre o modal de edição
    };

    const handleDataSelecionada = (date) => {
        setData(date); 
    };

    const abrirModalAgendamentos = (dataFormatada) => {
        const agendamentosNaData = agendamentos.filter((ag) => ag.data === dataFormatada);
        
        // Sempre define os agendamentos do dia (mesmo que seja uma lista vazia)
        setAgendamentosDoDia(agendamentosNaData);
        
        // Sempre abre o modal
        setModalVisivel(true);
        
        // Se não houver agendamentos, mostra uma mensagem
        if (agendamentosNaData.length === 0) {
            setMensagem('Não há agendamentos para esta data. Você pode criar um novo agendamento.');
            setTimeout(() => {
                setMensagem('');
            }, 3000);
        }
    };

    const abrirModalOpcoes = (dataFormatada) => {
        setDataSelecionada(dataFormatada);
        setModalOpcoesVisivel(true);
    };

    // 2. Modifique a função renderTileContent para usar objetos Date para comparação
    const renderTileContent = ({ date, view }) => {
        if (view === 'month') {
            // Compare os objetos Date diretamente em vez de strings
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

    // Extrair função verificarDataPassada para evitar duplicação
    const verificarDataPassada = (dataString, horaString) => {
      const hoje = new Date();
      const dataSelecionada = normalizarData(dataString);
      
      // Se a data for hoje, verifique a hora
      if (dataSelecionada.getDate() === hoje.getDate() && 
          dataSelecionada.getMonth() === hoje.getMonth() && 
          dataSelecionada.getFullYear() === hoje.getFullYear()) {
          
        const [horaAgendamento, minutoAgendamento] = horaString.split(':').map(Number);
        return (hoje.getHours() > horaAgendamento || 
               (hoje.getHours() === horaAgendamento && hoje.getMinutes() > minutoAgendamento));
      }
      
      // Se não for hoje, compare apenas as datas
      return dataSelecionada < hoje;
    };

    const handleSalvarNoModal = () => {
        if (!titulo || !hora) {
            setMensagem('Preencha todos os campos obrigatórios com (*).');
            return;
        }

        if (verificarDataPassada(dataSelecionada, hora)) {
          setMensagem('Não é possível criar compromissos em datas ou horários que já passaram.');
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
        
        // Limpa apenas os campos do formulário, mantendo o modal aberto
        setTitulo('');
        setHora('');
        setDescricao('');
        
        // Não fecha o modal: setModalCriacaoVisivel(false);
        // Não limpa a data selecionada
        
        // Limpa a mensagem após 3 segundos
        setTimeout(() => {
            setMensagem('');
        }, 3000);
    };

    const handleSalvarEdicao = () => {
        if (!titulo || !hora) {
            setMensagem('Preencha todos os campos obrigatórios com (*).');
            return;
        }

        if (verificarDataPassada(dataSelecionada, hora)) {
          setMensagem('Não é possível criar compromissos em datas ou horários que já passaram.');
          return;
        }

        const agendamentoEditado = { 
            titulo, 
            data: dataSelecionada, 
            hora, 
            descricao 
        };

        // Atualiza o agendamento no array principal
        const agendamentosAtualizados = [...agendamentos];
        
        // Encontrar o índice correto no array principal de agendamentos
        const indiceNoArrayPrincipal = agendamentos.findIndex(
            ag => ag.titulo === agendamentosDoDia[indiceEdicao].titulo && 
                 ag.data === agendamentosDoDia[indiceEdicao].data && 
                 ag.hora === agendamentosDoDia[indiceEdicao].hora
        );
        
        if (indiceNoArrayPrincipal !== -1) {
            agendamentosAtualizados[indiceNoArrayPrincipal] = agendamentoEditado;
            setAgendamentos(agendamentosAtualizados);
            
            // Atualiza também o array de agendamentos do dia
            const agendamentosDoDiaAtualizados = [...agendamentosDoDia];
            agendamentosDoDiaAtualizados[indiceEdicao] = agendamentoEditado;
            setAgendamentosDoDia(agendamentosDoDiaAtualizados);
            
            // Fecha o modal de edição e abre o de visualização
            setModalEdicaoVisivel(false);
            setModalVisivel(true);
            
            // Mostra mensagem de sucesso
            setMensagem('Agendamento atualizado com sucesso!');
            
            // Limpa os campos
            limparCampos();
            
            // Limpa a mensagem após 3 segundos
            setTimeout(() => {
                setMensagem('');
            }, 3000);
        }
    };

    // Adicione esta função logo após a função verificarDataPassada
const mostrarMensagemTemporaria = (texto, tipo = 'info', duracao = 3000) => {
  setMensagem(texto);
  setTimeout(() => {
    setMensagem('');
  }, duracao);
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
                        showNeighboringMonth={false} // Adicione esta linha
                        onClickDay={(date) => {
                            // Cria uma data normalizada sem problemas de fuso horário
                            const dataObj = normalizarData(date);
                            
                            // Formata para armazenamento (YYYY-MM-DD)
                            const dataFormatada = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}-${String(dataObj.getDate()).padStart(2, '0')}`;
                            
                            setDataSelecionada(dataFormatada);
                            setData(dataObj);
                            
                            // Use a mesma normalização para buscar agendamentos
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
        </>
    );
}

export default Agendamento;