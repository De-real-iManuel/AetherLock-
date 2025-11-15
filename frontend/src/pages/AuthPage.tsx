import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useUser } from "../context/UserContext";
import { WalletConnectionModal } from "../components/wallet/WalletConnectionModal";
import { ZkMeKYCWidget } from "../components/kyc/ZkMeKYCWidget";
import { RoleSelectionCard } from "../components/auth/RoleSelectionCard";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, address, chain } = useWallet();
  const { user, updateProfile } = useUser();
  
  const [step, setStep] = useState<"wallet" | "kyc" | "role">("wallet");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showKYCWidget, setShowKYCWidget] = useState(false);

  // Determine initial step based on current state
  useEffect(() => {
    if (!isConnected) {
      setStep("wallet");
    } else if (user?.kycStatus !== "verified") {
      setStep("kyc");
      setShowKYCWidget(true);
    } else if (!user?.role) {
      setStep("role");
    } else {
      // User is fully authenticated, redirect to appropriate dashboard
      handleRedirectAfterAuth();
    }
  }, [isConnected, user]);

  // Handle redirect after successful authentication
  const handleRedirectAfterAuth = () => {
    const from = (location.state as any)?.from?.pathname || null;
    
    if (from) {
      // Redirect back to the page they were trying to access
      navigate(from, { replace: true });
    } else if (user?.role === "client") {
      navigate("/client/dashboard", { replace: true });
    } else if (user?.role === "freelancer") {
      navigate("/freelancer/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // Handle wallet connection
  const handleWalletConnect = async (walletType: string) => {
    setShowWalletModal(false);
    // Wallet connection is handled by WalletConnectionModal
    // After connection, useEffect will update the step
  };

  // Handle KYC completion
  const handleKYCComplete = (status: "verified" | "rejected") => {
    setShowKYCWidget(false);
    if (status === "verified") {
      setStep("role");
    }
  };

  // Handle role selection
  const handleRoleSelect = async (role: "client" | "freelancer") => {
    await updateProfile({ role });
    handleRedirectAfterAuth();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-gradient-to-br from-black via-slate-900 to-black">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-2xl w-full"
      >
        {/* Step 1: Wallet Connection */}
        {step === "wallet" && (
          <div className="rounded-2xl p-8 bg-slate-900/80 backdrop-blur border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Connect Your Wallet
            </h1>
            <p className="text-center text-slate-400 mb-8">
              Choose your preferred wallet to get started with AetherLock
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowWalletModal(true)}
              className="w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Connect Wallet
            </motion.button>
          </div>
        )}

        {/* Step 2: KYC Verification */}
        {step === "kyc" && (
          <div className="rounded-2xl p-8 bg-slate-900/80 backdrop-blur border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Verify Your Identity
            </h1>
            <p className="text-center text-slate-400 mb-8">
              Complete KYC verification with zkMe to access the platform
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-green-500/30">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  ✓
                </div>
                <div>
                  <div className="font-semibold text-white">Wallet Connected</div>
                  <div className="text-sm text-slate-400">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowKYCWidget(true)}
                className="w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
              >
                Start KYC Verification
              </motion.button>
            </div>
          </div>
        )}

        {/* Step 3: Role Selection */}
        {step === "role" && (
          <div className="rounded-2xl p-8 bg-slate-900/80 backdrop-blur border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Choose Your Role
            </h1>
            <p className="text-center text-slate-400 mb-8">
              Select how you want to use AetherLock
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <RoleSelectionCard
                role="client"
                title="Client"
                description="Create escrow agreements and hire freelancers"
                features={[
                  "Create escrow agreements",
                  "AI-powered work verification",
                  "Secure fund management",
                  "Real-time chat with freelancers"
                ]}
                icon={<div className="text-6xl">💼</div>}
                onSelect={handleRoleSelect}
              />
              
              <RoleSelectionCard
                role="freelancer"
                title="Freelancer"
                description="Browse jobs and earn with verified work"
                features={[
                  "Browse available tasks",
                  "Submit work with evidence",
                  "Automated verification",
                  "Build your reputation"
                ]}
                icon={<div className="text-6xl">🚀</div>}
                onSelect={handleRoleSelect}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <WalletConnectionModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletConnect}
        />
      )}

      {/* KYC Widget */}
      {showKYCWidget && address && chain && (
        <ZkMeKYCWidget
          userAddress={address}
          chain={chain}
          onComplete={handleKYCComplete}
          onClose={() => setShowKYCWidget(false)}
        />
      )}
    </div>
  );
}
