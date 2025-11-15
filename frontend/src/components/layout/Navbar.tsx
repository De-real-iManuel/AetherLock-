import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/stores/walletStore';
import { useChatStore } from '@/stores/chatStore';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isConnected, address, disconnect } = useWalletStore();
  const { totalUnread } = useChatStore();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/chat', label: 'Messages', badge: totalUnread },
    { to: '/ai', label: 'AI Verification' },
    { to: '/transactions', label: 'Transactions' },
    { to: 'https://aetherlockprotocol.mintlify.app/', label: 'Docs', external: true }
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-primary-background/80 backdrop-blur-xl border-b border-accent-electric/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.img 
              whileHover={{ scale: 1.1, rotate: 5 }}
              src="/aetherlock-logo.png" 
              alt="AetherLock" 
              className="w-10 h-10 drop-shadow-[0_0_20px_rgba(0,212,170,0.6)]"
            />
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-accent-electric to-accent-cyan bg-clip-text text-transparent">
              AetherLock
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              link.external ? (
                <a
                  key={link.to}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-400 hover:text-accent-electric transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-electric transition-all group-hover:w-full" />
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors relative group ${
                    location.pathname === link.to
                      ? 'text-accent-electric'
                      : 'text-slate-400 hover:text-accent-electric'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {link.badge && link.badge > 0 && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full animate-pulse">
                        {link.badge > 99 ? '99+' : link.badge}
                      </span>
                    )}
                  </span>
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent-electric transition-all ${
                    location.pathname === link.to ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              )
            ))}
            
            {/* Wallet Connection Button */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-primary-card border border-accent-electric/30 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-verified rounded-full animate-pulse" />
                  <span className="text-sm font-mono text-accent-electric">
                    {formatAddress(address)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="primary" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-accent-electric transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4 border-t border-primary-border">
                {links.map(link => (
                  link.external ? (
                    <a
                      key={link.to}
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="block text-slate-400 hover:text-accent-electric transition-colors py-2"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between py-2 transition-colors ${
                        location.pathname === link.to
                          ? 'text-accent-electric'
                          : 'text-slate-400 hover:text-accent-electric'
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.badge && link.badge > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full">
                          {link.badge > 99 ? '99+' : link.badge}
                        </span>
                      )}
                    </Link>
                  )
                ))}
                
                {isConnected ? (
                  <div className="space-y-2 pt-2">
                    <div className="px-4 py-2 bg-primary-card border border-accent-electric/30 rounded-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-status-verified rounded-full animate-pulse" />
                      <span className="text-sm font-mono text-accent-electric">
                        {formatAddress(address)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        disconnect();
                        setIsOpen(false);
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" className="w-full gap-2">
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
