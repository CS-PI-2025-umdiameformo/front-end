import React, { useState, useEffect } from 'react';
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
    const [modalCriacaoVisivel, setModalCriacaoVisivel] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [modalOpcoesVisivel, setModalOpcoesVisivel] = useState(false);
    const [origemCriacao, setOrigemCriacao] = useState(null);
    const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);

    // ✅ Carrega os agendamentos do localStorage ao iniciar
    useEffect(() => {
        const agendamentosSalvos = localStorage.getItem('agendamentos');
        if (agendamentosSalvos) {
            setAgendamentos(JSON.parse(agendamentosSalvos));
        }
    }, []);

    // ✅ Salva no localStorage sempre que a lista muda
    useEffect(() => {
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    }, [agendamentos]);

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

            {/* Os modais continuam iguais — omitidos aqui por espaço */}
        </>
    );
}

export default Agendamento;
