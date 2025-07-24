import React, { useState } from 'react';
import { fetchAgendamentoById } from '../../utils/api';
import UpcomingEvents from '../../components/UpcomingEvents';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './agendamento.css';

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
    const [modalDetalheVisivel, setModalDetalheVisivel] = useState(false);
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

    const handleSalvar = () => {
        if (!titulo || !data || !hora) {
            setMensagem('Preencha todos os campos obrigatórios com (*).');
            return;
        }

        const dataAtual = new Date();
        const dataSelecionada = new Date(`${data}T${hora}`);

        if (dataSelecionada < dataAtual) {
            setMensagem('Não é possível criar compromissos em datas ou horários que já passaram.');
            return;
        }

        const dataFormatada = data.toLocaleDateString('en-CA');
        const novoAgendamento = {
            id: Date.now(),
            titulo,
            data: dataFormatada,
            hora,
            descricao,
        };

        if (indiceEdicao !== null) {
            const agendamentosAtualizados = [...agendamentos];
            agendamentosAtualizados[indiceEdicao] = novoAgendamento;
            setAgendamentos(agendamentosAtualizados);
            setMensagem('Agendamento atualizado com sucesso!');
        } else {
            setAgendamentos((prev) => [...prev, novoAgendamento]);
            setMensagem('Agendamento salvo com sucesso!');
        }

        limparCampos();
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
        setDataSelecionada(agendamento.data);
        setModalVisivel(false);
        setModalEdicaoVisivel(true);
    };

    const handleDataSelecionada = (date) => {
        setData(date); 
    };

    const abrirModalAgendamentos = (dataFormatada) => {
        const agendamentosNaData = agendamentos.filter((ag) => ag.data === dataFormatada);

        if (agendamentosNaData.length > 0) {
            setAgendamentosDoDia(agendamentosNaData);
            setModalVisivel(true);
        }
    };

    const abrirDetalheAgendamento = async (id) => {
        try {
            const dados = await fetchAgendamentoById(id);
            setAgendamentoSelecionado(dados);
            setModalDetalheVisivel(true);
        } catch (error) {
            console.error(error);
        }
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
      
      if (dataSelecionada.getDate() === hoje.getDate() && 
          dataSelecionada.getMonth() === hoje.getMonth() && 
          dataSelecionada.getFullYear() === hoje.getFullYear()) {
          
        const [horaAgendamento, minutoAgendamento] = horaString.split(':').map(Number);
        return (hoje.getHours() > horaAgendamento || 
               (hoje.getHours() === horaAgendamento && hoje.getMinutes() > minutoAgendamento));
      }
      
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
        
        setTitulo('');
        setHora('');
        setDescricao('');
        
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

        const agendamentosAtualizados = [...agendamentos];
        
        const indiceNoArrayPrincipal = agendamentos.findIndex(
            ag => ag.titulo === agendamentosDoDia[indiceEdicao].titulo && 
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
            
            setTimeout(() => {
                setMensagem('');
            }, 3000);
        }
    };

    const mostrarMensagemTemporaria = (texto, tipo = 'info', duracao = 3000) => {
      setMensagem(texto);
      setTimeout(() => {
        setMensagem('');
      }, duracao);
    };

    return (
        <>
            <h2>Agenda de Compromissos</h2>
            <div className="container">
                <div className="teste">
                    <div className="form-group">
                        <label>Título *</label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Data *</label>
                        <Calendar
                            onChange={handleDataSelecionada}
                            value={data ? new Date(data) : new Date()}
                            selectRange={false}
                            tileContent={renderTileContent}
                            onClickDay={(date) => abrirModalAgendamentos(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)}
                        />
                        <p>Data selecionada: {data ? new Date(data).toLocaleDateString('pt-BR') : 'Nenhuma data selecionada'}</p>
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
                    <button onClick={handleSalvar}>
                        {indiceEdicao !== null ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
                    </button>
                    {mensagem && <div className="mensagem">{mensagem}</div>}
                    <UpcomingEvents eventos={agendamentos} onSelecionar={abrirDetalheAgendamento} />
                </div>
            </div>

            {popupVisivel && (
                <div className="popup">
                    <div className="popup-content">
                        <p>Tem certeza de que deseja excluir este agendamento?</p>
                        <button onClick={handleExcluir}>Confirmar</button>
                        <button onClick={cancelarExcluir}>Cancelar</button>
                    </div>
                </div>
            )}

            {modalDetalheVisivel && agendamentoSelecionado && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Agendamentos do dia</h3>
                        {agendamentosDoDia.length > 0 ? (
                            agendamentosDoDia.map((ag, index) => (
                                <div
                                    key={index}
                                    className="agendamento-modal"
                                    onClick={() => abrirDetalheAgendamento(ag.id)}
                                >
                                    <p><strong>{ag.titulo}</strong></p>
                                    <p>{ag.hora}</p>
                                    {ag.descricao && <p>{ag.descricao}</p>}
                                </div>
                            ))
                        ) : (
                            <p>Nenhum agendamento para este dia.</p>
                        )}
                        <button onClick={() => setModalVisivel(false)}>Fechar</button>
                    </div>
                </div>
            )}

            {modalDetalheVisivel && agendamentoSelecionado && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{agendamentoSelecionado.titulo}</h3>
                        <p>{new Date(agendamentoSelecionado.data).toLocaleDateString('pt-BR')} {agendamentoSelecionado.hora}</p>
                        {agendamentoSelecionado.descricao && <p>{agendamentoSelecionado.descricao}</p>}
                        {agendamentoSelecionado.regularidade && <p>Regularidade: {agendamentoSelecionado.regularidade}</p>}
                        <button onClick={() => setModalDetalheVisivel(false)}>Fechar</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Agendamento;