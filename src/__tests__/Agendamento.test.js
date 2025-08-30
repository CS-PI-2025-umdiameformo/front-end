import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Agendamento from '../pages/agendamento/agendamento';

// Mock das funções de FullCalendar que podem causar problemas nos testes
jest.mock('@fullcalendar/react', () => {
  return function MockFullCalendar(props) {
    // Salva props para testes
    window.lastCalendarProps = props;
    
    // Simula o componente para testes
    return (
      <div data-testid="mock-calendar">
        <button 
          data-testid="create-event-button" 
          onClick={() => props.dateClick({ date: new Date('2025-09-20T14:00:00') })}
        >
          Criar Evento
        </button>
        
        {props.events.length > 0 && (
          <button 
            data-testid="event-click-button" 
            onClick={() => props.eventClick({ 
              event: {
                id: props.events[0].id,
                title: props.events[0].title,
                start: new Date(props.events[0].start),
                end: new Date(props.events[0].end),
                extendedProps: props.events[0].extendedProps
              }
            })}
          >
            Selecionar Evento
          </button>
        )}
        
        <div data-testid="agendamentos-count">
          {props.events.length} eventos
        </div>
      </div>
    );
  };
});

// Mock do uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-456'
}));

// Mock dos componentes do PrimeReact
jest.mock('primereact/button', () => ({
  Button: ({ label, icon, className, onClick, children }) => (
    <button 
      onClick={onClick} 
      className={className}
      data-icon={icon}
    >
      {label || children}
    </button>
  )
}));

jest.mock('primereact/dialog', () => ({
  Dialog: ({ header, visible, children, footer, onHide }) => 
    visible ? (
      <div className="p-dialog" data-testid="dialog">
        <div className="p-dialog-header">{header}</div>
        <div className="p-dialog-content">{children}</div>
        {footer && <div className="p-dialog-footer">{footer}</div>}
        <button onClick={onHide} data-testid="dialog-close">X</button>
      </div>
    ) : null
}));

jest.mock('primereact/toast', () => ({
  Toast: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      show: (message) => {
        // Simular a exibição da mensagem
        document.body.setAttribute('data-toast-message', message.detail);
      }
    }));
    return <div data-testid="toast"></div>;
  })
}));

// Mock do localStorage
const localStorageMock = (() => {
  let store = {
    clients: JSON.stringify([]),
    agendamentos: JSON.stringify([]),
    serviceTypes: JSON.stringify([])
  };
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Agendamento Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza a página de agendamento corretamente', () => {
    render(<Agendamento />);
    
    // Verifica se o título da página está presente
    expect(screen.getByText('Sistema de Agendamentos')).toBeInTheDocument();
    
    // Verifica se o calendário foi renderizado
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
    
    // Verifica se os botões de visualização estão presentes
    expect(screen.getByRole('button', { name: /mês/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /semana/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dia/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lista/i })).toBeInTheDocument();
    
    // Verifica se os exemplos de agendamentos foram carregados
    expect(screen.getByTestId('agendamentos-count')).toHaveTextContent('4 eventos');
  });

  test('abre o diálogo para criar um novo evento', () => {
    render(<Agendamento />);
    
    // Ação de clicar no botão para criar evento
    fireEvent.click(screen.getByTestId('create-event-button'));
    
    // Verifica se o diálogo foi aberto
    expect(screen.getByText('Criar Agendamento')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument();
  });

  test('permite selecionar um evento existente', () => {
    render(<Agendamento />);
    
    // Verifica se há eventos carregados
    expect(screen.getByTestId('agendamentos-count')).toHaveTextContent('4 eventos');
    
    // Selecionar um evento existente
    if (screen.queryByTestId('event-click-button')) {
      fireEvent.click(screen.getByTestId('event-click-button'));
      
      // Verifica se o diálogo de edição foi aberto
      expect(screen.getByText('Editar Agendamento')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /excluir/i })).toBeInTheDocument();
    }
  });

  test('abre diálogo de confirmação ao excluir evento', async () => {
    const { container } = render(<Agendamento />);
    
    // Selecionar um evento existente
    if (screen.queryByTestId('event-click-button')) {
      fireEvent.click(screen.getByTestId('event-click-button'));
      
      // Verificar se o diálogo de edição foi aberto
      const excluirButton = screen.getByRole('button', { name: /excluir/i });
      expect(excluirButton).toBeInTheDocument();
      
      // Clicar no botão de excluir
      fireEvent.click(excluirButton);
      
      // Verificar se o diálogo de confirmação apareceu
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      expect(screen.getByText('Tem certeza de que deseja excluir este agendamento?')).toBeInTheDocument();
      
      // Confirmar exclusão
      const confirmarButton = screen.getByRole('button', { name: /sim/i });
      fireEvent.click(confirmarButton);
      
      // Verificar se o diálogo foi fechado
      expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
    }
  });

  test('cancela a exclusão do evento', () => {
    render(<Agendamento />);
    
    // Selecionar um evento existente
    if (screen.queryByTestId('event-click-button')) {
      fireEvent.click(screen.getByTestId('event-click-button'));
      
      // Clicar no botão de excluir
      fireEvent.click(screen.getByRole('button', { name: /excluir/i }));
      
      // Verificar se o diálogo de confirmação apareceu
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      
      // Cancelar exclusão
      fireEvent.click(screen.getByRole('button', { name: /não/i }));
      
      // Verificar se o diálogo foi fechado
      expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
    }
  });
});
