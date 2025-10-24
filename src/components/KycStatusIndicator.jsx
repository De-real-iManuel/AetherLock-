import React from 'react';
import { CheckCircle, AlertCircle, Shield } from 'lucide-react';

const KycStatusIndicator = ({ kycStatus, compact = false }) => {
  const getStatusConfig = () => {
    if (!kycStatus) {
      return {
        icon: Shield,
        text: 'KYC Required',
        color: 'text-gray-400',
        bgColor: 'bg-gray-800/50',
        borderColor: 'border-gray-600',
      };
    }

    if (kycStatus.isVerified) {
      return {
        icon: CheckCircle,
        text: 'KYC Verified',
        color: 'text-green-400',
        bgColor: 'bg-green-900/20',
        borderColor: 'border-green-500/30',
      };
    }

    return {
      icon: AlertCircle,
      text: 'KYC Pending',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30',
    };
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}>
        <IconComponent className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center space-x-3">
        <IconComponent className={`w-6 h-6 ${config.color}`} />
        <div className="flex-1">
          <h4 className={`font-medium ${config.color}`}>{config.text}</h4>
          {kycStatus?.isVerified && (
            <p className="text-gray-400 text-sm">
              Verified {new Date(kycStatus.verifiedAt).toLocaleDateString()}
            </p>
          )}
          {!kycStatus && (
            <p className="text-gray-400 text-sm">
              Complete KYC to participate in escrows
            </p>
          )}
        </div>
        {kycStatus?.isVerified && (
          <div className="text-right">
            <p className="text-gray-400 text-xs">Expires</p>
            <p className="text-white text-sm">
              {new Date(kycStatus.expiresAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycStatusIndicator;