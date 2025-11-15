import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface RiskPredictionCardProps {
  escrowData: any;
}

const RiskPredictionCard = React.forwardRef<HTMLDivElement, RiskPredictionCardProps>(
  ({ escrowData }, ref) => {
    const [prediction, setPrediction] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      predictRisk();
    }, [escrowData]);

    const predictRisk = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/predict-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ escrowData })
        });

        const result = await response.json();
        if (result.success) {
          setPrediction(result.prediction);
        }
      } catch (error) {
        console.error('Risk prediction failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const getRiskColor = (score: number) => {
      if (score < 30) return 'green';
      if (score < 60) return 'yellow';
      return 'red';
    };

    const getRiskLabel = (score: number) => {
      if (score < 30) return 'Low Risk';
      if (score < 60) return 'Medium Risk';
      return 'High Risk';
    };

    if (isLoading) {
      return (
        <Card ref={ref} className="p-6 border-slate-700 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400">Analyzing risk factors...</span>
          </div>
        </Card>
      );
    }

    if (!prediction) return null;

    const riskColor = getRiskColor(prediction.riskScore);

    return (
      <Card ref={ref} className="p-6 border-slate-700 bg-slate-900/50">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">AI Risk Prediction</h3>
            <Badge variant="outline" className={`border-${riskColor}-500 text-${riskColor}-400`}>
              {getRiskLabel(prediction.riskScore)}
            </Badge>
          </div>

          {/* Risk Score Gauge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Risk Score</span>
              <span className={`text-${riskColor}-400 font-semibold`}>{prediction.riskScore}/100</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${prediction.riskScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r from-${riskColor}-500 to-${riskColor}-600`}
              />
            </div>
          </div>

          {/* Success Probability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Success Probability</span>
              <span className="text-green-400 font-semibold">{prediction.successProbability}%</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${prediction.successProbability}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className="h-full bg-gradient-to-r from-green-500 to-green-600"
              />
            </div>
          </div>

          {/* Dynamic Fee */}
          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Recommended Fee</span>
              <span className="text-lg font-semibold text-cyan-400">{prediction.dynamicFee}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Based on risk assessment</p>
          </div>

          {/* Risk Factors */}
          {prediction.riskFactors && prediction.riskFactors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Risk Factors:</h4>
              <ul className="space-y-1">
                {prediction.riskFactors.map((factor, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 text-sm text-slate-400"
                  >
                    <span className={`w-1.5 h-1.5 bg-${riskColor}-500 rounded-full`} />
                    <span>{factor}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {prediction.recommendations.map((rec, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center space-x-2 text-sm text-green-400"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    );
  }
);

RiskPredictionCard.displayName = 'RiskPredictionCard';

export { RiskPredictionCard };