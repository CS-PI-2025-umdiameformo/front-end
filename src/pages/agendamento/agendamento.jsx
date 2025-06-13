import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importa o CSS do calendário
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

    const handleSalvar = () => {
        if (!titulo || !data || !hora) {
            setMensagem('Preencha todos os campos obrigatórios com (*).');
            return;
        }

        const novoAgendamento = { titulo, data, hora, descricao };

        if (indiceEdicao !== null) {
            // Atualiza o agendamento existente
            const agendamentosAtualizados = [...agendamentos];
            agendamentosAtualizados[indiceEdicao] = novoAgendamento;
            setAgendamentos(agendamentosAtualizados);
            setMensagem('Agendamento atualizado com sucesso!');
        } else {
            // Adiciona um novo agendamento
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
        const dataFormatada = date.toISOString().split('T')[0]; // Formata a data para yyyy-MM-dd
        setData(dataFormatada);
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
                        />
                        <p>Data selecionada: {data}</p>
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
                    <h3>Agendamentos</h3>
                    <div className="lista-agendamentos">
                        {agendamentos.map((ag, index) => (
                            <div key={index} className="agendamento">
                                <div className="agendamento-info">
                                    <p><strong>{ag.titulo}</strong></p>
                                    <p>{ag.data} {ag.hora}</p>
                                    {ag.descricao && <p>{ag.descricao}</p>}
                                </div>
                                <div className="agendamento-acoes">
                                    <button onClick={() => abrirPopupExcluir(index)}>Excluir</button>
                                    <button onClick={() => handleEditar(index)}>Editar</button>
                                </div>
                            </div>
                        ))}
                    </div>
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
        </>
    );
}

export default Agendamento;