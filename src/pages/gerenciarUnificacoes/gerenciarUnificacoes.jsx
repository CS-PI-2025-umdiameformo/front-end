import React, { useState, useEffect, useRef } from 'react';
import { clientesApi, servicosApi, unificacoesApi } from '../../utils/localStorageApi';
import { gerarSugestoesUnificacao } from '../../utils/similaridadeUtils';
import CardSugestaoUnificacao from '../../components/unificacao/CardSugestaoUnificacao';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import './gerenciarUnificacoes.css';

const GerenciarUnificacoes = () => {
  const toast = useRef(null);
  const [tipoSelecionado, setTipoSelecionado] = useState('clientes'); // clientes ou servicos
  const [sugestoes, setSugestoes] = useState([]);
  const [limiarSimilaridade, setLimiarSimilaridade] = useState(75);
  const [carregando, setCarregando] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [sugestaoParaAprovar, setSugestaoParaAprovar] = useState(null);

  useEffect(() => {
    gerarSugestoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoSelecionado, limiarSimilaridade]);

  const gerarSugestoes = () => {
    setCarregando(true);
    
    setTimeout(() => {
      let lista, campo;
      
      if (tipoSelecionado === 'clientes') {
        lista = clientesApi.getAll();
        campo = 'nome';
      } else {
        lista = servicosApi.getAll();
        campo = 'nome';
      }
      
      const sugestoesGeradas = gerarSugestoesUnificacao(lista, campo, limiarSimilaridade);
      setSugestoes(sugestoesGeradas);
      setCarregando(false);
      
      if (sugestoesGeradas.length === 0) {
        toast.current.show({
          severity: 'info',
          summary: 'Nenhuma Sugestão',
          detail: 'Não foram encontradas entradas similares com o limiar atual',
          life: 3000
        });
      }
    }, 500);
  };

  const confirmarAprovacao = (sugestao) => {
    setSugestaoParaAprovar(sugestao);
    setConfirmDialogVisible(true);
  };

  const aprovarUnificacao = () => {
    if (!sugestaoParaAprovar) return;
    
    try {
      let resultado;
      
      if (tipoSelecionado === 'clientes') {
        resultado = unificacoesApi.unificarClientes(
          sugestaoParaAprovar.itemPrincipal,
          sugestaoParaAprovar.itensSimilares
        );
      } else {
        resultado = unificacoesApi.unificarServicos(
          sugestaoParaAprovar.itemPrincipal,
          sugestaoParaAprovar.itensSimilares
        );
      }
      
      if (resultado.sucesso) {
        toast.current.show({
          severity: 'success',
          summary: 'Unificação Realizada',
          detail: `${resultado.clientesRemovidos || resultado.servicosRemovidos} item(ns) unificado(s). ${resultado.agendamentosAtualizados} agendamento(s) atualizado(s).`,
          life: 5000
        });
        
        // Remover sugestão da lista
        setSugestoes(prev => prev.filter(s => s.id !== sugestaoParaAprovar.id));
      }
    } catch (error) {
      console.error('Erro ao unificar:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível realizar a unificação',
        life: 3000
      });
    }
    
    setConfirmDialogVisible(false);
    setSugestaoParaAprovar(null);
  };

  const rejeitarSugestao = (sugestao) => {
    setSugestoes(prev => prev.filter(s => s.id !== sugestao.id));
    
    toast.current.show({
      severity: 'info',
      summary: 'Sugestão Rejeitada',
      detail: 'A sugestão foi removida da lista',
      life: 2000
    });
  };

  const filtrarPorConfianca = (nivel) => {
    setCarregando(true);
    
    setTimeout(() => {
      let lista, campo;
      
      if (tipoSelecionado === 'clientes') {
        lista = clientesApi.getAll();
        campo = 'nome';
      } else {
        lista = servicosApi.getAll();
        campo = 'nome';
      }
      
      const todasSugestoes = gerarSugestoesUnificacao(lista, campo, 60);
      const sugestoesFiltradas = todasSugestoes.filter(s => s.nivelConfianca === nivel);
      
      setSugestoes(sugestoesFiltradas);
      setCarregando(false);
    }, 300);
  };

  return (
    <div className="gerenciar-unificacoes-container">
      <Toast ref={toast} position="bottom-right" />
      
      <div className="unificacoes-header">
        <h2>🔄 Gerenciar Unificações</h2>
        <p className="subtitulo">
          Identifique e unifique entradas duplicadas ou similares no sistema
        </p>
        <button
          className="btn-historico-header"
          onClick={() => window.location.href = '/historico-unificacoes'}
        >
          📜 Ver Histórico de Unificações
        </button>
      </div>

      <div className="unificacoes-controles">
        <div className="controle-grupo">
          <label>Tipo de Dados:</label>
          <div className="btn-group">
            <button
              className={`btn-tipo ${tipoSelecionado === 'clientes' ? 'ativo' : ''}`}
              onClick={() => setTipoSelecionado('clientes')}
            >
              👥 Clientes
            </button>
            <button
              className={`btn-tipo ${tipoSelecionado === 'servicos' ? 'ativo' : ''}`}
              onClick={() => setTipoSelecionado('servicos')}
            >
              🏷️ Serviços
            </button>
          </div>
        </div>

        <div className="controle-grupo">
          <label>Limiar de Similaridade: {limiarSimilaridade}%</label>
          <input
            type="range"
            min="60"
            max="95"
            step="5"
            value={limiarSimilaridade}
            onChange={(e) => setLimiarSimilaridade(Number(e.target.value))}
            className="slider-similaridade"
          />
          <div className="slider-labels">
            <span>60% (Mais Sugestões)</span>
            <span>95% (Apenas Exatas)</span>
          </div>
        </div>

        <div className="controle-grupo">
          <label>Filtrar por Confiança:</label>
          <div className="btn-group">
            <button
              className="btn-filtro btn-alta"
              onClick={() => filtrarPorConfianca('alta')}
            >
              ✓ Alta
            </button>
            <button
              className="btn-filtro btn-media"
              onClick={() => filtrarPorConfianca('media')}
            >
              ⚠ Média
            </button>
            <button
              className="btn-filtro btn-baixa"
              onClick={() => filtrarPorConfianca('baixa')}
            >
              ! Baixa
            </button>
            <button
              className="btn-filtro btn-todos"
              onClick={() => gerarSugestoes()}
            >
              Todas
            </button>
          </div>
        </div>

        <button
          className="btn-atualizar"
          onClick={() => gerarSugestoes()}
          disabled={carregando}
        >
          {carregando ? '🔄 Carregando...' : '🔄 Atualizar Sugestões'}
        </button>
      </div>

      <div className="unificacoes-estatisticas">
        <div className="estat-card">
          <span className="estat-numero">{sugestoes.length}</span>
          <span className="estat-label">Sugestões Encontradas</span>
        </div>
        <div className="estat-card">
          <span className="estat-numero">
            {sugestoes.filter(s => s.nivelConfianca === 'alta').length}
          </span>
          <span className="estat-label">Alta Confiança</span>
        </div>
        <div className="estat-card">
          <span className="estat-numero">
            {sugestoes.filter(s => s.nivelConfianca === 'media').length}
          </span>
          <span className="estat-label">Média Confiança</span>
        </div>
        <div className="estat-card">
          <span className="estat-numero">
            {sugestoes.filter(s => s.nivelConfianca === 'baixa').length}
          </span>
          <span className="estat-label">Baixa Confiança</span>
        </div>
      </div>

      <div className="unificacoes-lista">
        {carregando ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analisando entradas similares...</p>
          </div>
        ) : sugestoes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✓</span>
            <h3>Nenhuma Duplicata Encontrada</h3>
            <p>Não foram encontradas entradas similares com o limiar atual de {limiarSimilaridade}%</p>
            <p className="dica">💡 Dica: Reduza o limiar de similaridade para ver mais sugestões</p>
          </div>
        ) : (
          sugestoes.map(sugestao => (
            <CardSugestaoUnificacao
              key={sugestao.id}
              sugestao={sugestao}
              onAprovar={confirmarAprovacao}
              onRejeitar={rejeitarSugestao}
            />
          ))
        )}
      </div>

      <Dialog
        header="Confirmar Unificação"
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
              onClick={aprovarUnificacao}
            >
              ✓ Confirmar Unificação
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
            Você está prestes a unificar{' '}
            <strong>{sugestaoParaAprovar?.itensSimilares.length} item(ns)</strong>{' '}
            em um único registro.
          </p>
          <p>
            Todos os agendamentos relacionados serão atualizados automaticamente.
          </p>
          <p className="confirmacao-texto">
            Deseja continuar?
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default GerenciarUnificacoes;
