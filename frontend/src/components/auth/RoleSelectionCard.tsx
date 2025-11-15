import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle, Briefcase, Code, TrendingUp, Shield, Zap, Users } from 'lucide-react';

interface RoleSelectionCardProps {
  role: 'client' | 'freelancer';
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  onSelect: (role: 'client' | 'freelancer') => void;
  isSelected?: boolean;
  className?: string;
}

/**
 * Role Selection Card Component
 * Displays role option with features and animated selection
 */
export const RoleSelectionCard: React.FC<RoleSelectionCardProps> = ({
  role,
  title,
  description,
  features,
  icon,
  onSelect,
  isSelected = false,
  className
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    onSelect(role);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative cursor-pointer rounded-xl border-2 transition-all duration-300",
        isSelected
          ? "border-accent-electric bg-accent-electric/10 shadow-neon-lg"
          : "border-accent-electric/30 bg-primary-card/50 hover:border-accent-electric/60 hover:bg-primary-card/70",
        className
      )}
      onClick={handleClick}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />

      {/* Selected checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isSelected ? 1 : 0,
          opacity: isSelected ? 1 : 0
        }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.5 }}
        className="absolute -top-3 -right-3 z-10"
      >
        <div className="bg-accent-electric rounded-full p-1 shadow-neon">
          <CheckCircle className="h-6 w-6 text-black" />
        </div>
      </motion.div>

      {/* Glow effect on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered || isSelected ? 1 : 0 }}
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-electric/10 via-accent-cyan/10 to-accent-electric/10 pointer-events-none"
      />

      <div className="relative p-6 space-y-4">
        {/* Icon and Title */}
        <div className="flex items-start space-x-4">
          <motion.div
            animate={{
              scale: isHovered || isSelected ? 1.1 : 1,
              rotate: isHovered ? 5 : 0
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className={cn(
              "p-3 rounded-lg transition-colors",
              isSelected
                ? "bg-accent-electric/20 text-accent-electric"
                : "bg-accent-electric/10 text-accent-cyan"
            )}
          >
            {icon}
          </motion.div>
          
          <div className="flex-1">
            <h3 className={cn(
              "text-xl font-display font-bold transition-colors",
              isSelected ? "text-accent-electric" : "text-white"
            )}>
              {title}
            </h3>
            <p className="text-slate-400 text-sm mt-1">{description}</p>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-2">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-2"
            >
              <motion.div
                animate={{
                  scale: isSelected ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  repeat: isSelected ? 1 : 0
                }}
              >
                <CheckCircle className={cn(
                  "h-4 w-4 mt-0.5 flex-shrink-0",
                  isSelected ? "text-accent-electric" : "text-accent-cyan"
                )} />
              </motion.div>
              <span className="text-slate-300 text-sm">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Hover indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isHovered || isSelected ? "100%" : 0 }}
          className="h-1 bg-gradient-to-r from-accent-electric to-accent-cyan rounded-full"
        />
      </div>
    </motion.div>
  );
};

/**
 * Role Selection Container
 * Displays both client and freelancer role cards
 */
interface RoleSelectionProps {
  onRoleSelect: (role: 'client' | 'freelancer') => void;
  selectedRole?: 'client' | 'freelancer' | null;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  onRoleSelect,
  selectedRole = null
}) => {
  const clientFeatures = [
    'Post projects and escrow agreements',
    'AI-powered work verification',
    'Secure fund management',
    'Real-time chat with freelancers',
    'Dispute resolution system',
    'Multi-chain payment support'
  ];

  const freelancerFeatures = [
    'Browse available projects',
    'Submit work with evidence',
    'Automated payment release',
    'Build your reputation score',
    'Direct client communication',
    'Milestone-based payments'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-white">
          Choose Your Role
        </h2>
        <p className="text-slate-400">
          Select how you want to use AetherLock. You can change this later in settings.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Client Card */}
        <RoleSelectionCard
          role="client"
          title="Client"
          description="Hire talent and manage projects"
          features={clientFeatures}
          icon={<Briefcase className="h-6 w-6" />}
          onSelect={onRoleSelect}
          isSelected={selectedRole === 'client'}
        />

        {/* Freelancer Card */}
        <RoleSelectionCard
          role="freelancer"
          title="Freelancer"
          description="Find work and get paid securely"
          features={freelancerFeatures}
          icon={<Code className="h-6 w-6" />}
          onSelect={onRoleSelect}
          isSelected={selectedRole === 'freelancer'}
        />
      </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-lg bg-primary-card/30 border border-accent-electric/20">
          <TrendingUp className="h-8 w-8 text-accent-electric mb-2" />
          <h4 className="text-white font-semibold mb-1">Build Trust</h4>
          <p className="text-slate-400 text-sm">
            Earn reputation through successful transactions
          </p>
        </div>

        <div className="p-4 rounded-lg bg-primary-card/30 border border-accent-cyan/20">
          <Shield className="h-8 w-8 text-accent-cyan mb-2" />
          <h4 className="text-white font-semibold mb-1">Stay Secure</h4>
          <p className="text-slate-400 text-sm">
            Blockchain-backed escrow protects all parties
          </p>
        </div>

        <div className="p-4 rounded-lg bg-primary-card/30 border border-accent-purple/20">
          <Zap className="h-8 w-8 text-accent-purple mb-2" />
          <h4 className="text-white font-semibold mb-1">Work Fast</h4>
          <p className="text-slate-400 text-sm">
            AI verification speeds up payment release
          </p>
        </div>
      </div>

      {/* Community Stats */}
      <div className="flex items-center justify-center space-x-8 p-6 rounded-lg bg-gradient-to-r from-accent-electric/10 via-accent-cyan/10 to-accent-purple/10 border border-accent-electric/30">
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-electric">10K+</div>
          <div className="text-slate-400 text-sm">Active Users</div>
        </div>
        <div className="h-12 w-px bg-accent-electric/30" />
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-cyan">$5M+</div>
          <div className="text-slate-400 text-sm">In Escrow</div>
        </div>
        <div className="h-12 w-px bg-accent-electric/30" />
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-purple">98%</div>
          <div className="text-slate-400 text-sm">Success Rate</div>
        </div>
      </div>
    </div>
  );
};
