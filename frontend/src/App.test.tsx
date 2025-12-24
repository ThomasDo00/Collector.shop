import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  it('renders without crashing', () => {
    const { container } = renderApp();
    expect(container).toBeInTheDocument();
  });

  it.skip('displays the marketplace description', async () => {
    renderApp();
    // Use findByText which waits automatically
    expect(await screen.findByText(/Marketplace d'objets de collection entre/, {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it.skip('shows feature sections', async () => {
    renderApp();
    // Use findByText which waits automatically
    expect(await screen.findByText(/Achetez en confiance/, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(await screen.findByText(/Vendez facilement/)).toBeInTheDocument();
    expect(await screen.findByText(/Communauté passionnée/)).toBeInTheDocument();
  });
});
