import { Link } from 'react-router-dom';
import { Github, Twitter, MessageCircle, FileText } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com/aetherlock', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/aetherlock', label: 'Twitter' },
    { icon: MessageCircle, href: 'https://discord.gg/aetherlock', label: 'Discord' },
    { icon: FileText, href: 'https://aetherlockprotocol.mintlify.app/', label: 'Docs' }
  ];

  const legalLinks = [
    { to: '/terms', label: 'Terms of Service' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/disclaimer', label: 'Disclaimer' }
  ];

  const productLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/ai', label: 'AI Verification' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/marketplace', label: 'Marketplace' }
  ];

  return (
    <footer className="relative bg-primary-background border-t border-accent-electric/20 mt-auto">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent-electric/5 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/aetherlock-logo.png" 
                alt="AetherLock" 
                className="w-8 h-8 drop-shadow-[0_0_15px_rgba(0,212,170,0.6)]"
              />
              <span className="text-xl font-display font-bold bg-gradient-to-r from-accent-electric to-accent-cyan bg-clip-text text-transparent">
                AetherLock
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4 max-w-md">
              Decentralized escrow protocol powered by ZetaChain, enabling secure cross-chain transactions with AI-powered verification and dispute resolution.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-accent-electric transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {productLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-slate-400 hover:text-accent-electric transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-slate-400 hover:text-accent-electric transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} AetherLock Protocol. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs">
            Built on <span className="text-accent-electric font-semibold">ZetaChain</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
