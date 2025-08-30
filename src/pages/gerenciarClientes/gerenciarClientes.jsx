import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputMask } from 'primereact/inputmask';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { clientesApi, agendamentosApi } from '../../utils/localStorageApi';
import './gerenciarClientes.css';

const GerenciarClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clienteDialogVisivel, setClienteDialogVisivel] = useState(false);
  const [confirmaExclusaoVisivel, setConfirmaExclusaoVisivel] = useState(false);
  const [servidorOcupado, setServidorOcupado] = useState(false);
  const [campoInvalido, setCampoInvalido] = useState({});
  const [erros, setErros] = useState({});
  const [clienteEmUso, setClienteEmUso] = useState(false);
  const [agendamentosCliente, setAgendamentosCliente] = useState([]);
  const [filtros, setFiltros] = useState({
    global: '',
    campo: 'nome'
  });
  
  const [novoCliente, setNovoCliente] = useState({
    id: null,
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    dataNascimento: '',
    observacoes: '',
    genero: '',
    documentos: {
      cpf: '',
      rg: ''
    }
  });
  
  const toast = useRef(null);
  const dt = useRef(null);

  const estadosBrasileiros = [
    { label: 'Acre', value: 'AC' },
    { label: 'Alagoas', value: 'AL' },
    { label: 'Amapá', value: 'AP' },
    { label: 'Amazonas', value: 'AM' },
    { label: 'Bahia', value: 'BA' },
    { label: 'Ceará', value: 'CE' },
    { label: 'Distrito Federal', value: 'DF' },
    { label: 'Espírito Santo', value: 'ES' },
    { label: 'Goiás', value: 'GO' },
    { label: 'Maranhão', value: 'MA' },
    { label: 'Mato Grosso', value: 'MT' },
    { label: 'Mato Grosso do Sul', value: 'MS' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Pará', value: 'PA' },
    { label: 'Paraíba', value: 'PB' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Pernambuco', value: 'PE' },
    { label: 'Piauí', value: 'PI' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'Rio Grande do Norte', value: 'RN' },
    { label: 'Rio Grande do Sul', value: 'RS' },
    { label: 'Rondônia', value: 'RO' },
    { label: 'Roraima', value: 'RR' },
    { label: 'Santa Catarina', value: 'SC' },
    { label: 'São Paulo', value: 'SP' },
    { label: 'Sergipe', value: 'SE' },
    { label: 'Tocantins', value: 'TO' }
  ];

  const opcoesGenero = [
    { label: 'Masculino', value: 'masculino' },
    { label: 'Feminino', value: 'feminino' },
    { label: 'Não informado', value: 'nao_informado' },
    { label: 'Outro', value: 'outro' }
  ];

  const opcoesFiltro = [
    { label: 'Nome', value: 'nome' },
    { label: 'Email', value: 'email' },
    { label: 'Telefone', value: 'telefone' },
    { label: 'CPF', value: 'documentos.cpf' }
  ];

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = () => {
    try {
      // Usar nossa API para obter os clientes
      const clientesCarregados = clientesApi.getAll();
      
      if (clientesCarregados && clientesCarregados.length > 0) {
        console.log('Clientes carregados com sucesso:', clientesCarregados.length);
        setClientes(clientesCarregados);
      } else {
        console.log('Nenhum cliente encontrado, criando dados de exemplo');
        // A API já inicializa com dados de exemplo quando não há clientes
        const clientesIniciais = clientesApi.getAll();
        setClientes(clientesIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClientes([]);
    }
  };

  const validarEmail = (email) => {
    if (!email) return true; // Email não é obrigatório
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const clienteExiste = (cliente) => {
    return clientes.some(c => {
      // Se estamos editando um cliente existente, ignoramos a comparação com ele mesmo
      if (cliente.id && c.id === cliente.id) return false;
      
      // Verificar telefone duplicado (considerando apenas números)
      const telefoneAtual = cliente.telefone.replace(/\D/g, '');
      const telefoneExistente = c.telefone.replace(/\D/g, '');
      if (telefoneAtual && telefoneExistente && telefoneAtual === telefoneExistente) return true;
      
      // Verificar email duplicado
      if (cliente.email && c.email && cliente.email.toLowerCase() === c.email.toLowerCase()) return true;
      
      // Verificar CPF duplicado (considerando apenas números)
      const cpfAtual = cliente.documentos?.cpf?.replace(/\D/g, '');
      const cpfExistente = c.documentos?.cpf?.replace(/\D/g, '');
      if (cpfAtual && cpfExistente && cpfAtual === cpfExistente) return true;
      
      return false;
    });
  };

  const verificarClienteEmUso = (clienteId) => {
    // Usar a API de agendamentos já importada
    const agendamentosDoCliente = agendamentosApi.buscarPorCliente(clienteId);
    
    if (agendamentosDoCliente.length > 0) {
      setAgendamentosCliente(agendamentosDoCliente);
      return true;
    }
    
    return false;
  };

  const validarFormulario = () => {
    const erros = {};
    let formularioValido = true;

    // Nome é obrigatório
    if (!novoCliente.nome.trim()) {
      erros.nome = 'Nome é obrigatório';
      formularioValido = false;
    }

    // Telefone é obrigatório
    if (!novoCliente.telefone.trim()) {
      erros.telefone = 'Telefone é obrigatório';
      formularioValido = false;
    }

    // Email opcional, mas se fornecido deve ser válido
    if (novoCliente.email && !validarEmail(novoCliente.email)) {
      erros.email = 'Email inválido';
      formularioValido = false;
    }
    
    // Verificar se cliente já existe
    if (clienteExiste(novoCliente)) {
      erros.duplicado = 'Cliente com mesmo email, telefone ou CPF já cadastrado';
      formularioValido = false;
    }

    setErros(erros);
    return formularioValido;
  };

  const abrirNovoDialog = () => {
    setNovoCliente({
      id: null,
      nome: '',
      telefone: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      dataNascimento: '',
      observacoes: '',
      genero: '',
      documentos: {
        cpf: '',
        rg: ''
      }
    });
    setCampoInvalido({});
    setErros({});
    setClienteDialogVisivel(true);
  };

  const fecharDialog = () => {
    setClienteDialogVisivel(false);
    setErros({});
  };

  const editarCliente = (cliente) => {
    setNovoCliente({ ...cliente });
    setCampoInvalido({});
    setErros({});
    setClienteDialogVisivel(true);
  };

  const confirmarExclusao = (cliente) => {
    setClienteSelecionado(cliente);
    
    if (verificarClienteEmUso(cliente.id)) {
      setClienteEmUso(true);
    } else {
      setConfirmaExclusaoVisivel(true);
    }
  };

  const excluirCliente = () => {
    // Verificar novamente se o cliente está sendo usado
    if (verificarClienteEmUso(clienteSelecionado.id)) {
      setClienteEmUso(true);
      setConfirmaExclusaoVisivel(false);
      return;
    }
    
    // Usar nossa API para excluir o cliente
    if (clientesApi.delete(clienteSelecionado.id)) {
      // Atualizar estado local após excluir
      const clientesAtualizados = clientes.filter(c => c.id !== clienteSelecionado.id);
      setClientes(clientesAtualizados);
      setConfirmaExclusaoVisivel(false);
      
      toast.current.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Cliente excluído com sucesso',
        life: 3000
      });
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao excluir cliente',
        life: 3000
      });
    }
    
    setClienteSelecionado(null);
  };

  const fecharDialogClienteEmUso = () => {
    setClienteEmUso(false);
    setClienteSelecionado(null);
    setAgendamentosCliente([]);
  };

  const salvarCliente = () => {
    if (!validarFormulario()) return;
    
    setServidorOcupado(true);
    
    setTimeout(() => {
      let resultado;
      
      if (novoCliente.id) {
        // Atualizar cliente existente usando a API
        resultado = clientesApi.update(novoCliente);
        
        if (resultado) {
          toast.current.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cliente atualizado com sucesso',
            life: 3000
          });
        }
      } else {
        // Adicionar novo cliente usando a API
        resultado = clientesApi.add(novoCliente);
        
        if (resultado) {
          toast.current.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cliente adicionado com sucesso',
            life: 3000
          });
        }
      }
      
      // Se operação foi bem sucedida, atualiza a lista
      if (resultado) {
        // Recarregar a lista de clientes após adicionar/atualizar
        const clientesAtualizados = clientesApi.getAll();
        setClientes(clientesAtualizados);
        
        setClienteDialogVisivel(false);
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar cliente',
          life: 3000
        });
      }
      
      setServidorOcupado(false);
    }, 500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Para campos aninhados como documentos.cpf
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNovoCliente(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNovoCliente(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpar erro do campo
    if (erros[name]) {
      setErros(prev => {
        const newErros = { ...prev };
        delete newErros[name];
        return newErros;
      });
    }
    
    // Validações específicas
    if (name === 'email' && value) {
      const emailValido = validarEmail(value);
      setCampoInvalido(prev => ({
        ...prev,
        email: !emailValido
      }));
      
      if (!emailValido) {
        setErros(prev => ({
          ...prev,
          email: 'Email inválido'
        }));
      }
    }
  };
  
  const filtrarClientes = () => {
    if (!filtros.global.trim()) return clientes;
    
    const termoBusca = filtros.global.toLowerCase();
    const campo = filtros.campo;
    
    return clientes.filter(cliente => {
      // Busca em campos aninhados
      if (campo.includes('.')) {
        const [parent, child] = campo.split('.');
        const valor = cliente[parent]?.[child]?.toLowerCase() || '';
        return valor.includes(termoBusca);
      }
      
      // Busca em campos normais
      const valor = cliente[campo]?.toLowerCase() || '';
      return valor.includes(termoBusca);
    });
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Templates para as colunas
  const generoTemplate = (rowData) => {
    if (!rowData.genero) return '';
    
    let severity = 'info';
    let label = 'Não informado';
    
    switch(rowData.genero) {
      case 'masculino':
        severity = 'info';
        label = 'Masculino';
        break;
      case 'feminino':
        severity = 'success';
        label = 'Feminino';
        break;
      case 'outro':
        severity = 'warning';
        label = 'Outro';
        break;
      default:
        severity = 'secondary';
        label = 'Não informado';
    }
    
    return <Tag value={label} severity={severity} />;
  };

  const acoesTemplate = (rowData) => {
    return (
      <div className="acoes-cliente">
        <Button 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() => editarCliente(rowData)}
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
          label="Novo Cliente" 
          icon="pi pi-plus" 
          className="p-button-success" 
          onClick={abrirNovoDialog} 
        />
      </React.Fragment>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="p-inputgroup">
        <Dropdown
          value={filtros.campo}
          options={opcoesFiltro}
          onChange={(e) => handleFiltroChange({ target: { name: 'campo', value: e.value } })}
          className="filtro-campo"
        />
        <span className="p-inputgroup-addon">
          <i className="pi pi-search" />
        </span>
        <InputText 
          placeholder="Buscar cliente..." 
          value={filtros.global} 
          name="global"
          onChange={handleFiltroChange} 
        />
      </div>
    );
  };

  const clienteDialogFooter = (
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
        onClick={salvarCliente}
        loading={servidorOcupado}
        disabled={Object.keys(erros).length > 0}
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
        onClick={excluirCliente}
      />
    </React.Fragment>
  );

  const clienteEmUsoFooter = (
    <Button 
      label="OK" 
      icon="pi pi-check" 
      className="p-button-text" 
      onClick={fecharDialogClienteEmUso}
    />
  );

  const clientesFiltrados = filtrarClientes();
  
  return (
    <div className="gerenciar-clientes-page">
      <Toast ref={toast} />
      
      <div className="card">
        <h2>Gerenciar Clientes</h2>
        <p className="subtitulo">
          Cadastre e gerencie os dados de seus clientes. Estes clientes poderão ser selecionados ao criar agendamentos.
        </p>
        
        <Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

        <DataTable 
          ref={dt}
          value={clientesFiltrados} 
          responsiveLayout="scroll" 
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          emptyMessage="Nenhum cliente encontrado."
          stripedRows
        >
          <Column field="nome" header="Nome" sortable />
          <Column field="telefone" header="Telefone" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="cidade" header="Cidade" sortable />
          <Column field="genero" header="Gênero" body={generoTemplate} sortable />
          <Column body={acoesTemplate} exportable={false} style={{ width: '8rem' }} />
        </DataTable>
      </div>

      <Dialog
        visible={clienteDialogVisivel}
        style={{ width: '80%', maxWidth: '800px' }}
        header={novoCliente.id ? 'Editar Cliente' : 'Novo Cliente'}
        modal
        className="p-fluid cliente-dialog"
        footer={clienteDialogFooter}
        onHide={fecharDialog}
        closable={!servidorOcupado}
        closeOnEscape={!servidorOcupado}
      >
        {erros.duplicado && (
          <div className="p-message p-message-error p-mb-3">
            <div className="p-message-wrapper">
              <i className="pi pi-exclamation-circle p-mr-2"></i>
              <span>{erros.duplicado}</span>
            </div>
          </div>
        )}
        
        <div className="p-grid p-formgrid">
          <div className="p-field p-col-12">
            <label htmlFor="nome">Nome Completo*</label>
            <InputText 
              id="nome" 
              name="nome" 
              value={novoCliente.nome}
              onChange={handleInputChange} 
              required 
              className={erros.nome ? 'p-invalid' : ''}
              disabled={servidorOcupado}
            />
            {erros.nome && <small className="p-error">{erros.nome}</small>}
          </div>
          
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="telefone">Telefone*</label>
            <InputMask 
              id="telefone" 
              name="telefone" 
              value={novoCliente.telefone}
              onChange={handleInputChange} 
              mask="(99) 99999-9999"
              placeholder="(99) 99999-9999"
              required 
              className={erros.telefone ? 'p-invalid' : ''}
              disabled={servidorOcupado}
            />
            {erros.telefone && <small className="p-error">{erros.telefone}</small>}
          </div>
          
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="email">Email</label>
            <InputText 
              id="email" 
              name="email" 
              type="email" 
              value={novoCliente.email}
              onChange={handleInputChange} 
              className={erros.email ? 'p-invalid' : ''}
              disabled={servidorOcupado}
            />
            {erros.email && <small className="p-error">{erros.email}</small>}
          </div>
          
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="documentos.cpf">CPF</label>
            <InputMask 
              id="documentos.cpf" 
              name="documentos.cpf" 
              value={novoCliente.documentos?.cpf || ''}
              onChange={handleInputChange}
              mask="999.999.999-99"
              placeholder="000.000.000-00"
              disabled={servidorOcupado}
            />
          </div>
          
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="documentos.rg">RG</label>
            <InputText 
              id="documentos.rg" 
              name="documentos.rg" 
              value={novoCliente.documentos?.rg || ''}
              onChange={handleInputChange}
              disabled={servidorOcupado}
            />
          </div>
          
          <Divider align="left">
            <div className="p-d-inline-flex p-ai-center">
              <i className="pi pi-map-marker p-mr-2"></i>
              <span>Endereço</span>
            </div>
          </Divider>
          
          <div className="p-field p-col-12">
            <label htmlFor="endereco">Endereço</label>
            <InputText 
              id="endereco" 
              name="endereco" 
              value={novoCliente.endereco}
              onChange={handleInputChange}
              disabled={servidorOcupado}
            />
          </div>
          
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="cidade">Cidade</label>
            <InputText 
              id="cidade" 
              name="cidade" 
              value={novoCliente.cidade}
              onChange={handleInputChange}
              disabled={servidorOcupado}
            />
          </div>
          
          <div className="p-field p-col-6 p-md-3">
            <label htmlFor="estado">Estado</label>
            <Dropdown 
              id="estado" 
              name="estado"
              value={novoCliente.estado}
              options={estadosBrasileiros}
              onChange={handleInputChange}
              disabled={servidorOcupado}
              placeholder="Selecione"
            />
          </div>
          
          <div className="p-field p-col-6 p-md-3">
            <label htmlFor="cep">CEP</label>
            <InputMask 
              id="cep" 
              name="cep" 
              value={novoCliente.cep}
              onChange={handleInputChange}
              mask="99999-999"
              placeholder="00000-000"
              disabled={servidorOcupado}
            />
          </div>
          
          <Divider align="left">
            <div className="p-d-inline-flex p-ai-center">
              <i className="pi pi-user p-mr-2"></i>
              <span>Informações Adicionais</span>
            </div>
          </Divider>
          
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="dataNascimento">Data de Nascimento</label>
            <InputMask 
              id="dataNascimento" 
              name="dataNascimento" 
              value={novoCliente.dataNascimento}
              onChange={handleInputChange}
              mask="99/99/9999"
              placeholder="DD/MM/AAAA"
              slotChar="DD/MM/AAAA"
              disabled={servidorOcupado}
            />
          </div>
          
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="genero">Gênero</label>
            <Dropdown 
              id="genero" 
              name="genero"
              value={novoCliente.genero}
              options={opcoesGenero}
              onChange={handleInputChange}
              disabled={servidorOcupado}
              placeholder="Selecione"
            />
          </div>
          
          <div className="p-field p-col-12">
            <label htmlFor="observacoes">Observações</label>
            <InputTextarea 
              id="observacoes" 
              name="observacoes" 
              value={novoCliente.observacoes}
              onChange={handleInputChange} 
              rows={3}
              disabled={servidorOcupado}
              placeholder="Informações adicionais sobre o cliente..."
            />
          </div>
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
          {clienteSelecionado && (
            <span>
              Tem certeza que deseja excluir o cliente <b>{clienteSelecionado.nome}</b>? 
              Esta ação não pode ser desfeita.
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={clienteEmUso}
        style={{ width: '500px' }}
        header="Não é possível excluir cliente"
        modal
        footer={clienteEmUsoFooter}
        onHide={fecharDialogClienteEmUso}
      >
        <div className="error-content">
          <i className="pi pi-times-circle p-mr-3" style={{ fontSize: '2rem', color: '#f44336' }} />
          {clienteSelecionado && (
            <div>
              <p>
                O cliente <b>{clienteSelecionado.nome}</b> não pode ser excluído porque 
                está associado a agendamentos existentes.
              </p>
              <p>
                Para excluir este cliente, primeiro você deve excluir ou modificar os 
                agendamentos associados a ele.
              </p>
              {agendamentosCliente.length > 0 && (
                <p className="agendamentos-count">
                  Este cliente tem <b>{agendamentosCliente.length}</b> agendamento(s).
                </p>
              )}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default GerenciarClientes;
