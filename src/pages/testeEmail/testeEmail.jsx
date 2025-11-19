import React, { useState, useEffect } from 'react';
import { agendamentosApi, clientesApi, servicosApi } from '../../utils/localStorageApi';
import { gerarConteudoEmail, enviarEmailLembrete, criarLembreteParaAgendamento } from '../../utils/lembretesEmailUtils';
import './testeEmail.css';

const TesteEmail = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [htmlEmail, setHtmlEmail] = useState('');
  const [modoVisualizacao, setModoVisualizacao] = useState('preview'); // preview ou codigo
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState(''); // sucesso, erro, info

  const carregarAgendamentos = () => {
    const todosAgendamentos = agendamentosApi.getAll();
    setAgendamentos(todosAgendamentos);
    
    if (todosAgendamentos.length > 0) {
      selecionarAgendamento(todosAgendamentos[0]);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selecionarAgendamento = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    
    // Buscar informações completas
    const cliente = agendamento.clienteId ? clientesApi.getById(agendamento.clienteId) : null;
    const servico = agendamento.tipoServicoId ? servicosApi.getById(agendamento.tipoServicoId) : null;
    
    // Criar objeto de lembrete para gerar o template
    const lembreteSimulado = {
      agendamentoId: agendamento.id,
      dataAgendamento: agendamento.data,
      horaAgendamento: agendamento.hora,
      tituloAgendamento: agendamento.titulo,
      emailDestinatario: cliente?.email || 'exemplo@email.com',
      nomeCliente: cliente?.nome || 'Cliente Exemplo',
      nomeServico: servico?.nome || 'Serviço',
      duracaoServico: agendamento.duracao || servico?.duracao || 60,
      descricaoAgendamento: agendamento.descricao || '',
      valorServico: agendamento.valor || servico?.valor || 0
    };
    
    const html = gerarConteudoEmail(lembreteSimulado);
    setHtmlEmail(html);
  };

  const simularEnvioEmail = () => {
    if (!agendamentoSelecionado) {
      mostrarMensagem('Selecione um agendamento primeiro!', 'erro');
      return;
    }

    // Criar lembrete e simular envio
    const lembrete = criarLembreteParaAgendamento(agendamentoSelecionado);
    
    if (!lembrete) {
      mostrarMensagem('Não foi possível criar o lembrete. Verifique se o agendamento está no futuro e se os lembretes estão ativados.', 'erro');
      return;
    }

    enviarEmailLembrete(lembrete).then(sucesso => {
      if (sucesso) {
        mostrarMensagem('E-mail de teste enviado com sucesso! Verifique o console do navegador.', 'sucesso');
      } else {
        mostrarMensagem('Erro ao enviar e-mail de teste.', 'erro');
      }
    });
  };

  const mostrarMensagem = (texto, tipo) => {
    setMensagem(texto);
    setTipoMensagem(tipo);
    
    setTimeout(() => {
      setMensagem('');
      setTipoMensagem('');
    }, 5000);
  };

  const copiarHtmlParaClipboard = () => {
    navigator.clipboard.writeText(htmlEmail).then(() => {
      mostrarMensagem('HTML copiado para a área de transferência!', 'sucesso');
    }).catch(() => {
      mostrarMensagem('Erro ao copiar HTML.', 'erro');
    });
  };

  const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="teste-email-container">
      <div className="teste-email-header">
        <h2>🧪 Teste de Templates de E-mail</h2>
        <p className="subtitulo">Visualize e teste os templates de lembretes por e-mail</p>
      </div>

      {mensagem && (
        <div className={`mensagem-alerta ${tipoMensagem}`}>
          {mensagem}
        </div>
      )}

      <div className="teste-email-conteudo">
        {/* Painel de Seleção */}
        <div className="painel-selecao">
          <div className="secao-card">
            <h3>Agendamento para Teste</h3>
            
            {agendamentos.length === 0 ? (
              <div className="aviso-vazio">
                <p>Nenhum agendamento disponível.</p>
                <p>Crie um agendamento primeiro.</p>
              </div>
            ) : (
              <div className="lista-agendamentos">
                {agendamentos.map(agendamento => {
                  const cliente = agendamento.clienteId ? clientesApi.getById(agendamento.clienteId) : null;
                  
                  return (
                    <div
                      key={agendamento.id}
                      className={`item-agendamento ${agendamentoSelecionado?.id === agendamento.id ? 'selecionado' : ''}`}
                      onClick={() => selecionarAgendamento(agendamento)}
                    >
                      <div className="agendamento-info">
                        <strong>{agendamento.titulo}</strong>
                        <div className="agendamento-detalhes">
                          <span>📅 {formatarData(agendamento.data)}</span>
                          <span>⏰ {agendamento.hora}</span>
                        </div>
                        {cliente && (
                          <div className="agendamento-cliente">
                            👤 {cliente.nome}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="secao-card secao-acoes">
            <h3>Ações</h3>
            
            <button
              className="btn-acao btn-primario"
              onClick={simularEnvioEmail}
              disabled={!agendamentoSelecionado}
            >
              📧 Simular Envio de E-mail
            </button>
            
            <button
              className="btn-acao btn-secundario"
              onClick={copiarHtmlParaClipboard}
              disabled={!htmlEmail}
            >
              📋 Copiar HTML
            </button>
            
            <button
              className="btn-acao btn-secundario"
              onClick={() => window.open('/perfil', '_blank')}
            >
              ⚙️ Configurações de Lembretes
            </button>
          </div>

          <div className="secao-card secao-info">
            <h4>ℹ️ Informações</h4>
            <ul className="lista-info">
              <li>Selecione um agendamento para visualizar o template</li>
              <li>O e-mail é simulado (não será enviado de verdade)</li>
              <li>Verifique o console do navegador para ver detalhes</li>
              <li>Você pode copiar o HTML para testes externos</li>
            </ul>
          </div>
        </div>

        {/* Painel de Visualização */}
        <div className="painel-visualizacao">
          <div className="controles-visualizacao">
            <div className="tabs">
              <button
                className={`tab ${modoVisualizacao === 'preview' ? 'ativo' : ''}`}
                onClick={() => setModoVisualizacao('preview')}
              >
                👁️ Visualização
              </button>
              <button
                className={`tab ${modoVisualizacao === 'codigo' ? 'ativo' : ''}`}
                onClick={() => setModoVisualizacao('codigo')}
              >
                📝 Código HTML
              </button>
            </div>
          </div>

          <div className="area-visualizacao">
            {!agendamentoSelecionado ? (
              <div className="placeholder">
                <p>Selecione um agendamento para visualizar o template do e-mail</p>
              </div>
            ) : (
              <>
                {modoVisualizacao === 'preview' ? (
                  <div className="email-preview">
                    <iframe
                      title="Preview do E-mail"
                      srcDoc={htmlEmail}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#f4f4f4'
                      }}
                    />
                  </div>
                ) : (
                  <div className="email-codigo">
                    <pre>
                      <code>{htmlEmail}</code>
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesteEmail;
