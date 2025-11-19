/**
 * Utilitários para gerenciamento de lembretes por e-mail
 */
import { lembretesEmailApi, preferencesApi, agendamentosApi, clientesApi, servicosApi } from './localStorageApi';

/**
 * Calcula a data e hora para envio do lembrete (24 horas antes do agendamento)
 * @param {string} dataAgendamento - Data do agendamento (formato YYYY-MM-DD)
 * @param {string} horaAgendamento - Hora do agendamento (formato HH:MM)
 * @returns {Date} Data e hora do envio do lembrete
 */
export const calcularDataEnvioLembrete = (dataAgendamento, horaAgendamento) => {
  const dataHoraAgendamento = new Date(`${dataAgendamento}T${horaAgendamento}:00`);
  const dataEnvio = new Date(dataHoraAgendamento.getTime() - (24 * 60 * 60 * 1000)); // 24 horas antes
  return dataEnvio;
};

/**
 * Verifica se os lembretes por e-mail estão ativos
 * @returns {boolean} true se lembretes estão ativos
 */
export const lembretesEstaoAtivos = () => {
  return preferencesApi.get('lembretesEmailAtivos', true);
};

/**
 * Cria um lembrete para um agendamento
 * @param {object} agendamento - Dados do agendamento
 * @returns {object|null} Lembrete criado ou null se lembretes desativados
 */
export const criarLembreteParaAgendamento = (agendamento) => {
  // Verificar se lembretes estão ativos
  if (!lembretesEstaoAtivos()) {
    console.log('Lembretes por e-mail desativados. Nenhum lembrete criado.');
    return null;
  }

  // Verificar se o agendamento tem data e hora futuras
  const agora = new Date();
  const dataHoraAgendamento = new Date(`${agendamento.data}T${agendamento.hora}:00`);
  
  if (dataHoraAgendamento <= agora) {
    console.log('Agendamento no passado. Nenhum lembrete criado.');
    return null;
  }

  // Calcular data de envio do lembrete
  const dataEnvioLembrete = calcularDataEnvioLembrete(agendamento.data, agendamento.hora);
  
  // Se a data de envio já passou, não criar lembrete
  if (dataEnvioLembrete <= agora) {
    console.log('Data de envio do lembrete já passou. Nenhum lembrete criado.');
    return null;
  }

  // Buscar informações adicionais
  const cliente = agendamento.clienteId ? clientesApi.getById(agendamento.clienteId) : null;
  const servico = agendamento.tipoServicoId ? servicosApi.getById(agendamento.tipoServicoId) : null;

  // Criar objeto do lembrete
  const lembrete = {
    agendamentoId: agendamento.id,
    dataAgendamento: agendamento.data,
    horaAgendamento: agendamento.hora,
    tituloAgendamento: agendamento.titulo,
    dataEnvio: dataEnvioLembrete.toISOString(),
    emailDestinatario: cliente?.email || '',
    nomeCliente: cliente?.nome || 'Cliente',
    nomeServico: servico?.nome || 'Serviço',
    duracaoServico: agendamento.duracao || servico?.duracao || 60,
    descricaoAgendamento: agendamento.descricao || '',
    valorServico: agendamento.valor || servico?.valor || 0
  };

  // Adicionar lembrete ao localStorage
  return lembretesEmailApi.add(lembrete);
};

/**
 * Atualiza ou cria lembrete ao modificar um agendamento
 * @param {object} agendamento - Dados atualizados do agendamento
 */
export const atualizarLembreteAgendamento = (agendamento) => {
  // Remover lembretes antigos deste agendamento
  const lembretesExistentes = lembretesEmailApi.buscarPorAgendamento(agendamento.id);
  lembretesExistentes.forEach(lembrete => {
    if (!lembrete.enviado) {
      lembretesEmailApi.delete(lembrete.id);
    }
  });

  // Criar novo lembrete
  return criarLembreteParaAgendamento(agendamento);
};

/**
 * Remove lembretes associados a um agendamento excluído
 * @param {string} agendamentoId - ID do agendamento
 */
export const removerLembretesAgendamento = (agendamentoId) => {
  const lembretes = lembretesEmailApi.buscarPorAgendamento(agendamentoId);
  lembretes.forEach(lembrete => {
    lembretesEmailApi.delete(lembrete.id);
  });
};

/**
 * Busca lembretes que devem ser enviados agora
 * @returns {array} Lista de lembretes prontos para envio
 */
export const buscarLembretesParaEnvio = () => {
  const lembretesPendentes = lembretesEmailApi.buscarPendentes();
  const agora = new Date();

  return lembretesPendentes.filter(lembrete => {
    const dataEnvio = new Date(lembrete.dataEnvio);
    // Enviar se já passou a hora ou está dentro de 5 minutos
    return dataEnvio <= agora;
  });
};

/**
 * Gera o conteúdo HTML do e-mail de lembrete
 * @param {object} lembrete - Dados do lembrete
 * @returns {string} HTML do e-mail
 */
