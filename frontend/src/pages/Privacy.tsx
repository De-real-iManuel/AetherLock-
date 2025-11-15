import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Lock, Eye, Database, Shield } from "lucide-react";

/**
 * Privacy Policy Page Component
 * 
 * Displays the platform's privacy policy covering:
 * - Data collection and usage
 * - KYC and identity verification
 * - Blockchain transparency
 * - Third-party services
 * - User rights and data protection
 */
export const Privacy = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="relative pt-24 pb-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/5 via-transparent to-accent-electric/5 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-accent-purple/10 border border-accent-purple/30">
                <Lock className="w-12 h-12 text-accent-purple" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-electric bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Last Updated: November 15, 2025
            </p>
          </motion.div>

          {/* Key Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 grid md:grid-cols-3 gap-4"
          >
            <div className="p-4 border border-accent-electric/20 rounded-lg bg-black/40 backdrop-blur-sm text-center">
              <Eye className="w-8 h-8 text-accent-electric mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Zero-Knowledge KYC</h3>
              <p className="text-gray-400 text-sm">Your identity is verified without exposing personal data</p>
            </div>
            <div className="p-4 border border-accent-cyan/20 rounded-lg bg-black/40 backdrop-blur-sm text-center">
              <Database className="w-8 h-8 text-accent-cyan mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Minimal Data</h3>
              <p className="text-gray-400 text-sm">We only collect what's necessary for platform operation</p>
            </div>
            <div className="p-4 border border-accent-purple/20 rounded-lg bg-black/40 backdrop-blur-sm text-center">
              <Shield className="w-8 h-8 text-accent-purple mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Encrypted Storage</h3>
              <p className="text-gray-400 text-sm">All data is encrypted at rest and in transit</p>
            </div>
          </motion.div>

          {/* Privacy Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 text-gray-300"
          >
            {/* Section 1 */}
            <section className="border-l-4 border-accent-purple pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="mb-4 leading-relaxed">
                At AetherLock, we take your privacy seriously. This Privacy Policy explains how we collect, use, store, and protect your information when you use our blockchain-based escrow platform.
              </p>
              <p className="leading-relaxed">
                By using AetherLock, you agree to the collection and use of information in accordance with this policy. We are committed to transparency and giving you control over your data.
              </p>
            </section>

            {/* Section 2 */}
            <section className="border-l-4 border-accent-electric pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.1 Wallet Information</h3>
              <p className="mb-4 leading-relaxed">
                When you connect your wallet, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Your public wallet address</li>
                <li>Blockchain network information</li>
                <li>Transaction signatures for authentication</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                We do NOT collect or have access to your private keys or seed phrases.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.2 KYC Verification Data</h3>
              <p className="mb-4 leading-relaxed">
                Through our zkMe integration, we verify your identity using zero-knowledge proofs. This means:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Your identity is verified without us storing your personal documents</li>
                <li>We only receive a verification status (verified/not verified)</li>
                <li>Your sensitive personal information remains with zkMe's secure system</li>
                <li>We store your KYC level and verification timestamp</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.3 Platform Usage Data</h3>
              <p className="mb-4 leading-relaxed">
                To improve our services, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Escrow creation and transaction data</li>
                <li>Chat messages (encrypted and stored temporarily)</li>
                <li>Files uploaded to IPFS (stored on decentralized network)</li>
                <li>Platform interaction analytics (pages visited, features used)</li>
                <li>Device and browser information</li>
                <li>IP address and location data (for security purposes)</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="border-l-4 border-accent-cyan pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4 leading-relaxed">
                We use collected information to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain escrow services</li>
                <li>Verify user identity and prevent fraud</li>
                <li>Process transactions and facilitate payments</li>
                <li>Enable communication between clients and freelancers</li>
                <li>Improve platform features and user experience</li>
                <li>Comply with legal obligations and regulations</li>
                <li>Detect and prevent security threats</li>
                <li>Send important notifications about your escrows</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="border-l-4 border-accent-purple pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">4. Blockchain Transparency</h2>
              <p className="mb-4 leading-relaxed">
                Important: Blockchain transactions are public and permanent. When you use AetherLock:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Your wallet address and transaction history are publicly visible on the blockchain</li>
                <li>Escrow smart contract interactions are recorded permanently</li>
                <li>Files uploaded to IPFS are publicly accessible via their hash</li>
                <li>This transparency is inherent to blockchain technology and cannot be changed</li>
              </ul>
              <p className="leading-relaxed">
                We recommend using separate wallets for different purposes if you want to maintain privacy between activities.
              </p>
            </section>

            {/* Section 5 */}
            <section className="border-l-4 border-accent-electric pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
              <p className="mb-4 leading-relaxed">
                AetherLock integrates with several third-party services:
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-4">5.1 zkMe (KYC Verification)</h3>
              <p className="mb-4 leading-relaxed">
                Handles identity verification using zero-knowledge proofs. See zkMe's privacy policy for details on how they process verification data.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-4">5.2 Arcanum.ai (Work Verification)</h3>
              <p className="mb-4 leading-relaxed">
                Analyzes submitted work and evidence files. Work descriptions and file metadata are sent to Arcanum for AI analysis.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-4">5.3 Pinata (IPFS Storage)</h3>
              <p className="mb-4 leading-relaxed">
                Stores uploaded files on IPFS. Files are publicly accessible but not indexed or searchable without the IPFS hash.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-4">5.4 Blockchain Networks</h3>
              <p className="leading-relaxed">
                Transactions are processed on Solana, ZetaChain, Sui, or TON networks. Each network has its own data handling practices.
              </p>
            </section>

            {/* Section 6 */}
            <section className="border-l-4 border-accent-cyan pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
              <p className="mb-4 leading-relaxed">
                We implement industry-standard security measures:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>All data transmitted over HTTPS and WSS (encrypted connections)</li>
                <li>Database encryption at rest</li>
                <li>Regular security audits of smart contracts</li>
                <li>Rate limiting and DDoS protection</li>
                <li>Input validation and sanitization to prevent attacks</li>
                <li>Secure authentication using wallet signatures</li>
              </ul>
              <p className="leading-relaxed">
                However, no method of transmission or storage is 100% secure. You are responsible for maintaining the security of your wallet and private keys.
              </p>
            </section>

            {/* Section 7 */}
            <section className="border-l-4 border-accent-purple pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
              <p className="mb-4 leading-relaxed">
                We retain your data as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Account data: Until you request deletion or account closure</li>
                <li>Transaction records: Indefinitely for legal and audit purposes</li>
                <li>Chat messages: 90 days after escrow completion</li>
                <li>IPFS files: Permanently (decentralized storage)</li>
                <li>Blockchain data: Permanently (immutable ledger)</li>
              </ul>
              <p className="leading-relaxed">
                Note that blockchain and IPFS data cannot be deleted due to the nature of these technologies.
              </p>
            </section>

            {/* Section 8 */}
            <section className="border-l-4 border-accent-electric pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
              <p className="mb-4 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Access your personal data stored on our platform</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account (subject to legal requirements)</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data in a portable format</li>
                <li>Object to certain data processing activities</li>
              </ul>
              <p className="leading-relaxed">
                To exercise these rights, contact us at privacy@aetherlock.app. Note that some data (blockchain transactions, IPFS files) cannot be deleted.
              </p>
            </section>

            {/* Section 9 */}
            <section className="border-l-4 border-accent-cyan pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">9. Cookies and Tracking</h2>
              <p className="mb-4 leading-relaxed">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Maintain your session and authentication state</li>
                <li>Remember your preferences (theme, language)</li>
                <li>Analyze platform usage and performance</li>
                <li>Improve user experience</li>
              </ul>
              <p className="leading-relaxed">
                You can control cookie settings in your browser, but some features may not work properly if cookies are disabled.
              </p>
            </section>

            {/* Section 10 */}
            <section className="border-l-4 border-accent-purple pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
              <p className="leading-relaxed">
                AetherLock is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* Section 11 */}
            <section className="border-l-4 border-accent-electric pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">11. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy and applicable laws.
              </p>
            </section>

            {/* Section 12 */}
            <section className="border-l-4 border-accent-cyan pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last Updated" date. Continued use of the platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Section 13 */}
            <section className="border-l-4 border-accent-purple pl-6">
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
              <p className="leading-relaxed mb-4">
                If you have questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div className="p-4 bg-black/60 rounded-lg border border-accent-electric/20">
                <p className="text-white">Email: privacy@aetherlock.app</p>
                <p className="text-white">Support: support@aetherlock.app</p>
                <p className="text-white mt-2">Data Protection Officer: dpo@aetherlock.app</p>
              </div>
            </section>
          </motion.div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 p-8 border border-accent-purple/20 rounded-lg backdrop-blur-sm bg-black/40 text-center"
          >
            <Lock className="w-12 h-12 text-accent-purple mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Your Privacy Matters</h3>
            <p className="text-gray-400 mb-6">
              We're committed to protecting your data and being transparent about our practices.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/terms"
                className="px-6 py-3 border border-accent-purple text-accent-purple rounded-lg hover:bg-accent-purple hover:text-black transition-all"
              >
                Terms of Service
              </a>
              <a
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-cyan text-black font-semibold rounded-lg hover:shadow-neon-lg transition-all"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
