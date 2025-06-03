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


    const [recorrencia, setRecorrencia] = useState('');
    const [quantidadeRecorrencias, setQuantidadeRecorrencias] = useState(1);
    const [diasSelecionados, setDiasSelecionados] = useState([]);


    const handleSalvar = () => {
        if (!titulo || !data || !hora) {
            return setMensagem('Preencha todos os campos obrigatórios.');
        }

        const dataHoraSelecionada = new Date(`${data}T${hora}`);
        if (dataHoraSelecionada < new Date()) {
            return setMensagem('Não é possível agendar para uma data/hora passada.');
        }

        let novosAgendamentos = [];

        if (recorrencia === 'Semanal') {
            for (let i = 0; i < quantidadeRecorrencias; i++) {
                const novaData = new Date(dataHoraSelecionada);
                novaData.setDate(novaData.getDate() + i * 7);
                novosAgendamentos.push({
                    titulo,
                    data: novaData.toISOString().split('T')[0],
                    hora,
                    descricao,
                });
            }
        } else if (recorrencia === 'Mensal') {
            for (let i = 0; i < quantidadeRecorrencias; i++) {
                const novaData = new Date(dataHoraSelecionada);
                novaData.setMonth(novaData.getMonth() + i);
                novosAgendamentos.push({
                    titulo,
                    data: novaData.toISOString().split('T')[0],
                    hora,
                    descricao,
                });
            }
        } else if (recorrencia === 'diasDaSemana') {
            let count = 0;
            let gerados = 0;
            while (gerados < quantidadeRecorrencias) {
                const novaData = new Date(dataHoraSelecionada);
                novaData.setDate(novaData.getDate() + count);
                if (diasSelecionados.includes(novaData.getDay())) {
                    novosAgendamentos.push({
                        titulo,
                        data: novaData.toISOString().split('T')[0],
                        hora,
                        descricao,
                    });
                    gerados++;
                }
                count++;
            }
        } else {
            novosAgendamentos.push({ titulo, data, hora, descricao });
        }

        setAgendamentos((prev) => {
            const atualizados = [...prev];
            if (indiceEdicao !== null) {
                atualizados[indiceEdicao] = novosAgendamentos[0];
                setMensagem('Agendamento atualizado com sucesso!');
            } else {
                atualizados.push(...novosAgendamentos);
                setMensagem(
                    recorrencia
                        ? `Criado ${novosAgendamentos.length} agendamentos com sucesso!`
                        : 'Agendamento salvo com sucesso!'
                );
            }
            return atualizados;
        });

        limparCampos();
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
        setRecorrencia('');
        setQuantidadeRecorrencias(1);
        setDiasSelecionados([]);
    };

    const handleEditar = (index) => {
        const agendamento = agendamentos[index];
        setTitulo(agendamento.titulo);
        setData(agendamento.data);
        setHora(agendamento.hora);
        setDescricao(agendamento.descricao || '');
        setIndiceEdicao(index);
        setRecorrencia(''); 
        setQuantidadeRecorrencias(1);
        setDiasSelecionados([]);
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

            <div className="form-group">
                <label>Recorrência</label>
                <select value={recorrencia} onChange={(e) => setRecorrencia(e.target.value)}>
                    <option value="">Nenhuma</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensal">Mensal</option>
                    <option value="diasDaSemana">Dias da Semana</option>
                </select>
            </div>

            {recorrencia === 'diasDaSemana' && (
                <div className="form-group">
                    <label>Dias da Semana</label>
                    <div>
                        {[0, 1, 2, 3, 4, 5, 6].map((dia) => (
                            <label key={dia}>
                                <input
                                    type="checkbox"
                                    checked={diasSelecionados.includes(dia)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setDiasSelecionados((prev) => [...prev, dia]);
                                        } else {
                                            setDiasSelecionados((prev) =>
                                                prev.filter((d) => d !== dia)
                                            );
                                        }
                                    }}
                                />
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dia]}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {recorrencia && (
                <div className="form-group">
                    <label>Quantidade de Recorrências</label>
                    <input
                        type="number"
                        min="1"
                        value={quantidadeRecorrencias}
                        onChange={(e) => setQuantidadeRecorrencias(Number(e.target.value))}
                    />
                </div>
            )}

            <button onClick={handleSalvar}>
                {indiceEdicao !== null ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
            </button>

            {mensagem && <div className="mensagem">{mensagem}</div>}

            <h3>Agendamentos</h3>
            <div className="lista-agendamentos">
                {agendamentos.map((ag, index) => (
                    <div key={index} className="agendamento">
                        {ag.data} {ag.hora} - <strong>{ag.titulo}</strong> {ag.descricao && `| ${ag.descricao}`}

                        <button onClick={() => abrirPopupExcluir(index)}>Excluir</button>

                        <button onClick={() => handleEditar(index)}>Editar</button>

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
