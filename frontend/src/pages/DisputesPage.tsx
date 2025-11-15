import * as React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DisputesPage() {
  const [selectedDispute, setSelectedDispute] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState('');

  const disputes = [
    { id: 1, escrowId: 'ESC001', reason: 'Incomplete work', status: 'open', amount: 500 },
    { id: 2, escrowId: 'ESC002', reason: 'Quality issues', status: 'mediation', amount: 1200 },
    { id: 3, escrowId: 'ESC003', reason: 'Late delivery', status: 'resolved', amount: 300 },
  ];

  return (
    <div className="min-h-screen">
      <nav className="border-b border-neon-blue/20 p-4 flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg" />
          <span className="font-bold">AetherLock</span>
        </Link>
        <Link to="/dashboard" className="hover:text-neon-blue">Dashboard</Link>
        <Link to="/disputes" className="text-neon-blue">Disputes</Link>
      </nav>

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 glow-text flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" />
          Dispute Center
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            {disputes.map((dispute) => (
              <motion.div
                key={dispute.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedDispute(dispute.id)}
                className={`p-4 glow-border rounded-xl cursor-pointer ${
                  selectedDispute === dispute.id ? 'bg-neon-blue/10' : 'bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{dispute.escrowId}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    dispute.status === 'open' ? 'bg-yellow-500/20 text-yellow-500' :
                    dispute.status === 'mediation' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {dispute.status}
                  </span>
                </div>
                <div className="text-sm text-slate-400">{dispute.reason}</div>
                <div className="text-neon-purple font-bold mt-2">${dispute.amount}</div>
              </motion.div>
            ))}
          </div>

          <div className="md:col-span-2 glow-border rounded-xl p-6 bg-slate-900/50">
            {selectedDispute ? (
              <>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="text-neon-blue" />
                  AI-Assisted Mediation
                </h2>
                
                <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-slate-800/50 rounded-lg">
                  <div className="p-3 bg-neon-blue/20 rounded-lg max-w-[80%]">
                    Dispute raised: Work incomplete
                  </div>
                  <div className="p-3 bg-neon-purple/20 rounded-lg max-w-[80%] ml-auto">
                    AI analyzing evidence...
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the issue..."
                    className="flex-1 p-3 bg-slate-800 rounded-lg"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="p-3 bg-neon-blue text-black rounded-lg"
                  >
                    <Send size={20} />
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Select a dispute to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
