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
            return setMensagem('Preencha todos os campos obrigatórios com (*).');
        }

        const novoAgendamento = { titulo, data, hora, descricao };
        setAgendamentos((prev) => [...prev, novoAgendamento]);
        setMensagem('Agendamento salvo com sucesso!');
        limparCampos();
    };

    const limparCampos = () => {
        setTitulo('');
        setData('');
        setHora('');
        setDescricao('');
    };

    return (
        <>
            <div className="container">
                <div className="teste">
                    <h2>Agendar Compromisso</h2>

                    <div className="form-group">
                        <label>Título*</label>
                        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Data*</label>
                        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Hora*</label>
                        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Descrição (opcional)</label>
                        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                    </div>

                    <button onClick={handleSalvar}>Salvar Agendamento</button>

                    {mensagem && <div className="mensagem">{mensagem}</div>}
                </div>
            </div>

            
        </>
    );
}

export default Agendamento;
