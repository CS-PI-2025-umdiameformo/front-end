import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { InputText } from 'primereact/inputtext';
import "./esqueceuSenha.css";


function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); 

 

  return (
    <div className="card flex justify-content-center">
      <form className="formulario">
        <InputText value={email} onChange={(e) => setEmail(e.target.value)} />
      </form>
    </div>
    
  );
}

export default EsqueceuSenha;
