import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface DisputeMediationPanelProps {
  escrowId: string;
  dispute: any;
  onResolutionAccepted: (resolution: any) => void;
}

const DisputeMediationPanel = React.forwardRef<HTMLDivElement, DisputeMediationPanelProps>(
  ({ escrowId, dispute, onResolutionAccepted }, ref) => {
    const [isMediating, setIsMediating] = React.useState(false);
    const [mediation, setMediation] = React.useState(null);
    const [activeAgent, setActiveAgent] = React.useState<'buyer' | 'seller' | 'mediator' | null>(null);

    const startMediation = async () => {
      setIsMediating(true);
      
      try {
        // Simulate agent thinking sequence
        setActiveAgent('buyer');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setActiveAgent('seller');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setActiveAgent('mediator');
        
        const response = await fetch('/api/ai/mediate-dispute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dispute })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setMediation(result.mediation);
        }
      } catch (error) {
        console.error('Mediation failed:', error);
      } finally {
        setIsMediating(false);
        setActiveAgent(null);
      }
    };

    const agents = [
      { id: 'buyer', name: 'Buyer Agent', icon: '🛡️', color: 'blue' },
      { id: 'seller', name: 'Seller Agent', icon: '⚔️', color: 'purple' },
      { id: 'mediator', name: 'Neutral Mediator', icon: '⚖️', color: 'green' }
    ];

    return (
      <div ref={ref} className="space-y-6">
        {/* Agent Status */}
        <Card className="p-6 border-slate-700 bg-slate-900/50">
          <h3 className="text-lg font-semibold text-white mb-4">AI Multi-Agent Mediation</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                animate={{
                  scale: activeAgent === agent.id ? 1.05 : 1,
                  opacity: activeAgent === agent.id ? 1 : 0.6
                }}
                className={`p-4 rounded-lg border-2 ${
                  activeAgent === agent.id 
                    ? `border-${agent.color}-500 bg-${agent.color}-500/10` 
                    : 'border-slate-700 bg-slate-800'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{agent.icon}</div>
                  <p className="text-sm font-medium text-white">{agent.name}</p>
                  {activeAgent === agent.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2"
                    >
                      <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-cyan-400 mt-1">Analyzing...</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {!mediation && !isMediating && (
            <Button
              onClick={startMediation}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Start AI Mediation
            </Button>
          )}
        </Card>

        {/* Mediation Results */}
        {mediation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Agent Arguments */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border-blue-500/50 bg-blue-500/5">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🛡️</span>
                  <h4 className="font-semibold text-white">Buyer's Position</h4>
                </div>
                <p className="text-sm text-slate-300">{mediation.buyerPosition?.argument}</p>
              </Card>

              <Card className="p-4 border-purple-500/50 bg-purple-500/5">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">⚔️</span>
                  <h4 className="font-semibold text-white">Seller's Position</h4>
                </div>
                <p className="text-sm text-slate-300">{mediation.sellerPosition?.argument}</p>
              </Card>
            </div>

            {/* Mediator Decision */}
            <Card className="p-6 border-green-500 bg-green-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⚖️</span>
                  <h4 className="font-semibold text-white">Mediator's Decision</h4>
                </div>
                <Badge variant="outline" className="border-green-500 text-green-400">
                  {mediation.mediation.confidence}% Confidence
                </Badge>
              </div>

              {/* Split Visualization */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                  <span>Buyer: {mediation.mediation.split.buyer}%</span>
                  <span>Seller: {mediation.mediation.split.seller}%</span>
                </div>
                <div className="w-full h-8 bg-slate-700 rounded-lg overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mediation.mediation.split.buyer}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                  >
                    {mediation.mediation.split.buyer}%
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mediation.mediation.split.seller}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-purple-500 flex items-center justify-center text-white text-xs font-semibold"
                  >
                    {mediation.mediation.split.seller}%
                  </motion.div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Reasoning:</h5>
                  <p className="text-sm text-slate-400">{mediation.mediation.reasoning}</p>
                </div>

                {mediation.mediation.keyFactors && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Key Factors:</h5>
                    <ul className="space-y-1">
                      {mediation.mediation.keyFactors.map((factor, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-slate-400">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => onResolutionAccepted(mediation.mediation)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Accept Resolution
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 hover:bg-slate-800"
                >
                  Request Human Review
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }
);

DisputeMediationPanel.displayName = 'DisputeMediationPanel';

export { DisputeMediationPanel };