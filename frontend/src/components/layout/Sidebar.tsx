import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  History, 
  Scale, 
  User, 
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className = '' }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { 
      key: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard' 
    },
    { 
      key: 'escrows', 
      label: 'My Escrows', 
      icon: FileText, 
      path: '/dashboard/escrows' 
    },
    { 
      key: 'ai', 
      label: 'AI Verification', 
      icon: Sparkles, 
      path: '/ai' 
    },
    { 
      key: 'transactions', 
      label: 'Transactions', 
      icon: History, 
      path: '/transactions' 
    },
    { 
      key: 'disputes', 
      label: 'Disputes', 
      icon: Scale, 
      path: '/disputes' 
    },
  ];

  const bottomItems = [
    { 
      key: 'profile', 
      label: 'Profile', 
      icon: User, 
      path: '/profile' 
    },
    { 
      key: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      path: '/settings' 
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={`w-64 bg-primary-surface/50 backdrop-blur-xl border-r border-primary-border min-h-screen flex flex-col ${className}`}>
      {/* Main Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map(({ key, label, icon: Icon, path }) => {
            const active = isActive(path);
            return (
              <Link key={key} to={path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${active 
                      ? 'bg-accent-electric/10 text-accent-electric' 
                      : 'text-slate-400 hover:text-white hover:bg-primary-card/50'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-accent-electric rounded-r"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <Icon className={`w-5 h-5 ${active ? 'text-accent-electric' : ''}`} />
                  <span className="font-medium text-sm">{label}</span>
                  
                  {active && (
                    <ChevronRight className="w-4 h-4 ml-auto text-accent-electric" />
                  )}
                  
                  {/* Hover glow effect */}
                  {!active && (
                    <div className="absolute inset-0 rounded-lg bg-accent-electric/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-primary-border">
        <div className="space-y-1">
          {bottomItems.map(({ key, label, icon: Icon, path }) => {
            const active = isActive(path);
            return (
              <Link key={key} to={path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${active 
                      ? 'bg-accent-electric/10 text-accent-electric' 
                      : 'text-slate-400 hover:text-white hover:bg-primary-card/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-accent-electric' : ''}`} />
                  <span className="font-medium text-sm">{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
