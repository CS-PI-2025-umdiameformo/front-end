import React, { useState, useEffect, useRef } from 'react';
import { unificacoesApi } from '../../utils/localStorageApi';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import './historicoUnificacoes.css';

const HistoricoUnificacoes = () => {
  const toast = useRef(null);
  const [historico, setHistorico] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // todos, cliente, servico
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [unificacaoParaDesfazer, setUnificacaoParaDesfazer] = useState(null);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = () => {
    const hist = unificacoesApi.getHistorico();
    setHistorico(hist.reverse()); // Mais recentes primeiro
  };

  const filtrarHistorico = () => {
    const hist = unificacoesApi.getHistorico().reverse();
    
    if (filtroTipo === 'todos') {
      return hist;
    }
    
    return hist.filter(h => h.tipo === filtroTipo);
  };

  const confirmarDesfazer = (unificacao) => {
    setUnificacaoParaDesfazer(unificacao);
    setConfirmDialogVisible(true);
  };

  const desfazerUnificacao = () => {
    if (!unificacaoParaDesfazer) return;
    
    const resultado = unificacoesApi.desfazerUnificacao(unificacaoParaDesfazer.id);
    
    if (resultado.sucesso) {
      toast.current.show({
        severity: 'success',
        summary: 'Unificação Desfeita',
        detail: `${resultado.itensRestaurados} item(ns) restaurado(s)`,
        life: 3000
      });
      
      carregarHistorico();
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: resultado.erro || 'Não foi possível desfazer a unificação',
        life: 3000
      });
    }
    
    setConfirmDialogVisible(false);
    setUnificacaoParaDesfazer(null);
  };

  const formatarData = (isoString) => {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const historicoFiltrado = filtrarHistorico();

  return (
    <div className="historico-unificacoes-container">
      <Toast ref={toast} position="bottom-right" />
      
      <div className="historico-header">
        <h2>📜 Histórico de Unificações</h2>
        <p className="subtitulo">
          Visualize todas as unificações realizadas e desfaça quando necessário
        </p>
      </div>

      <div className="historico-controles">
        <div className="filtro-tipo">
          <label>Filtrar por Tipo:</label>
          <div className="btn-group">
            <button
              className={`btn-filtro ${filtroTipo === 'todos' ? 'ativo' : ''}`}
              onClick={() => setFiltroTipo('todos')}
            >
              Todos ({unificacoesApi.getHistorico().length})
            </button>
            <button
              className={`btn-filtro ${filtroTipo === 'cliente' ? 'ativo' : ''}`}
              onClick={() => setFiltroTipo('cliente')}
            >
              👥 Clientes ({unificacoesApi.getHistorico().filter(h => h.tipo === 'cliente').length})
            </button>
            <button
              className={`btn-filtro ${filtroTipo === 'servico' ? 'ativo' : ''}`}
              onClick={() => setFiltroTipo('servico')}
            >
              🏷️ Serviços ({unificacoesApi.getHistorico().filter(h => h.tipo === 'servico').length})
            </button>
          </div>
        </div>
      </div>

      <div className="historico-lista">
        {historicoFiltrado.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>Nenhuma Unificação Realizada</h3>
            <p>O histórico está vazio. Unificações realizadas aparecerão aqui.</p>
          </div>
        ) : (
          historicoFiltrado.map(unificacao => (
            <div
              key={unificacao.id}
              className={`card-historico ${unificacao.desfeita ? 'desfeita' : ''}`}
            >
              <div className="card-historico-header">
                <div className="tipo-badge">
                  {unificacao.tipo === 'cliente' ? '👥 Cliente' : '🏷️ Serviço'}
                </div>
                <div className="data-unificacao">
                  🕒 {formatarData(unificacao.dataUnificacao)}
                </div>
                {unificacao.desfeita && (
                  <div className="badge-desfeita">
                    Desfeita em {formatarData(unificacao.dataDesfazimento)}
                  </div>
                )}
              </div>

              <div className="card-historico-body">
                <div className="unificacao-info">
                  <div className="item-mantido">
                    <strong>✓ Item Mantido:</strong>
                    <span className="item-nome">
                      {unificacao.itemPrincipal.nome}
                    </span>
                  </div>

                  <div className="itens-removidos">
                    <strong>🗑️ Itens Unificados ({unificacao.itensRemovidos.length}):</strong>
                    <ul>
                      {unificacao.itensRemovidos.map((item, index) => (
                        <li key={index}>{item.nome}</li>
                      ))}
                    </ul>
                  </div>

                  {unificacao.agendamentosAfetados > 0 && (
                    <div className="agendamentos-afetados">
                      📅 <strong>{unificacao.agendamentosAfetados}</strong> agendamento(s) atualizado(s)
                    </div>
                  )}
                </div>
              </div>

              {!unificacao.desfeita && (
                <div className="card-historico-footer">
                  <button
                    className="btn-desfazer"
                    onClick={() => confirmarDesfazer(unificacao)}
                  >
                    ↩️ Desfazer Unificação
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Dialog
        header="Confirmar Desfazer"
        visible={confirmDialogVisible}
        style={{ width: '500px' }}
        modal
        onHide={() => setConfirmDialogVisible(false)}
        footer={
          <div className="dialog-footer">
            <button
              className="btn-dialog btn-cancelar"
              onClick={() => setConfirmDialogVisible(false)}
            >
              Cancelar
            </button>
            <button
              className="btn-dialog btn-confirmar"
              onClick={desfazerUnificacao}
            >
              ✓ Confirmar
            </button>
          </div>
        }
      >
        <div className="dialog-content">
          <div className="aviso-importante">
            <span className="icone-aviso">⚠️</span>
            <strong>Atenção!</strong>
          </div>
          <p>
            Você está prestes a desfazer esta unificação. Os{' '}
            <strong>{unificacaoParaDesfazer?.itensRemovidos.length} item(ns)</strong>{' '}
            removidos serão restaurados.
          </p>
          <p className="obs-texto">
            <strong>Obs:</strong> Os agendamentos não serão revertidos automaticamente.
          </p>
          <p className="confirmacao-texto">
            Deseja continuar?
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default HistoricoUnificacoes;
