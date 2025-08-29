export const criarAgendamentoFuturo = (minutesFromNow = 30, titulo = 'Teste de Notificação', descricao = '') => {
  const agora = new Date();
  const dataAgendamento = new Date(agora.getTime() + minutesFromNow * 60 * 1000);
  const ano = dataAgendamento.getFullYear();
  const mes = String(dataAgendamento.getMonth() + 1).padStart(2, '0');
  const dia = String(dataAgendamento.getDate()).padStart(2, '0');
  const dataFormatada = `${ano}-${mes}-${dia}`;
  
  const hora = String(dataAgendamento.getHours()).padStart(2, '0');
  const minuto = String(dataAgendamento.getMinutes()).padStart(2, '0');
  const horaFormatada = `${hora}:${minuto}`;
  
  return {
    titulo,
    data: dataFormatada,
    hora: horaFormatada,
    descricao
  };
};

export const adicionarAgendamentoTeste = (minutesFromNow = 30) => {
  const novoAgendamento = criarAgendamentoFuturo(minutesFromNow);
  let agendamentos = [];
  try {
    const agendamentosStr = localStorage.getItem('agendamentos');
    if (agendamentosStr) {
      agendamentos = JSON.parse(agendamentosStr);
    }
  } catch (error) {
    console.error('Erro ao recuperar agendamentos:', error);
  }
  
  agendamentos.push(novoAgendamento);
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
  
  return novoAgendamento;
};

export const simularNotificacao = () => {
  const agendamento = adicionarAgendamentoTeste(30);
  
  const notificacaoKey = `${agendamento.data}-${agendamento.hora}-${agendamento.titulo}`;
  const agendamentosChecados = JSON.parse(localStorage.getItem('agendamentosChecados') || '{}');
  delete agendamentosChecados[notificacaoKey];
  localStorage.setItem('agendamentosChecados', JSON.stringify(agendamentosChecados));
  
  return agendamento;
};
