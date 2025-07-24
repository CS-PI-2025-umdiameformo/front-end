import React from 'react';
import '../pages/agendamento/agendamento.css';

function UpcomingEvents({ eventos, onSelecionar }) {
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
      {proximos.map((ag) => (
        <div key={ag.id} className="agendamento" onClick={() => onSelecionar(ag.id)}>
          <div className="agendamento-info">
            <p><strong>{ag.titulo}</strong></p>
            <p>{new Date(ag.data).toLocaleDateString('pt-BR')} {ag.hora}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UpcomingEvents;
