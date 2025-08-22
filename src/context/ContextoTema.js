import React, { createContext, useState, useEffect } from 'react';

export const ContextoTema = createContext();

export const ProvedorTema = ({ children }) => {
  const [tema, setTema] = useState(() => {
    const temaSalvo = localStorage.getItem('theme');
    return temaSalvo || 'light';
  });

  useEffect(() => {
    const body = document.body;
    
    body.classList.remove('light-theme', 'dark-theme');
    
    body.classList.add(`${tema}-theme`);
    
    localStorage.setItem('theme', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema(prevTema => prevTema === 'light' ? 'dark' : 'light');
  };

  return (
    <ContextoTema.Provider value={{ theme: tema, toggleTheme: alternarTema }}>
      {children}
    </ContextoTema.Provider>
  );
};
