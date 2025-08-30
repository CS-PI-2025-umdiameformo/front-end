import React, { useState, useEffect } from "react";
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { FileUpload } from 'primereact/fileupload';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import { Link } from 'react-router-dom';
import './home.css';

import { 
  inicializarDadosTeste,
  restaurarDadosTeste,
  limparTodosDados,
  exportarDados,
  importarDados
} from "../../utils/testDataManager";

import {
  clientesApi,
  servicosApi,
  agendamentosApi
} from "../../utils/localStorageApi";

const Home = () => {
  const [message, setMessage] = useState({ severity: '', text: '', visible: false });
  const [importLoading, setImportLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    clientes: 0,
    servicos: 0,
    agendamentos: 0
  });

  // Carregar estatísticas ao montar o componente
  useEffect(() => {
    atualizarEstatisticas();
  }, []);

  const handleReinicializarDados = () => {
    inicializarDadosTeste(true); // Force reinitialization
    atualizarEstatisticas();
    mostrarMensagem('success', 'Dados de teste reinicializados com sucesso!');
  };

  const handleRestaurarDados = () => {
    restaurarDadosTeste();
    atualizarEstatisticas();
    mostrarMensagem('success', 'Dados restaurados para o estado original!');
  };

  const handleLimparDados = () => {
    if (limparTodosDados()) {
      atualizarEstatisticas();
      mostrarMensagem('info', 'Todos os dados foram removidos.');
    }
  };

  const handleExportarDados = () => {
    exportarDados();
    mostrarMensagem('success', 'Dados exportados com sucesso! Verifique o download.');
  };

  const handleImportarDados = async (event) => {
    try {
      setImportLoading(true);
      const file = event.files[0];
      await importarDados(file);
      atualizarEstatisticas();
      mostrarMensagem('success', 'Dados importados com sucesso!');
    } catch (error) {
      mostrarMensagem('error', `Erro ao importar dados: ${error.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  const atualizarEstatisticas = () => {
    setStatistics({
      clientes: clientesApi.getAll().length,
      servicos: servicosApi.getAll().length,
      agendamentos: agendamentosApi.getAll().length
    });
  };

  const mostrarMensagem = (severity, text) => {
    setMessage({ severity, text, visible: true });
    setTimeout(() => {
      setMessage({ ...message, visible: false });
    }, 5000);
  };

  return (
    <div className="home-container p-4">
      <div className="welcome-section mb-4">
        <h1><i className="pi pi-calendar-plus mr-2"></i>Organize Agenda</h1>
        <p className="welcome-subtitle">Sistema de Gerenciamento de Agendamentos</p>
      </div>

      <div className="grid">
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <Card title={<span><i className="pi pi-bolt mr-2"></i>Acesso Rápido</span>} className="h-full feature-card">
            <div className="flex flex-column gap-2">
              <Link to="/agendamento">
                <Button label="Agendamentos" icon="pi pi-calendar" className="p-button-primary w-full action-button" />
              </Link>
              <Link to="/clientes">
                <Button label="Clientes" icon="pi pi-users" className="p-button-secondary w-full action-button" />
              </Link>
              <Link to="/servicos">
                <Button label="Serviços" icon="pi pi-list" className="p-button-help w-full action-button" />
              </Link>
            </div>
          </Card>
          
          
        </div>

        <div className="col-12 md:col-6 lg:col-8 mb-3">
          <Card title={<span><i className="pi pi-chart-bar mr-2"></i>Estatísticas do Sistema</span>} className="h-full feature-card">
            <div className="grid">
              <div className="col-12 md:col-4">
                <div className="stats-card">
                  <div className="stats-icon">
                    <i className="pi pi-users"></i>
                  </div>
                  <h3>{statistics.clientes}</h3>
                  <p>Clientes Cadastrados</p>
                  <ProgressBar value={(statistics.clientes / 20) * 100} showValue={false} className="custom-progress" />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="stats-card">
                  <div className="stats-icon">
                    <i className="pi pi-list"></i>
                  </div>
                  <h3>{statistics.servicos}</h3>
                  <p>Tipos de Serviço</p>
                  <ProgressBar value={(statistics.servicos / 10) * 100} showValue={false} className="custom-progress" />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="stats-card">
                  <div className="stats-icon">
                    <i className="pi pi-calendar"></i>
                  </div>
                  <h3>{statistics.agendamentos}</h3>
                  <p>Agendamentos</p>
                  <ProgressBar value={(statistics.agendamentos / 30) * 100} showValue={false} className="custom-progress" />
                </div>
              </div>
            </div>
            
            <div className="dashboard-info p-3 mt-3">
              <h4><i className="pi pi-info-circle mr-2"></i>Dashboard</h4>
              <p>Bem-vindo ao seu painel de controle. Aqui você pode monitorar todas as suas estatísticas e acessar rapidamente as principais funcionalidades do sistema.</p>
            </div>
          </Card>
        </div>

        <div className="col-12">
          <Panel 
            header={<span><i className="pi pi-database mr-2"></i>Gerenciamento de Dados de Teste</span>} 
            toggleable 
            className="custom-panel">
            {message.visible && (
              <Message severity={message.severity} text={message.text} className="mb-3" />
            )}
            
            <div className="panel-intro mb-3">
              <p>
                <i className="pi pi-info-circle mr-2"></i>
                Utilize estas ferramentas para gerenciar os dados da aplicação durante os testes.
                Você pode reinicializar com dados de exemplo, fazer backups ou limpar completamente o sistema.
              </p>
            </div>
            
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="data-management-section">
                  <h3><i className="pi pi-cog mr-2"></i>Operações de Dados</h3>
                  <div className="flex flex-column gap-3">
                    <Button 
                      label="Reinicializar Dados de Teste" 
                      icon="pi pi-refresh" 
                      className="p-button-warning action-button"
                      onClick={handleReinicializarDados} 
                    />
                    <Button 
                      label="Restaurar Estado Original" 
                      icon="pi pi-undo" 
                      className="p-button-info action-button"
                      onClick={handleRestaurarDados} 
                    />
                    <Button 
                      label="Limpar Todos os Dados" 
                      icon="pi pi-trash" 
                      className="p-button-danger action-button"
                      onClick={handleLimparDados} 
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div className="data-management-section">
                  <h3><i className="pi pi-sync mr-2"></i>Exportar/Importar Dados</h3>
                  <Button 
                    label="Exportar Dados" 
                    icon="pi pi-download" 
                    className="p-button-success mb-3 w-full action-button"
                    onClick={handleExportarDados} 
                  />
                  
                  <div className="import-container">
                    <FileUpload
                      name="arquivo" 
                      accept=".json" 
                      maxFileSize={1000000}
                      customUpload={true}
                      uploadHandler={handleImportarDados}
                      auto
                      chooseLabel="Selecionar Arquivo JSON"
                      uploadLabel="Importar"
                      cancelLabel="Cancelar"
                      className="custom-upload"
                      emptyTemplate={
                        <div className="empty-template">
                          <i className="pi pi-cloud-upload" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                          <p>Arraste e solte um arquivo JSON para importar</p>
                        </div>
                      }
                    />
                  </div>

                  {importLoading && (
                    <ProgressBar mode="indeterminate" style={{ height: '6px' }} className="mt-2" />
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
      
     
    </div>
  );
};

export default Home;
