import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthLayout from './AuthLayout';

describe('AuthLayout', () => {
  const renderAuthLayout = () => {
    return render(
      <BrowserRouter>
        <AuthLayout />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderAuthLayout();
    expect(screen.getByText(/Decouvrez des pieces uniques/i)).toBeInTheDocument();
  });

  it('displays main heading', () => {
    renderAuthLayout();
    expect(screen.getByRole('heading', { name: /Decouvrez des pieces uniques/i })).toBeInTheDocument();
  });

  it('displays trust indicators', () => {
    renderAuthLayout();
    expect(screen.getByText(/Paiements securises/i)).toBeInTheDocument();
    expect(screen.getByText(/Protection acheteur/i)).toBeInTheDocument();
    expect(screen.getByText(/Support 7j\/7/i)).toBeInTheDocument();
  });

  it('displays current year in copyright', () => {
    renderAuthLayout();
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} Collector\\.shop`))).toBeInTheDocument();
  });

  it('renders links to terms and privacy', () => {
    renderAuthLayout();
    const termsLinks = screen.getAllByRole('link', { name: /CGU|Conditions/i });
    const privacyLinks = screen.getAllByRole('link', { name: /Confidentialite|Politique/i });

    expect(termsLinks.length).toBeGreaterThan(0);
    expect(privacyLinks.length).toBeGreaterThan(0);
  });

  it('renders link to home on mobile', () => {
    renderAuthLayout();
    const homeLink = screen.getByRole('link', { name: /Retour a l'accueil/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('displays descriptive text', () => {
    renderAuthLayout();
    expect(screen.getByText(/Rejoignez la communaute des collectionneurs passionnes/i)).toBeInTheDocument();
  });
});
