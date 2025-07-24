import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./recuperacaoSenha.css";

function RecuperacaoSenha() {
  const [email, setEmail] = useState("");
  const [naoSouRobo, setNaoSouRobo] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const navigate = useNavigate();

  const enviarSolicitacao = (event) => {
    event.preventDefault();
    
    if (!email) {
      setMensagem("Por favor, informe seu e-mail.");
      setTipoMensagem("erro");
      return;
    }
    
    if (!naoSouRobo) {
      setMensagem("Por favor, confirme que você não é um robô.");
      setTipoMensagem("erro");
      return;
    }

    setMensagem("E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.");
    setTipoMensagem("sucesso");
    
    setEmail("");
    setNaoSouRobo(false);
    
    setTimeout(() => {
      navigate("/login");
    }, 5000);
  };

  return (
    <div className="recuperacao-container">
      <h2>Recuperação de Senha</h2>
      <p className="instrucao">
        Informe seu e-mail para receber as instruções de recuperação de senha.
      </p>
      
      <form className="formulario" onSubmit={enviarSolicitacao}>
        <div className="campo-form">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="Digite seu email cadastrado"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        
        <div className="campo-checkbox">
          <label>
            <input
              type="checkbox"
              checked={naoSouRobo}
              onChange={() => setNaoSouRobo(!naoSouRobo)}
            />
            Não sou um robô
          </label>
        </div>
        
        {mensagem && (
          <div className={`mensagem ${tipoMensagem}`}>
            {mensagem}
          </div>
        )}
        
        <div className="formulario-botoes">
          <button type="submit" className="btn-primario">
            Enviar Instruções
          </button>
          <button
            type="button"
            className="btn-secundario"
            onClick={() => navigate("/login")}
          >
            Voltar para Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecuperacaoSenha;