import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface AIVerificationInterfaceProps {
  escrowId: string;
  onVerificationComplete: (result: any) => void;
}

const AIVerificationInterface = React.forwardRef<HTMLDivElement, AIVerificationInterfaceProps>(
  ({ escrowId, onVerificationComplete }, ref) => {
    const [mode, setMode] = React.useState<'ai' | 'direct'>('ai');
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [evidence, setEvidence] = React.useState<File[]>([]);
    const [messages, setMessages] = React.useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const [trialsRemaining, setTrialsRemaining] = React.useState(5);
    const [verificationResult, setVerificationResult] = React.useState(null);

    const handleFileUpload = (files: FileList) => {
      const newFiles = Array.from(files);
      setEvidence(prev => [...prev, ...newFiles]);
    };

    const submitForVerification = async () => {
      if (evidence.length === 0) {
        alert('Please upload evidence files');
        return;
      }

      setIsAnalyzing(true);
      
      try {
        const formData = new FormData();
        evidence.forEach(file => formData.append('files', file));
        formData.append('escrowId', escrowId);
        formData.append('clientReview', inputValue);

        const response = await fetch(`/api/escrow/${escrowId}/verify`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        if (result.success) {
          setVerificationResult(result);
          setTrialsRemaining(prev => prev - 1);
          onVerificationComplete(result);
        }
      } catch (error) {
        console.error('Verification failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    return (
      <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Left Panel - Chat Interface */}
        <Card className="border-slate-700 bg-slate-900/50 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant={mode === 'ai' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('ai')}
                  className={mode === 'ai' ? 'bg-blue-600' : 'border-slate-600'}
                >
                  🤖 AI Mode
                </Button>
                <Button
                  variant={mode === 'direct' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('direct')}
                  className={mode === 'direct' ? 'bg-green-600' : 'border-slate-600'}
                >
                  💬 Direct Chat
                </Button>
              </div>
            </div>
            
            {/* Trial Counter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Verification trials:</span>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < trialsRemaining ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-400">{trialsRemaining}/5</span>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="text-center text-slate-400 py-8">
              Chat interface ready for {mode} mode
            </div>
          </div>
        </Card>

        {/* Right Panel - Verification Zone */}
        <Card className="border-slate-700 bg-slate-900/50 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold text-white">Evidence & Verification</h3>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Upload Evidence
              </label>
              <div
                className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <div className="text-4xl mb-2">📁</div>
                <p className="text-slate-400">Drop files here or click to browse</p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </div>
            </div>

            {/* Evidence List */}
            {evidence.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Uploaded Files ({evidence.length})
                </label>
                {evidence.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <span className="text-sm text-slate-300 truncate">{file.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEvidence(prev => prev.filter((_, i) => i !== index))}
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* AI Analysis */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800 p-4 rounded-lg"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-300">AI Analysis in Progress</span>
                </div>
              </motion.div>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-lg border-2 ${
                  verificationResult.passed
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-red-500 bg-red-500/10'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`text-2xl ${verificationResult.passed ? '✅' : '❌'}`} />
                  <div>
                    <h4 className="font-medium text-white">
                      {verificationResult.passed ? 'Verification Passed' : 'Verification Failed'}
                    </h4>
                    <p className="text-sm text-slate-400">
                      Confidence: {verificationResult.confidence}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{verificationResult.feedback}</p>
              </motion.div>
            )}
          </div>

          {/* Submit Button */}
          <div className="p-4 border-t border-slate-700">
            <Button
              onClick={submitForVerification}
              disabled={evidence.length === 0 || isAnalyzing || trialsRemaining === 0}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600"
            >
              {isAnalyzing ? 'Analyzing...' : 'Submit for AI Verification'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }
);

AIVerificationInterface.displayName = 'AIVerificationInterface';

export { AIVerificationInterface };