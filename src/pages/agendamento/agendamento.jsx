import React, { useState } from 'react';
import './agendamento.css'; 

function Agendamento() {
    const [titulo, setTitulo] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [descricao, setDescricao] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [agendamentos, setAgendamentos] = useState([]);

    const handleSalvar = () => {
        if (!titulo || !data || !hora) {
            setMensagem('Preencha todos os campos obrigatórios.');
            return;
        }

        const dataHoraSelecionada = new Date(`${data}T${hora}`);
        const agora = new Date();
        if (dataHoraSelecionada < agora) {
            setMensagem('Não é possível agendar para uma data/hora passada.');
            return;
        }

        const novoAgendamento = { titulo, data, hora, descricao };
        setAgendamentos([...agendamentos, novoAgendamento]);
        setMensagem('Agendamento salvo com sucesso!');

        // Limpa os campos
        setTitulo('');
        setData('');
        setHora('');
        setDescricao('');
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

            <button onClick={handleSalvar}>Salvar Agendamento</button>

            {mensagem && <div className="mensagem">{mensagem}</div>}

            <h3>Agendamentos</h3>
            <div className="lista-agendamentos">
                {agendamentos.map((ag, index) => (
                    <div key={index} className="agendamento">
                        {ag.data} {ag.hora} - <strong>{ag.titulo}</strong> {ag.descricao && `| ${ag.descricao}`}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Agendamento;
