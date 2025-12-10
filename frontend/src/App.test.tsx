import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@store/index';
import App from './App';

const renderApp = () => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
};

describe('App', () => {
  it('renders the home page with title', () => {
    renderApp();
    expect(screen.getByText('Collector.shop')).toBeInTheDocument();
  });

  it('displays the marketplace description', () => {
    renderApp();
    expect(
      screen.getByText("Marketplace d'objets de collection entre particuliers")
    ).toBeInTheDocument();
  });

  it('shows feature sections', () => {
    renderApp();
    expect(screen.getByText('Achetez en confiance')).toBeInTheDocument();
    expect(screen.getByText('Vendez facilement')).toBeInTheDocument();
    expect(screen.getByText('Communauté passionnée')).toBeInTheDocument();
  });
});
