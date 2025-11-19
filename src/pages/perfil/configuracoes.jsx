import React, { useState, useEffect } from 'react';
import { preferencesApi } from '../../utils/localStorageApi';
import '../perfil/perfil.css';

const Configuracoes = () => {
  const [lembretesEmailAtivos, setLembretesEmailAtivos] = useState(true);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    // Carregar preferências ao montar o componente
    const preferencias = preferencesApi.getAll();
    setLembretesEmailAtivos(preferencias.lembretesEmailAtivos !== false);
  }, []);

  const handleToggleLembretesEmail = () => {
    const novoValor = !lembretesEmailAtivos;
    setLembretesEmailAtivos(novoValor);
    
    // Salvar preferência
    preferencesApi.set('lembretesEmailAtivos', novoValor);
    
    // Mostrar mensagem de sucesso
    setMensagemSucesso(
      novoValor 
        ? 'Lembretes por e-mail ativados com sucesso!' 
        : 'Lembretes por e-mail desativados com sucesso!'
    );
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => {
      setMensagemSucesso('');
    }, 3000);
  };

  return (
    <div className="aba-configuracoes">
      <h3>Configurações de Notificações</h3>
      
      {mensagemSucesso && (
        <div className="mensagem-sucesso" style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '6px',
          border: '1px solid #c3e6cb'
        }}>
          {mensagemSucesso}
        </div>
      )}
      
      <div className="configuracao-item" style={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1em', color: '#333' }}>
              Lembretes por E-mail
            </h4>
            <p style={{ margin: 0, fontSize: '0.9em', color: '#666', lineHeight: '1.5' }}>
              Receba um e-mail de lembrete 24 horas antes de cada compromisso agendado.
              O e-mail incluirá todos os detalhes do agendamento e um link direto para visualizá-lo.
            </p>
          </div>
          
          <div style={{ marginLeft: '20px' }}>
            <label className="switch" style={{
              position: 'relative',
              display: 'inline-block',
              width: '60px',
              height: '34px'
            }}>
              <input
                type="checkbox"
                checked={lembretesEmailAtivos}
                onChange={handleToggleLembretesEmail}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: lembretesEmailAtivos ? '#4CAF50' : '#ccc',
                transition: '0.4s',
                borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '26px',
                  width: '26px',
                  left: lembretesEmailAtivos ? '30px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%'
                }} />
              </span>
            </label>
          </div>
        </div>
        
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '0.85em',
          color: '#555'
        }}>
          <strong>Status atual:</strong> {lembretesEmailAtivos ? 'Ativado ✓' : 'Desativado'}
        </div>
      </div>
      
      <div style={{
        padding: '16px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
        fontSize: '0.9em',
        color: '#856404'
      }}>
        <strong>ℹ️ Importante:</strong> Os lembretes serão enviados automaticamente para o e-mail 
        associado ao seu agendamento. Certifique-se de que seu e-mail está atualizado.
      </div>
    </div>
  );
};

export default Configuracoes;
