import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './GerenciadorTipoServico.css';

const GerenciadorTipoServico = ({ onSelectServiceType, selectedTypeId }) => {
  const [tiposServico, setTiposServico] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoTipoServico, setNovoTipoServico] = useState({
    nome: '',
    cor: '#4078c0',
    duracao: 60,
    preco: '',
    observacoes: ''
  });

  const tiposServicoPadrao = [
    {
      id: 'consulta',
      nome: 'Consulta',
      cor: '#007ad9',
      duracao: 60,
      preco: '150,00',
      observacoes: 'Atendimento regular'
    },
    {
      id: 'exame',
      nome: 'Exame',
      cor: '#34A835',
      duracao: 45,
      preco: '200,00',
      observacoes: 'Exames de rotina'
    },
    {
      id: 'retorno',
      nome: 'Retorno',
      cor: '#FFC107',
      duracao: 30,
      preco: '100,00',
      observacoes: 'Consulta de retorno'
    },
    {
      id: 'procedimento',
      nome: 'Procedimento',
      cor: '#FF5722',
      duracao: 90,
      preco: '300,00',
      observacoes: 'Procedimentos diversos'
    },
    {
      id: 'outro',
      nome: 'Outro',
      cor: '#673AB7',
      duracao: 60,
      preco: '150,00',
      observacoes: 'Outros tipos de atendimento'
    }
  ];

  useEffect(() => {
    const tiposSalvos = localStorage.getItem('serviceTypes');
    if (tiposSalvos) {
      setTiposServico(JSON.parse(tiposSalvos));
    } else {
      setTiposServico(tiposServicoPadrao);
      localStorage.setItem('serviceTypes', JSON.stringify(tiposServicoPadrao));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('serviceTypes', JSON.stringify(tiposServico));
  }, [tiposServico]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoTipoServico(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dadosTipo = {
      ...novoTipoServico,
      id: uuidv4()
    };

    setTiposServico(prev => [...prev, dadosTipo]);
    setNovoTipoServico({
      nome: '',
      cor: '#4078c0',
      duracao: 60,
      preco: '',
      observacoes: ''
    });
    setModalAberto(false);
  };

  const handleSelecionarTipoServico = (tipoId) => {
    onSelectServiceType(tipoId);
  };

  return (
    <div className="gerenciador-tipo-servico">
      <div className="cabecalho-tipo-servico">
        <h3>Tipos de Serviço</h3>
        <button 
          className="botao-adicionar-servico"
          onClick={() => setModalAberto(true)}
        >
          Novo
        </button>
      </div>

      <div className="lista-tipos-servico">
        {tiposServico.map(tipo => (
          <div 
            key={tipo.id} 
            className={`item-tipo-servico ${selectedTypeId === tipo.id ? 'selecionado' : ''}`}
            onClick={() => handleSelecionarTipoServico(tipo.id)}
          >
            <div 
              className="cor-tipo-servico" 
              style={{ backgroundColor: tipo.cor }}
            ></div>
            <div className="info-tipo-servico">
              <h4>{tipo.nome}</h4>
              <p>{tipo.duracao} min • R$ {tipo.preco}</p>
            </div>
          </div>
        ))}
      </div>

      {modalAberto && (
        <div className="sobreposicao-modal">
          <div className="modal-tipo-servico">
            <div className="cabecalho-modal">
              <h3>Novo Tipo de Serviço</h3>
              <button className="botao-fechar" onClick={() => setModalAberto(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grupo-formulario">
                <label htmlFor="nome">Nome*</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={novoTipoServico.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="linha-formulario">
                <div className="grupo-formulario seletor-cor">
                  <label htmlFor="cor">Cor</label>
                  <input
                    type="color"
                    id="cor"
                    name="cor"
                    value={novoTipoServico.cor}
                    onChange={handleChange}
                  />
                </div>
                <div className="grupo-formulario">
                  <label htmlFor="duracao">Duração (min)*</label>
                  <input
                    type="number"
                    id="duracao"
                    name="duracao"
                    value={novoTipoServico.duracao}
                    onChange={handleChange}
                    min="15"
                    step="15"
                    required
                  />
                </div>
              </div>
              <div className="grupo-formulario">
                <label htmlFor="preco">Preço (R$)</label>
                <input
                  type="text"
                  id="preco"
                  name="preco"
                  value={novoTipoServico.preco}
                  onChange={handleChange}
                  placeholder="0,00"
                />
              </div>
              <div className="grupo-formulario">
                <label htmlFor="observacoes">Observações</label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={novoTipoServico.observacoes}
                  onChange={handleChange}
                  rows="2"
                />
              </div>
              <div className="botoes-formulario">
                <button type="submit" className="botao-salvar">Salvar</button>
                <button 
                  type="button" 
                  className="botao-cancelar" 
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciadorTipoServico;
