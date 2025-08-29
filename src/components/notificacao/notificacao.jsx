import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './notificacao.css';

const Notificacao = ({ agendamento, onClose, onViewDetails }) => {
  if (!agendamento) return null;

  return (
    <div className="notificacao-popup">
      <div className="notificacao-header">
        <h4>Lembrete de Compromisso</h4>
        <button className="notificacao-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="notificacao-content">
        <p><strong>{agendamento.titulo}</strong></p>
        <p>Horário: {agendamento.hora}</p>
        <p>Em 30 minutos</p>
      </div>
      <div className="notificacao-footer">
        <button className="notificacao-btn" onClick={() => onViewDetails(agendamento)}>
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};

const GerenciadorNotificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [agendamentosChecados, setAgendamentosChecados] = useState({});
  const navigate = useNavigate();
  const buscarAgendamentos = () => {
    try {
      const agendamentosStr = localStorage.getItem('agendamentos');
      return agendamentosStr ? JSON.parse(agendamentosStr) : [];
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
  };
  const verificarAgendamentosProximos = () => {
    const agendamentos = buscarAgendamentos();
    const agora = new Date();
    
    const agendamentosProximos = agendamentos.filter(ag => {
      if (agendamentosChecados[`${ag.data}-${ag.hora}-${ag.titulo}`]) {
        return false;
      }

      const [ano, mes, dia] = ag.data.split('-').map(Number);
      const [hora, minuto] = ag.hora.split(':').map(Number);
      const dataAgendamento = new Date(ano, mes - 1, dia, hora, minuto);
      
      const diferencaEmMin = Math.floor((dataAgendamento - agora) / (1000 * 60));
      
      return diferencaEmMin >= 29 && diferencaEmMin <= 31;
    });
    
    if (agendamentosProximos.length > 0) {
      setNotificacoes(prevNotificacoes => [...prevNotificacoes, ...agendamentosProximos]);
      
      const novosChecados = { ...agendamentosChecados };
      agendamentosProximos.forEach(ag => {
        novosChecados[`${ag.data}-${ag.hora}-${ag.titulo}`] = true;
      });
      setAgendamentosChecados(novosChecados);
    }
  };
  const fecharNotificacao = (index) => {
    setNotificacoes(prev => prev.filter((_, i) => i !== index));
  };

  const verDetalhes = (agendamento) => {
    localStorage.setItem('agendamentoSelecionado', JSON.stringify(agendamento));
    
    navigate('/agendamento');
    
    setNotificacoes(prev => 
      prev.filter(notif => 
        !(notif.data === agendamento.data && 
          notif.hora === agendamento.hora && 
          notif.titulo === agendamento.titulo)
      )
    );
  };
  useEffect(() => {
    const checadosStorage = localStorage.getItem('agendamentosChecados');
    if (checadosStorage) {
      setAgendamentosChecados(JSON.parse(checadosStorage));
    }
  }, []);
  
  useEffect(() => {
    if (Object.keys(agendamentosChecados).length > 0) {
      localStorage.setItem('agendamentosChecados', JSON.stringify(agendamentosChecados));
    }
  }, [agendamentosChecados]);

  useEffect(() => {
    verificarAgendamentosProximos();
    
    const intervalo = setInterval(() => {
      verificarAgendamentosProximos();
    }, 60000);
    
    return () => clearInterval(intervalo);
  }, [agendamentosChecados]);

  return (
    <>
      {notificacoes.map((agendamento, index) => (
        <Notificacao
          key={`${agendamento.data}-${agendamento.hora}-${index}`}
          agendamento={agendamento}
          onClose={() => fecharNotificacao(index)}
          onViewDetails={verDetalhes}
        />
      ))}
    </>
  );
};

export default GerenciadorNotificacoes;
