import React, { useState } from 'react';
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
        const novoAgendamento = { titulo, data: dataFormatada, hora, descricao };

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
        setMensagem('Agendamento excluído com sucesso!');
        setPopupVisivel(false);
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
        const agendamento = agendamentos[index];
        setTitulo(agendamento.titulo);
        setData(agendamento.data);
        setHora(agendamento.hora);
        setDescricao(agendamento.descricao || '');
        setIndiceEdicao(index);
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

    const renderTileContent = ({ date, view }) => {
        if (view === 'month') {
            const dataFormatada = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const agendamentosNaData = agendamentos.filter((ag) => ag.data === dataFormatada);

            if (agendamentosNaData.length > 0) {
                return <div className="calendar-marker"></div>;
            }
        }
        return null;
    };

    return (
        <>
            <h2>Agendar Compromisso</h2>
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

            {modalVisivel && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Agendamentos do dia</h3>
                        {agendamentosDoDia.length > 0 ? (
                            agendamentosDoDia.map((ag, index) => (
                                <div key={index} className="agendamento-modal">
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
        </>
    );
}

export default Agendamento;