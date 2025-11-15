import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, FileText, AlertCircle } from "lucide-react";

/**
 * Terms of Service Page Component
 * 
 * Displays the platform's terms of service with sections covering:
 * - Acceptance of terms
 * - User accounts and responsibilities
 * - Escrow services
 * - AI verification
 * - Fees and payments
 * - Dispute resolution
 * - Liability and warranties
 */
export const Terms = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="relative pt-24 pb-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-electric/5 via-transparent to-accent-purple/5 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-accent-electric/10 border border-accent-electric/30">
                <FileText className="w-12 h-12 text-accent-electric" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-accent-electric via-accent-cyan to-accent-purple bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Last Updated: November 15, 2025
            </p>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 p-6 border border-accent-cyan/30 rounded-lg bg-accent-cyan/5 backdrop-blur-sm"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-accent-cyan flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-accent-cyan font-semibold text-lg mb-2">Important Notice</h3>
                <p className="text-gray-300 leading-relaxed">
                  Please read these Terms of Service carefully before using AetherLock. By accessing or using our platform, you agree to be bound by these terms. If you do not agree with any part of these terms, you may not use our services.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Terms Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 text-gray-300"
          >
            {/* Section 1 */}
            <section className="border-l-4 border-accent-electric pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4 leading-relaxed">
                By creating an account, connecting your wallet, or using any part of the AetherLock platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            {/* Section 2 */}
            <section className="border-l-4 border-accent-cyan pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">2. User Accounts and Responsibilities</h2>
              <p className="mb-4 leading-relaxed">
                To use AetherLock, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Connect a supported blockchain wallet (Phantom, MetaMask, Sui Wallet, or TON Wallet)</li>
                <li>Complete KYC verification through our zkMe integration</li>
                <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your wallet and private keys</li>
              </ul>
              <p className="leading-relaxed">
                You are solely responsible for all activities that occur under your account. AetherLock does not have access to your private keys and cannot recover lost or stolen funds.
              </p>
            </section>

            {/* Section 3 */}
            <section className="border-l-4 border-accent-purple pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">3. Escrow Services</h2>
              <p className="mb-4 leading-relaxed">
                AetherLock provides blockchain-based escrow services that:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Hold funds in smart contracts until work is verified and approved</li>
                <li>Support multiple blockchains including Solana, ZetaChain, Sui, and TON</li>
                <li>Allow milestone-based payments for complex projects</li>
                <li>Provide dispute resolution mechanisms</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                By creating or accepting an escrow agreement, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide clear and accurate project requirements (clients)</li>
                <li>Deliver work that meets the stated requirements (freelancers)</li>
                <li>Respond to disputes and verification requests in a timely manner</li>
                <li>Accept the results of AI verification and dispute resolution processes</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="border-l-4 border-accent-electric pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">4. AI Verification</h2>
              <p className="mb-4 leading-relaxed">
                AetherLock uses Arcanum.ai to automatically verify submitted work. The AI verification process:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Analyzes deliverables against stated requirements</li>
                <li>Provides confidence scores and detailed feedback</li>
                <li>Is not infallible and may require human review in complex cases</li>
                <li>Serves as an initial assessment, not a final judgment</li>
              </ul>
              <p className="leading-relaxed">
                Clients have a dispute period after AI verification to review and contest results. Both parties agree to use AI verification as a primary assessment tool while maintaining the right to dispute.
              </p>
            </section>

            {/* Section 5 */}
            <section className="border-l-4 border-accent-cyan pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">5. Fees and Payments</h2>
              <p className="mb-4 leading-relaxed">
                AetherLock charges the following fees:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Platform fee: 2-3% of transaction value</li>
                <li>Blockchain gas fees: Paid directly to the network</li>
                <li>IPFS storage fees: Included in platform fee</li>
              </ul>
              <p className="leading-relaxed">
                All fees are clearly displayed before transaction confirmation. Fees are non-refundable except in cases of platform error or malfunction.
              </p>
            </section>

            {/* Section 6 */}
            <section className="border-l-4 border-accent-purple pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">6. Dispute Resolution</h2>
              <p className="mb-4 leading-relaxed">
                If a dispute arises:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>The client must initiate the dispute within the specified dispute period</li>
                <li>Both parties must provide evidence and reasoning</li>
                <li>Disputes are reviewed based on the original requirements and submitted evidence</li>
                <li>Resolution decisions are final and binding</li>
              </ul>
              <p className="leading-relaxed">
                Repeated frivolous disputes may result in account suspension or termination.
              </p>
            </section>

            {/* Section 7 */}
            <section className="border-l-4 border-accent-electric pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
              <p className="mb-4 leading-relaxed">
                Unless otherwise specified in the escrow agreement:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Freelancers retain ownership of work until payment is released</li>
                <li>Clients receive full rights to deliverables upon successful payment</li>
                <li>Files uploaded to IPFS are stored permanently and publicly accessible</li>
              </ul>
              <p className="leading-relaxed">
                Users are responsible for ensuring they have the right to upload and share all content on the platform.
              </p>
            </section>

            {/* Section 8 */}
            <section className="border-l-4 border-accent-cyan pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <p className="mb-4 leading-relaxed">
                AetherLock provides the platform "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Loss of funds due to user error, wallet compromise, or blockchain issues</li>
                <li>Disputes between clients and freelancers</li>
                <li>Quality or accuracy of work delivered through the platform</li>
                <li>Smart contract bugs or vulnerabilities (though we conduct security audits)</li>
                <li>Third-party service failures (blockchain networks, IPFS, AI services)</li>
              </ul>
              <p className="leading-relaxed">
                Our total liability is limited to the platform fees paid for the specific transaction in question.
              </p>
            </section>

            {/* Section 9 */}
            <section className="border-l-4 border-accent-purple pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">9. Prohibited Activities</h2>
              <p className="mb-4 leading-relaxed">
                Users may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the platform for illegal activities or prohibited services</li>
                <li>Attempt to manipulate AI verification or dispute processes</li>
                <li>Create multiple accounts to circumvent restrictions</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Attempt to exploit vulnerabilities in smart contracts or platform code</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="border-l-4 border-accent-electric pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms, engage in prohibited activities, or pose a risk to the platform or other users. Users may close their accounts at any time, subject to completion of active escrow agreements.
              </p>
            </section>

            {/* Section 11 */}
            <section className="border-l-4 border-accent-cyan pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law</h2>
              <p className="leading-relaxed">
                These terms are governed by the laws of the jurisdiction in which AetherLock is registered. Any disputes arising from these terms or use of the platform shall be resolved through binding arbitration.
              </p>
            </section>

            {/* Section 12 */}
            <section className="border-l-4 border-accent-purple pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-black/60 rounded-lg border border-accent-electric/20">
                <p className="text-white">Email: legal@aetherlock.app</p>
                <p className="text-white">Support: support@aetherlock.app</p>
              </div>
            </section>
          </motion.div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 p-8 border border-accent-electric/20 rounded-lg backdrop-blur-sm bg-black/40 text-center"
          >
            <Shield className="w-12 h-12 text-accent-electric mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Your Security is Our Priority</h3>
            <p className="text-gray-400 mb-6">
              We're committed to providing a safe and transparent platform for all users.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/privacy"
                className="px-6 py-3 border border-accent-electric text-accent-electric rounded-lg hover:bg-accent-electric hover:text-black transition-all"
              >
                Privacy Policy
              </a>
              <a
                href="/faq"
                className="px-6 py-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-black font-semibold rounded-lg hover:shadow-neon-lg transition-all"
              >
                Read FAQ
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
