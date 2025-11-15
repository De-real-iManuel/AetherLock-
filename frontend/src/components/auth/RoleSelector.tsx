import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';

interface RoleSelectorProps {
  onRoleSelect: (role: 'client' | 'freelancer') => void;
}

const RoleSelector = React.forwardRef<HTMLDivElement, RoleSelectorProps>(
  ({ onRoleSelect }, ref) => {
    const [selectedRole, setSelectedRole] = React.useState<'client' | 'freelancer' | null>(null);

    const roles = [
      {
        id: 'client' as const,
        title: 'Client',
        description: 'Post projects and hire freelancers',
        icon: '💼',
        features: ['Create escrow deals', 'AI-powered verification', 'Dispute resolution', 'Multi-chain payments'],
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'freelancer' as const,
        title: 'Freelancer',
        description: 'Find work and get paid securely',
        icon: '🚀',
        features: ['Browse opportunities', 'Build trust score', 'Secure payments', 'Global marketplace'],
        gradient: 'from-purple-500 to-pink-500'
      }
    ];

    const handleRoleSelect = (role: 'client' | 'freelancer') => {
      setSelectedRole(role);
      setTimeout(() => onRoleSelect(role), 300);
    };

    return (
      <div ref={ref} className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Choose Your Role</h2>
          <p className="text-slate-400">Select how you want to use AetherLock</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <Card 
                className={`p-6 cursor-pointer border-2 transition-all duration-300 ${
                  selectedRole === role.id 
                    ? 'border-cyan-500 bg-slate-800/80' 
                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${role.gradient} flex items-center justify-center text-2xl`}>
                      {role.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{role.title}</h3>
                      <p className="text-slate-400 text-sm">{role.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Key Features:</h4>
                    <ul className="space-y-1">
                      {role.features.map((feature, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-2 text-sm text-slate-400"
                        >
                          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {selectedRole === role.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center py-2"
                    >
                      <div className="flex items-center space-x-2 text-cyan-400">
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Setting up your dashboard...</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 hover:opacity-5 transition-opacity rounded-lg`} />
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            You can switch roles anytime from your profile settings
          </p>
        </div>
      </div>
    );
  }
);

RoleSelector.displayName = 'RoleSelector';

export { RoleSelector };