import React from "react";
import "./cadastroUsuario.css";

const CadastroUsuario = () => {
  return (
    <>
    <form>
        <input id="inNome" type="text" placeholder="Nome" className="inputCadastroUsuario" />
        <input id="inSobrenome" type="text" placeholder="Sobrenome" className="inputCadastroUsuario" />
        <input id="inEmail" type="text" placeholder="Email" className="inputCadastroUsuario" />
        <input id="inSenha" type="text" placeholder="Senha" className="inputCadastroUsuario" />
        <input id="inConfirmaSenha" type="text" placeholder="Confirmar Senha" className="inputCadastroUsuario" />
        <input id="inTelefone" type="text" placeholder="Telefone" className="inputCadastroUsuario" />

    </form>
    </>
  );
};
export default CadastroUsuario;
