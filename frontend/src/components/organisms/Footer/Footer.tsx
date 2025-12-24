import { Link } from 'react-router-dom';
import Logo from '@/components/atoms/Logo';
import Icon from '@/components/atoms/Icon';

const FOOTER_LINKS = {
  about: [
    { label: 'A propos', href: '/about' },
    { label: 'Comment ca marche', href: '/how-it-works' },
    { label: 'Blog', href: '/blog' },
    { label: 'Carrieres', href: '/careers' },
  ],
  categories: [
    { label: 'Sneakers', href: '/catalog/sneakers' },
    { label: 'Figurines', href: '/catalog/figurines' },
    { label: 'Vinyles', href: '/catalog/vinyl' },
    { label: 'Posters', href: '/catalog/posters' },
  ],
  help: [
    { label: 'Centre d\'aide', href: '/help' },
    { label: 'Guide du vendeur', href: '/seller-guide' },
    { label: 'Guide de l\'acheteur', href: '/buyer-guide' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'CGU', href: '/terms' },
    { label: 'CGV', href: '/sales-terms' },
    { label: 'Confidentialite', href: '/privacy' },
    { label: 'Cookies', href: '/cookies' },
  ],
};

const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://instagram.com/collector.shop', icon: 'heart' as const },
  { name: 'Twitter', href: 'https://twitter.com/collector_shop', icon: 'chat' as const },
  { name: 'Facebook', href: 'https://facebook.com/collector.shop', icon: 'user' as const },
];

/**
 * Footer component
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-accent text-white">
      {/* Main Footer */}
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Logo size="md" linkToHome={false} />
            <p className="mt-4 text-gray-400 text-sm max-w-xs">
              La marketplace de reference pour les collectionneurs passionnes.
              Achetez et vendez vos pieces rares en toute securite.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  aria-label={social.name}
                >
                  <Icon name={social.icon} size="sm" />
                </a>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              A propos
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.about.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.categories.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Aide
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Icon name="shield" size="md" />
              <span className="text-sm">Paiement securise</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="truck" size="md" />
              <span className="text-sm">Livraison suivie</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="credit-card" size="md" />
              <span className="text-sm">Protection acheteur</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="chat" size="md" />
              <span className="text-sm">Support 7j/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-page py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Collector.shop. Tous droits reserves.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-4 text-gray-400">
              <span className="text-xs uppercase tracking-wider">Paiements acceptes</span>
              <div className="flex items-center gap-2">
                <Icon name="credit-card" size="md" />
                <span className="text-sm">Visa</span>
                <span className="text-sm">Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
