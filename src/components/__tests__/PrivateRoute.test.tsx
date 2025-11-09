import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import { PrivateRoute } from '../PrivateRoute';
import { AuthProvider } from '../../contexts/AuthContext';

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve renderizar children quando autenticado', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <div data-testid="protected-content">Conteúdo Protegido</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });

  it('deve redirecionar para login quando não autenticado', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <div data-testid="protected-content">Conteúdo Protegido</div>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});

