import * as React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function RoleSelector() {
  const navigate = useNavigate();

  const selectRole = (role: 'client' | 'freelancer') => {
    localStorage.setItem('userRole', role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="container mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
        >
          Choose Your Role
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => selectRole('client')}
            className="p-8 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-2xl border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-all"
          >
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">Client</h2>
            <p className="text-slate-300 mb-6">
              Create escrow contracts, hire freelancers, and manage projects with AI-powered verification.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Create secure escrows</li>
              <li>✓ AI verification of deliverables</li>
              <li>✓ 10% protocol fee on release</li>
              <li>✓ Dispute resolution support</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => selectRole('freelancer')}
            className="p-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl border border-purple-500/30 cursor-pointer hover:border-purple-400 transition-all"
          >
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold mb-4 text-purple-400">Freelancer</h2>
            <p className="text-slate-300 mb-6">
              Browse opportunities, submit work, and receive payments securely through blockchain escrow.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Browse escrow opportunities</li>
              <li>✓ Submit deliverables with proof</li>
              <li>✓ Instant payment on approval</li>
              <li>✓ Build reputation score</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
