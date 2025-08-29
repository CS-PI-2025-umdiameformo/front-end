import React from 'react';
import '../pages/agendamento/agendamento.css';
import { simularNotificacao } from '../utils/notificacaoUtils';

function UpcomingEvents({ eventos, onSelecionar }) {
  const testarNotificacao = () => {
    const agendamento = simularNotificacao();
    console.log('Notificação de teste criada:', agendamento);
    alert('Notificação de teste criada! Você receberá uma notificação para um agendamento que ocorrerá em 30 minutos.');
  };
  if (!eventos || eventos.length === 0) {
    return null;
  }

  const agora = new Date();
  const proximos = eventos
    .filter((e) => new Date(`${e.data}T${e.hora}`) >= agora)
    .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`))
    .slice(0, 5);

  return (
    <div className="lista-agendamentos">
      <h3>Próximos agendamentos</h3>
      {proximos.length > 0 ? (
        proximos.map((ag) => (
          <div key={ag.id || `${ag.data}-${ag.hora}`} className="agendamento" onClick={() => onSelecionar(ag.id)}>
            <div className="agendamento-info">
              <p><strong>{ag.titulo}</strong></p>
              <p>{new Date(ag.data).toLocaleDateString('pt-BR')} {ag.hora}</p>
            </div>
          </div>
        ))
      ) : (
        <p>Não há agendamentos próximos</p>
      )}
      
      {process.env.NODE_ENV !== 'production' && (
        <button 
          className="teste-notificacao-btn" 
          onClick={testarNotificacao}
          style={{ 
            marginTop: '10px', 
            background: '#f0f0f0', 
            border: '1px solid #ccc',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Testar Notificação
        </button>
      )}
    </div>
  );
}

export default UpcomingEvents;
