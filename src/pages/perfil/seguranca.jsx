

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocalStorageUDMF from '../../utils/LocalStorageUDMF';
import '../perfil/perfil.css';

const Seguranca = () => {

  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [processando, setProcessando] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setProcessando(true);
    setTimeout(() => {
      const storage = new LocalStorageUDMF();
      storage.clear();
      setProcessando(false);
      setShowModal(false);
      alert('Conta excluída com sucesso!');
      navigate('/');
    }, 1500);
  };

  return (
    <div className="aba-seguranca">
      <h3>Segurança</h3>
      <button
        className="btn-excluir-conta"
        onClick={() => setShowModal(true)}
      >
        Excluir Conta
      </button>

      {showModal && (
        <div className="modal-excluir-overlay">
          <div className="modal-excluir">
            {processando ? (
              <div className="processando-exclusao">
                <p>Processando exclusão...</p>
              </div>
            ) : (
              <>
                <h4>Tem certeza que deseja excluir sua conta?</h4>
                <p>Esta ação é <b>irreversível</b>. Digite <b>EXCLUIR</b> para confirmar.</p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="Digite EXCLUIR"
                  autoFocus
                />
                <div className="modal-botoes">
                  <button
                    className="btn-cancelar"
                    onClick={() => {
                      setShowModal(false);
                      setConfirmText("");
                    }}
                    disabled={processando}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-confirmar-excluir"
                    disabled={confirmText !== "EXCLUIR" || processando}
                    onClick={handleDelete}
                  >
                    Confirmar Exclusão
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Seguranca;
