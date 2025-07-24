const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function fetchAgendamentoById(id) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar agendamento');
  }
  return response.json();
}
