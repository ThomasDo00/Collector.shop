import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CheckoutLayout from './CheckoutLayout';

describe('CheckoutLayout', () => {
  const renderCheckoutLayout = () => {
    return render(
      <BrowserRouter>
        <CheckoutLayout />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderCheckoutLayout();
    expect(screen.getByText(/Paiement securise/i)).toBeInTheDocument();
  });

  it('displays secure payment indicator', () => {
    renderCheckoutLayout();
    expect(screen.getByText(/Paiement securise/i)).toBeInTheDocument();
  });

  it('renders logo with link to home', () => {
    renderCheckoutLayout();
    const logoLinks = screen.getAllByRole('link');
    const homeLink = logoLinks.find(link => link.getAttribute('href') === '/');
    expect(homeLink).toBeInTheDocument();
  });

  it('displays current year in copyright', () => {
    renderCheckoutLayout();
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(String.raw`© ${currentYear} Collector\.shop`))).toBeInTheDocument();
  });

  it('renders footer links', () => {
    renderCheckoutLayout();
    expect(screen.getByRole('link', { name: /Conditions d'utilisation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Politique de confidentialite/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Aide/i })).toBeInTheDocument();
  });

  it('has correct link attributes', () => {
    renderCheckoutLayout();
    const termsLink = screen.getByRole('link', { name: /Conditions d'utilisation/i });
    const privacyLink = screen.getByRole('link', { name: /Politique de confidentialite/i });
    const helpLink = screen.getByRole('link', { name: /Aide/i });

    expect(termsLink).toHaveAttribute('href', '/terms');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(helpLink).toHaveAttribute('href', '/help');
  });

  it('renders header with correct structure', () => {
    const { container } = renderCheckoutLayout();
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('bg-white');
  });

  it('renders main content area', () => {
    const { container } = renderCheckoutLayout();
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1');
  });

  it('renders footer with correct structure', () => {
    const { container } = renderCheckoutLayout();
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('bg-white');
  });
});
