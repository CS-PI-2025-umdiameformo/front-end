// Home.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './home';

// Mock do localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key) => { delete store[key]; },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('Home component', () => {

    beforeEach(() => {
        window.localStorage.clear();
    });

    test('exibe mensagem quando não há agendamentos próximos', () => {
        render(<Home />);
        const mensagem = screen.getByText(/Nenhum agendamento futuro encontrado/i);
        expect(mensagem).toBeInTheDocument();
    });

    test('exibe agendamentos próximos quando existem no localStorage', () => {
        // Simula dados salvos no localStorage
        const agendamentosSimulados = JSON.stringify([
            { titulo: 'Consulta médica', data: '2025-08-30', hora: '10:00', recorrente: false },
            { titulo: 'Reunião semanal', data: '2025-08-28', hora: '14:00', recorrente: true }
        ]);

        window.localStorage.setItem('agendamentos', agendamentosSimulados);

        render(<Home />);

        // Verifica se os títulos aparecem
        expect(screen.getByText('Consulta médica')).toBeInTheDocument();
        expect(screen.getByText('Reunião semanal')).toBeInTheDocument();

        // Verifica se o ícone de repetição está presente para agendamento recorrente
        const iconesRepeticao = screen.getAllByTestId('icone-repeticao');
        expect(iconesRepeticao.length).toBe(1);
    });
});
