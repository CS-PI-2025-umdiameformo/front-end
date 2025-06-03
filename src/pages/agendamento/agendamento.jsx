import React, { useState } from 'react';
import './agendamento.css'; 

function Agendamento() {
    const [titulo, setTitulo] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [descricao, setDescricao] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [agendamentos, setAgendamentos] = useState([]);
    const [indiceEdicao, setIndiceEdicao] = useState(null);
    const [popupVisivel, setPopupVisivel] = useState(false); // Controla a visibilidade do Popup
    const [indiceExcluir, setIndiceExcluir] = useState(null); // Armazena o índice do agendamento a ser excluído

    const handleSalvar = () => {
        if (!titulo || !data || !hora) {
            return setMensagem('Preencha todos os campos obrigatórios.');
        }

        const dataHoraSelecionada = new Date(`${data}T${hora}`);
        if (dataHoraSelecionada < new Date()) {
            return setMensagem('Não é possível agendar para uma data/hora passada.');
        }

        const novoAgendamento = { titulo, data, hora, descricao };

        setAgendamentos((prev) => {
            const novosAgendamentos = [...prev];
            if (indiceEdicao !== null) {
                novosAgendamentos[indiceEdicao] = novoAgendamento;
                setMensagem('Agendamento atualizado com sucesso!');
            } else {
                novosAgendamentos.push(novoAgendamento);
                setMensagem('Agendamento salvo com sucesso!');
            }
            return novosAgendamentos;
        });

        limparCampos();
    };

    const handleEditar = (index) => {
        const agendamento = agendamentos[index];
        setTitulo(agendamento.titulo);
        setData(agendamento.data);
        setHora(agendamento.hora);
        setDescricao(agendamento.descricao);
        setIndiceEdicao(index);
    };

    const handleExcluir = () => {
        setAgendamentos((prev) => prev.filter((_, i) => i !== indiceExcluir));
        setMensagem('Agendamento excluído com sucesso!');
        setPopupVisivel(false); // Fecha o Popup após a exclusão
    };

    const abrirPopupExcluir = (index) => {
        setIndiceExcluir(index);
        setPopupVisivel(true); // Exibe o Popup
    };

    const cancelarExcluir = () => {
        setIndiceExcluir(null);
        setPopupVisivel(false); // Fecha o Popup sem excluir
    };

    const limparCampos = () => {
        setTitulo('');
        setData('');
        setHora('');
        setDescricao('');
        setIndiceEdicao(null);
    };

    const handleEditarClick = (index) => {
        handleEditar(index);
    };

    return (
        <div className="agendamento-container">
            <h2>Agendar Compromisso</h2>

            <div className="form-group">
                <label>Título *</label>
                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>

            <div className="form-group">
                <label>Data *</label>
                <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>

            <div className="form-group">
                <label>Hora *</label>
                <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>

            <div className="form-group">
                <label>Descrição (opcional)</label>
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>

            <button onClick={handleSalvar}>
                {indiceEdicao !== null ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
            </button>

            {mensagem && <div className="mensagem">{mensagem}</div>}

            <h3>Agendamentos</h3>
            <div className="lista-agendamentos">
                {agendamentos.map((ag, index) => (
                    <div key={index} className="agendamento">
                        {ag.data} {ag.hora} - <strong>{ag.titulo}</strong> {ag.descricao && `| ${ag.descricao}`}
                        <button onClick={() => handleEditarClick(index)}>Editar</button>
                        <button onClick={() => abrirPopupExcluir(index)}>Excluir</button>
                    </div>
                ))}
            </div>

            {/* Popup de confirmação */}
            {popupVisivel && (
                <div className="popup">
                    <div className="popup-content">
                        <p>Tem certeza de que deseja excluir este agendamento?</p>
                        <button onClick={handleExcluir}>Confirmar</button>
                        <button onClick={cancelarExcluir}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Agendamento;
