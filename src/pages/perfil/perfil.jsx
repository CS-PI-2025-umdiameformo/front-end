
import React, { useState } from 'react';
import './perfil.css';
import Configuracoes from './configuracoes';
import Seguranca from './seguranca';

const Perfil = () => {
  const [abaAtiva, setAbaAtiva] = useState('configuracoes');

  return (
    <div className="perfil-container">
      <h2>Painel do Perfil</h2>
      <div className="perfil-abas">
        <button
          className={abaAtiva === 'configuracoes' ? 'aba ativa' : 'aba'}
          onClick={() => setAbaAtiva('configuracoes')}
        >
          Configurações
        </button>
        <button
          className={abaAtiva === 'seguranca' ? 'aba ativa' : 'aba'}
          onClick={() => setAbaAtiva('seguranca')}
        >
          Segurança
        </button>
      </div>
      <div className="perfil-conteudo-aba">
        {abaAtiva === 'configuracoes' && <Configuracoes />}
        {abaAtiva === 'seguranca' && <Seguranca />}
      </div>
    </div>
  );
};

export default Perfil;
