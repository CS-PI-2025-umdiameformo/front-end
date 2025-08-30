import React, { useState, useEffect } from 'react';
import '../pages/agendamento/agendamento.css';
import './UpcomingEvents.css';
import { agendamentosApi, clientesApi } from '../utils/localStorageApi';
import { obterTiposServico } from '../utils/calendarConfig';
import { Card } from 'primereact/card';

function UpcomingEvents({ eventos = null, onSelecionar }) {
  const [proximosEventos, setProximosEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Carregar eventos do localStorage se não fornecidos como propriedade
  const carregarEventosDoLocalStorage = () => {
    // Buscar todos os agendamentos
    const todosAgendamentos = agendamentosApi.getAll();
    processarEventos(todosAgendamentos);
  };

  useEffect(() => {
    setLoading(true);
    if (!eventos) {
      carregarEventosDoLocalStorage();
    } else {
      processarEventos(eventos);
    }
    setLoading(false);
  }, [eventos, carregarEventosDoLocalStorage]);
  
  const processarEventos = (eventosParaProcessar) => {
    const agora = new Date();
    const tiposServico = obterTiposServico();
    
    // Filtrar apenas os próximos eventos (data/hora após agora)
    const proximos = eventosParaProcessar
      .filter((e) => new Date(`${e.data}T${e.hora}`) >= agora)
      .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`))
      .slice(0, 5)
      .map(evento => {
        // Adicionar informações de cliente e tipo de serviço se disponíveis
        const cliente = evento.clienteId ? clientesApi.getById(evento.clienteId) : null;
        const tipoServico = tiposServico[evento.tipoServicoId || evento.tipo || 'outro'];
        
        return {
          ...evento,
          nomeCliente: cliente ? cliente.nome : null,
          corServico: tipoServico ? tipoServico.color : '#673AB7',
          nomeServico: tipoServico ? tipoServico.title : 'Outro'
        };
      });
    
    setProximosEventos(proximos);
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    
    // Se for hoje
    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } 
    // Se for amanhã
    else if (data.toDateString() === amanha.toDateString()) {
      return 'Amanhã';
    } 
    // Outros casos
    else {
      return data.toLocaleDateString('pt-BR');
    }
  };

  const cardHeader = (
    <div className="upcoming-header">
      <i className="pi pi-calendar-plus mr-2"></i>
      <span>Próximos Agendamentos</span>
    </div>
  );

  // Se estiver carregando
  if (loading) {
    return (
      <Card title={cardHeader} className="upcoming-card">
        <div className="loading-events">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
          <p>Carregando agendamentos...</p>
        </div>
      </Card>
    );
  }

  // Se não há eventos para mostrar
  if (!proximosEventos || proximosEventos.length === 0) {
    return (
      <Card title={cardHeader} className="upcoming-card">
        <div className="no-events">
          <i className="pi pi-calendar-times" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
          <p>Nenhum agendamento próximo</p>
          <p className="empty-message">Os próximos agendamentos aparecerão aqui quando forem cadastrados.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={cardHeader} className="upcoming-card">
      <div className="upcoming-events-list">
        {proximosEventos.map((ag) => (
          <div key={ag.id} 
               className="agendamento-item" 
               onClick={() => onSelecionar && onSelecionar(ag.id)}
               style={{ borderLeft: `4px solid ${ag.corServico}` }}>
            <div className="agendamento-data">
              <span className="dia">{formatarData(ag.data)}</span>
              <span className="hora">{ag.hora}</span>
            </div>
            <div className="agendamento-info">
              <p className="agendamento-titulo">{ag.titulo}</p>
              {ag.nomeCliente && <p className="cliente-info"><i className="pi pi-user mr-1"></i>{ag.nomeCliente}</p>}
              {ag.nomeServico && <span className="tipo-servico" style={{ backgroundColor: ag.corServico }}>{ag.nomeServico}</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default UpcomingEvents;