export const gerarConteudoEmail = (lembrete) => {
  const dataFormatada = formatarData(lembrete.dataAgendamento);
  const horaFormatada = lembrete.horaAgendamento;
  const linkAgendamento = `${window.location.origin}/agendamento?id=${lembrete.agendamentoId}`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lembrete de Agendamento</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .email-header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .email-body {
      padding: 30px 20px;
    }
    .alert-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-bottom: 25px;
      border-radius: 4px;
    }
    .alert-box strong {
      color: #856404;
      font-size: 18px;
    }
    .info-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .info-value {
      color: #333;
      text-align: right;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .description-box {
      background-color: #e7f3ff;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
      font-style: italic;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>🔔 Lembrete de Compromisso</h1>
      <p>Organize Agenda</p>
    </div>
    
    <div class="email-body">
      <div class="alert-box">
        <strong>⏰ Atenção!</strong><br>
        Você tem um compromisso agendado em 24 horas.
      </div>
      
      <p>Olá <strong>${lembrete.nomeCliente}</strong>,</p>
      
      <p>Este é um lembrete de que você tem o seguinte compromisso agendado:</p>
      
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">📋 Título:</span>
          <span class="info-value">${lembrete.tituloAgendamento}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📅 Data:</span>
          <span class="info-value">${dataFormatada}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⏰ Hora:</span>
          <span class="info-value">${horaFormatada}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🏷️ Tipo de Serviço:</span>
          <span class="info-value">${lembrete.nomeServico}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⏱️ Duração:</span>
          <span class="info-value">${lembrete.duracaoServico} minutos</span>
        </div>
        ${lembrete.valorServico > 0 ? `
        <div class="info-row">
          <span class="info-label">💰 Valor:</span>
          <span class="info-value">R$ ${lembrete.valorServico.toFixed(2)}</span>
        </div>
        ` : ''}
      </div>
      
      ${lembrete.descricaoAgendamento ? `
      <div class="description-box">
        <strong>📝 Observações:</strong><br>
        ${lembrete.descricaoAgendamento}
      </div>
      ` : ''}
      
      <center>
        <a href="${linkAgendamento}" class="btn-primary">
          Ver Detalhes do Agendamento
        </a>
      </center>
      
      <p style="margin-top: 25px; color: #666; font-size: 14px;">
        <strong>Dica:</strong> Recomendamos chegar com alguns minutos de antecedência 
        para garantir que tudo ocorra conforme planejado.
      </p>
    </div>
    
    <div class="email-footer">
      <p><strong>Organize Agenda</strong></p>
      <p>Sistema de Gerenciamento de Agendamentos</p>
      <p style="margin-top: 10px; font-size: 12px; color: #999;">
        Para desativar estes lembretes, acesse as configurações da sua conta.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Simula o envio de e-mail (em produção, chamaria uma API de backend)
 * @param {object} lembrete - Dados do lembrete
 * @returns {Promise<boolean>} true se enviado com sucesso
 */
export const enviarEmailLembrete = async (lembrete) => {
  try {
    // Em um ambiente de produção, aqui seria feita a chamada para a API do backend
    // que enviaria o e-mail através de um serviço como SendGrid, AWS SES, etc.
    
    console.log('📧 Simulando envio de e-mail...');
    console.log('Para:', lembrete.emailDestinatario);
    console.log('Assunto: Lembrete: ' + lembrete.tituloAgendamento);
    console.log('Conteúdo:', gerarConteudoEmail(lembrete));
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Marcar lembrete como enviado
    lembretesEmailApi.marcarComoEnviado(lembrete.id);
    
    console.log('✅ E-mail enviado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return false;
  }
};

/**
 * Processa todos os lembretes pendentes para envio
 * @returns {Promise<object>} Resultado do processamento
 */
export const processarLembretesPendentes = async () => {
  const lembretesParaEnvio = buscarLembretesParaEnvio();
  
  const resultados = {
    total: lembretesParaEnvio.length,
    enviados: 0,
    falhas: 0,
    detalhes: []
  };

  for (const lembrete of lembretesParaEnvio) {
    try {
      // Verificar se o e-mail do destinatário é válido
      if (!lembrete.emailDestinatario || !lembrete.emailDestinatario.includes('@')) {
        console.warn('⚠️ E-mail inválido para lembrete:', lembrete.id);
        resultados.falhas++;
        resultados.detalhes.push({
          lembreteId: lembrete.id,
          sucesso: false,
          erro: 'E-mail do destinatário inválido'
        });
        continue;
      }

      const sucesso = await enviarEmailLembrete(lembrete);
      
      if (sucesso) {
        resultados.enviados++;
        resultados.detalhes.push({
          lembreteId: lembrete.id,
          sucesso: true,
          emailDestinatario: lembrete.emailDestinatario
        });
      } else {
        resultados.falhas++;
        resultados.detalhes.push({
          lembreteId: lembrete.id,
          sucesso: false,
          erro: 'Falha no envio'
        });
      }
    } catch (error) {
      console.error('Erro ao processar lembrete:', error);
      resultados.falhas++;
      resultados.detalhes.push({
        lembreteId: lembrete.id,
        sucesso: false,
        erro: error.message
      });
    }
  }

  return resultados;
};

/**
 * Formata data para exibição
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {string} Data formatada
 */
const formatarData = (data) => {
  const [ano, mes, dia] = data.split('-');
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${dia} de ${meses[parseInt(mes) - 1]} de ${ano}`;
};

/**
 * Inicializa o sistema de lembretes (limpa lembretes antigos)
 */
export const inicializarSistemaLembretes = () => {
  lembretesEmailApi.limparAntigos();
  console.log('✅ Sistema de lembretes inicializado');
};
