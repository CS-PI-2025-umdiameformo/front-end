const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function fetchAgendamentoById(id) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar agendamento');
  }
  return response.json();
}

export async function criarUsuario(userData) {
  const response = await fetch(`${API_URL}/User/Create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      cpf: userData.cpf || '',
      telefone: userData.telefone || '',
      passwordHash: userData.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return response.json();
}
