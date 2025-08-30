import React, { useContext } from 'react';
import { ContextoTema } from '../../context/ContextoTema';
import './alternadorTema.css';

const AlternadorTema = () => {
  const { theme, toggleTheme } = useContext(ContextoTema);
  
  return (
    <div className="theme-toggle-container">
      <button 
        className={`theme-toggle-button ${theme === 'dark' ? 'dark-active' : 'light-active'}`}
        onClick={toggleTheme}
        aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      >
        {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
      </button>
    </div>
  );
};

export default AlternadorTema;
