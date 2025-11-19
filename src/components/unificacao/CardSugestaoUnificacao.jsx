import React from 'react';
import { formatarNivelConfianca } from '../../utils/similaridadeUtils';
import './CardSugestaoUnificacao.css';

const CardSugestaoUnificacao = ({ sugestao, onAprovar, onRejeitar }) => {
  const { itemPrincipal, itensSimilares, metricas, campo, nivelConfianca } = sugestao;
  const formato = formatarNivelConfianca(nivelConfianca);
  
  // Calcula pontuação média uma vez
  const pontuacaoMedia = metricas.length > 0
    ? Math.round((metricas.reduce((acc, m) => acc + m.pontuacao, 0) / metricas.length) * 10) / 10
    : 0;

  return (
    <div className="card-sugestao">
      <div className="card-header">
        <div className="nivel-confianca" style={{
          backgroundColor: formato.corFundo,
          color: formato.cor
        }}>
          <span className="icone-confianca">{formato.icone}</span>
          <span>{formato.texto}</span>
          <span className="pontuacao">{pontuacaoMedia}%</span>
        </div>
      </div>

      <div className="card-body">
        <div className="item-principal">
          <div className="label-item">
            <span className="icone">👑</span>
            <strong>Item Principal (será mantido)</strong>
          </div>
          <div className="conteudo-item destaque">
            {itemPrincipal[campo] || itemPrincipal.nome}
          </div>
          {itemPrincipal.email && (
            <div className="info-adicional">
              <span>📧 {itemPrincipal.email}</span>
            </div>
          )}
          {itemPrincipal.telefone && (
            <div className="info-adicional">
              <span>📞 {itemPrincipal.telefone}</span>
            </div>
          )}
        </div>

        <div className="seta-unificacao">
          ↓ Unificar com ↓
        </div>

        <div className="itens-similares">
          {itensSimilares.map((item, index) => (
            <div key={item.id} className="item-similar">
              <div className="label-item">
                <span className="icone">📄</span>
                <span>Item Similar {index + 1}</span>
                <span className="badge-pontuacao" style={{
                  backgroundColor: formato.corFundo,
                  color: formato.cor
                }}>
                  {Math.round(metricas[index].pontuacao)}%
                </span>
              </div>
              <div className="conteudo-item">
                {item[campo] || item.nome}
              </div>
              {item.email && (
                <div className="info-adicional">
                  <span>📧 {item.email}</span>
                </div>
              )}
              {item.telefone && (
                <div className="info-adicional">
                  <span>📞 {item.telefone}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card-footer">
        <button 
          className="btn-rejeitar"
          onClick={() => onRejeitar(sugestao)}
        >
          ✕ Rejeitar
        </button>
        <button 
          className="btn-aprovar"
          onClick={() => onAprovar(sugestao)}
        >
          ✓ Aprovar Unificação
        </button>
      </div>
    </div>
  );
};

export default CardSugestaoUnificacao;
