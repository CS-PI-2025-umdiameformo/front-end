import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { ColorPicker } from 'primereact/colorpicker';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Chips } from 'primereact/chips';
import { Tag } from 'primereact/tag';
import { servicosApi } from '../../utils/localStorageApi';
import './gerenciarServicos.css';

const GerenciarServicos = () => {
  const [servicos, setServicos] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [servicoDialogVisivel, setServicoDialogVisivel] = useState(false);
  const [confirmaExclusaoVisivel, setConfirmaExclusaoVisivel] = useState(false);
  const [filtroGlobal, setFiltroGlobal] = useState('');
  const [servidorOcupado, setServidorOcupado] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(false);
  const [novoServico, setNovoServico] = useState({
    id: null,
    nome: '',
    descricao: '',
    duracao: 60,
    valor: null,
    cor: '3B82F6',
    tags: []
  });
  
  const toast = useRef(null);

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = () => {
    try {
      // Usar nossa API para obter os tipos de serviço
      const servicosCarregados = servicosApi.getAll();
      
      if (servicosCarregados && servicosCarregados.length > 0) {
        console.log('Serviços carregados com sucesso:', servicosCarregados.length);
        setServicos(servicosCarregados);
      } else {
        console.log('Nenhum serviço encontrado, criando dados de exemplo');
        // A API já inicializa com dados de exemplo quando não há serviços
        const servicosIniciais = servicosApi.getAll();
        setServicos(servicosIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      setServicos([]);
    }
  };

  // Não precisamos salvar no localStorage diretamente,
  // a API já cuida disso quando usamos os métodos apropriados

  const abrirNovoDialog = () => {
    setNovoServico({
      id: null,
      nome: '',
      descricao: '',
      duracao: 60,
      valor: null,
      cor: '3B82F6',
      tags: []
    });
    setServicoDialogVisivel(true);
  };

  const fecharDialog = () => {
    setServicoDialogVisivel(false);
  };

  const verificarServicoEmUso = (servicoId) => {
    // Usar nossa API para verificar se o serviço está em uso
    return servicosApi.verificarEmUso(servicoId);
  };

  const editarServico = (servico) => {
    // Clone profundo para evitar referências diretas
    setNovoServico({
      id: servico.id,
      nome: servico.nome,
      descricao: servico.descricao || '',
      duracao: servico.duracao,
      valor: servico.valor,
      cor: servico.cor,
      tags: [...(servico.tags || [])]
    });
    setServicoDialogVisivel(true);
  };

  const confirmarExclusao = (servico) => {
    setServicoSelecionado(servico);
    
    // Verificar se o serviço está em uso
    if (verificarServicoEmUso(servico.id)) {
      setErroExclusao(true);
    } else {
      setConfirmaExclusaoVisivel(true);
    }
  };

  const excluirServico = () => {
    // Confirmar novamente que o serviço não está em uso
    if (verificarServicoEmUso(servicoSelecionado.id)) {
      setErroExclusao(true);
      setConfirmaExclusaoVisivel(false);
      return;
    }

    // Usar nossa API para excluir o serviço
    if (servicosApi.delete(servicoSelecionado.id)) {
      // Atualizar estado local após excluir
      const servicosAtualizados = servicos.filter(s => s.id !== servicoSelecionado.id);
      setServicos(servicosAtualizados);
      
      // A API já atualizou o localStorage, não precisamos fazer manualmente
      
      toast.current.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Serviço excluído com sucesso',
        life: 3000
      });
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao excluir serviço',
        life: 3000
      });
    }
    
    setConfirmaExclusaoVisivel(false);
    setServicoSelecionado(null);
  };

  const fecharErroExclusao = () => {
    setErroExclusao(false);
    setServicoSelecionado(null);
  };

  const salvarServico = () => {
    if (!novoServico.nome || novoServico.duracao <= 0) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Nome e duração são obrigatórios',
        life: 3000
      });
      return;
    }
    
    // Simular tempo de processamento
    setServidorOcupado(true);
    
    setTimeout(() => {
      let resultado;
      
      if (novoServico.id) {
        // Atualizar serviço existente usando a API
        resultado = servicosApi.update(novoServico);
        
        if (resultado) {
          toast.current.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Serviço atualizado com sucesso',
            life: 3000
          });
        }
      } else {
        // Adicionar novo serviço usando a API
        resultado = servicosApi.add(novoServico);
        
        if (resultado) {
          toast.current.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Serviço adicionado com sucesso',
            life: 3000
          });
        }
      }
      
      // Se operação foi bem sucedida, atualiza a lista
      if (resultado) {
        // Recarregar a lista de serviços após adicionar/atualizar
        const servicosAtualizados = servicosApi.getAll();
        setServicos(servicosAtualizados);
        
        // A API já atualizou o localStorage, não precisamos fazer manualmente
        
        setServicoDialogVisivel(false);
        
        // Reiniciar formulário
        setNovoServico({
          id: null,
          nome: '',
          descricao: '',
          duracao: 60,
          valor: null,
          cor: '3B82F6',
          tags: []
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar serviço',
          life: 3000
        });
      }
      
      setServidorOcupado(false);
    }, 500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoServico(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    setNovoServico(prev => ({
      ...prev,
      tags: e.value
    }));
  };

  const handleNumberChange = (e, fieldName) => {
    setNovoServico(prev => ({
      ...prev,
      [fieldName]: e.value
    }));
  };

  const handleColorChange = (e) => {
    setNovoServico(prev => ({
      ...prev,
      cor: e.value
    }));
  };

  // Templates para as colunas
  const corTemplate = (rowData) => {
    return (
      <div className="amostra-cor" style={{ backgroundColor: `#${rowData.cor}` }}></div>
    );
  };

  const valorTemplate = (rowData) => {
    return rowData.valor ? `R$ ${rowData.valor.toFixed(2).replace('.', ',')}` : '';
  };

  const duracaoTemplate = (rowData) => {
    return `${rowData.duracao} min`;
  };

  const tagsTemplate = (rowData) => {
    return (
      <div className="tags-container">
        {rowData.tags && rowData.tags.map(tag => (
          <Tag key={tag} value={tag} className="mr-2" />
        ))}
      </div>
    );
  };

  const acoesTemplate = (rowData) => {
    return (
      <div className="acoes-servico">
        <Button 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() => editarServico(rowData)}
          tooltip="Editar" 
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-rounded p-button-danger"
          onClick={() => confirmarExclusao(rowData)} 
          tooltip="Excluir"
        />
      </div>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button 
          label="Novo Serviço" 
          icon="pi pi-plus" 
          className="p-button-success p-mr-2" 
          onClick={abrirNovoDialog} 
        />
      </React.Fragment>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="p-inputgroup">
        <span className="p-inputgroup-addon">
          <i className="pi pi-search" />
        </span>
        <InputText 
          placeholder="Buscar serviço..." 
          value={filtroGlobal} 
          onChange={(e) => setFiltroGlobal(e.target.value)}
        />
      </div>
    );
  };

  const servicoDialogFooter = (
    <React.Fragment>
      <Button 
        label="Cancelar" 
        icon="pi pi-times" 
        className="p-button-text" 
        onClick={fecharDialog} 
        disabled={servidorOcupado}
      />
      <Button 
        label="Salvar" 
        icon="pi pi-check" 
        className="p-button-text" 
        onClick={salvarServico}
        loading={servidorOcupado}
      />
    </React.Fragment>
  );

  const excluirDialogFooter = (
    <React.Fragment>
      <Button 
        label="Não" 
        icon="pi pi-times" 
        className="p-button-text" 
        onClick={() => setConfirmaExclusaoVisivel(false)} 
      />
      <Button 
        label="Sim" 
        icon="pi pi-check" 
        className="p-button-text p-button-danger" 
        onClick={excluirServico}
      />
    </React.Fragment>
  );

  const erroExclusaoFooter = (
    <React.Fragment>
      <Button 
        label="OK" 
        icon="pi pi-check" 
        className="p-button-text" 
        onClick={fecharErroExclusao}
      />
    </React.Fragment>
  );

  // Filtro personalizado para pesquisa global
  const filtrarServicos = () => {
    if (!filtroGlobal.trim()) return servicos;
    
    const termoBusca = filtroGlobal.toLowerCase();
    return servicos.filter(servico => 
      servico.nome.toLowerCase().includes(termoBusca) || 
      servico.descricao.toLowerCase().includes(termoBusca) ||
      (servico.tags && servico.tags.some(tag => tag.toLowerCase().includes(termoBusca)))
    );
  };

  const servicosFiltrados = filtrarServicos();

  return (
    <div className="gerenciar-servicos-page">
      <Toast ref={toast} />
      
      <div className="card">
        <h2>Gerenciar Tipos de Serviço</h2>
        <p className="subtitulo">
          Cadastre e gerencie os tipos de serviço oferecidos. Estes serviços poderão ser selecionados ao criar agendamentos.
        </p>
        
        <Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

        <DataTable 
          value={servicosFiltrados} 
          responsiveLayout="scroll" 
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="Nenhum serviço encontrado."
          className="p-datatable-servicos"
          stripedRows
        >
          <Column field="nome" header="Nome" sortable />
          <Column field="descricao" header="Descrição" />
          <Column field="duracao" header="Duração" body={duracaoTemplate} sortable />
          <Column field="valor" header="Valor" body={valorTemplate} sortable />
          <Column field="cor" header="Cor" body={corTemplate} style={{ width: '5rem' }} />
          <Column field="tags" header="Tags" body={tagsTemplate} />
          <Column body={acoesTemplate} exportable={false} style={{ width: '10rem' }} />
        </DataTable>
      </div>

      <Dialog
        visible={servicoDialogVisivel}
        style={{ width: '450px' }}
        header={novoServico.id ? 'Editar Serviço' : 'Novo Serviço'}
        modal
        className="p-fluid"
        footer={servicoDialogFooter}
        onHide={fecharDialog}
        closable={!servidorOcupado}
        closeOnEscape={!servidorOcupado}
      >
        <div className="p-field p-mb-3">
          <label htmlFor="nome">Nome*</label>
          <InputText 
            id="nome" 
            name="nome" 
            value={novoServico.nome}
            onChange={handleInputChange} 
            required 
            className={!novoServico.nome ? 'p-invalid' : ''}
            disabled={servidorOcupado}
          />
          {!novoServico.nome && <small className="p-error">Nome é obrigatório.</small>}
        </div>
        <div className="p-field p-mb-3">
          <label htmlFor="descricao">Descrição</label>
          <InputTextarea 
            id="descricao" 
            name="descricao" 
            value={novoServico.descricao}
            onChange={handleInputChange} 
            rows={3}
            disabled={servidorOcupado}
          />
        </div>
        <div className="p-formgrid p-grid">
          <div className="p-field p-col">
            <label htmlFor="duracao">Duração (min)*</label>
            <InputNumber 
              id="duracao" 
              value={novoServico.duracao}
              onValueChange={(e) => handleNumberChange(e, 'duracao')} 
              min={15}
              step={15}
              required
              disabled={servidorOcupado}
              className={!novoServico.duracao || novoServico.duracao <= 0 ? 'p-invalid' : ''}
            />
            {(!novoServico.duracao || novoServico.duracao <= 0) && 
              <small className="p-error">Duração é obrigatória e deve ser maior que zero.</small>
            }
          </div>
          <div className="p-field p-col">
            <label htmlFor="valor">Valor (R$)</label>
            <InputNumber 
              id="valor" 
              value={novoServico.valor}
              onValueChange={(e) => handleNumberChange(e, 'valor')} 
              mode="currency" 
              currency="BRL" 
              locale="pt-BR"
              disabled={servidorOcupado}
            />
          </div>
        </div>
        <div className="p-field p-mb-3">
          <label htmlFor="cor">Cor</label>
          <div className="p-inputgroup">
            <ColorPicker 
              value={novoServico.cor} 
              onChange={handleColorChange}
              disabled={servidorOcupado}
              format="hex"
            />
            <span className="p-inputgroup-addon">
              <div 
                className="cor-preview" 
                style={{ backgroundColor: `#${novoServico.cor}` }}
              ></div>
            </span>
          </div>
        </div>
        <div className="p-field p-mb-3">
          <label htmlFor="tags">Tags</label>
          <Chips 
            id="tags" 
            value={novoServico.tags} 
            onChange={handleTagsChange}
            disabled={servidorOcupado}
            placeholder="Adicionar tag (Enter)"
            separator=","
          />
        </div>
      </Dialog>

      <Dialog
        visible={confirmaExclusaoVisivel}
        style={{ width: '450px' }}
        header="Confirmar Exclusão"
        modal
        footer={excluirDialogFooter}
        onHide={() => setConfirmaExclusaoVisivel(false)}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem', color: '#ff9800' }} />
          {servicoSelecionado && (
            <span>
              Tem certeza que deseja excluir o serviço <b>{servicoSelecionado.nome}</b>?
              Esta ação não pode ser desfeita.
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={erroExclusao}
        style={{ width: '500px' }}
        header="Não é possível excluir"
        modal
        footer={erroExclusaoFooter}
        onHide={fecharErroExclusao}
      >
        <div className="error-content">
          <i className="pi pi-times-circle p-mr-3" style={{ fontSize: '2rem', color: '#f44336' }} />
          {servicoSelecionado && (
            <div>
              <p>
                O serviço <b>{servicoSelecionado.nome}</b> não pode ser excluído porque está sendo 
                usado em agendamentos existentes.
              </p>
              <p>
                Para excluir este serviço, primeiro você deve excluir ou modificar os 
                agendamentos associados a ele.
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default GerenciarServicos;
