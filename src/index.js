import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Importação dos estilos do PrimeReact
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // tema padrão
import 'primereact/resources/primereact.min.css'; // componentes base
import 'primeicons/primeicons.css'; // ícones
import 'primeflex/primeflex.css'; // sistema de grid
// Nota: Não é necessário importar datatable-fixes.css, os estilos necessários já estão incluídos acima


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
