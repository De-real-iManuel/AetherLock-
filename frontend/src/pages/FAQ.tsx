import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface FAQItem {
  question: string;
  answer: string;
  category: "escrow" | "ai" | "security" | "kyc" | "fees" | "technical";
}

const faqData: FAQItem[] = [
  // Escrow Category
  {
    question: "How does AetherLock's escrow system work?",
    answer: "AetherLock uses blockchain-based smart contracts to hold funds securely until work is verified. When a client creates an escrow, funds are locked in the smart contract. After the freelancer submits work and it passes AI verification, the client has a dispute period to review. If no dispute is raised, funds are automatically released to the freelancer.",
    category: "escrow"
  },
  {
    question: "What happens if I'm not satisfied with the delivered work?",
    answer: "After AI verification, you have a dispute period (typically 48-72 hours) to review the work. If you're not satisfied, you can open a dispute by providing your reasons and evidence. The dispute will be reviewed, and a resolution will be determined based on the evidence from both parties.",
    category: "escrow"
  },
  {
    question: "Can I create milestones for my escrow?",
    answer: "Yes! When creating an escrow, you can divide the project into multiple milestones with specific deliverables and payment percentages. Each milestone is verified independently, allowing for incremental payments as work progresses.",
    category: "escrow"
  },
  {
    question: "What blockchains does AetherLock support?",
    answer: "AetherLock currently supports Solana, ZetaChain, Sui, and TON blockchains. You can connect using Phantom, MetaMask, Sui Wallet, or TON Wallet. Each blockchain offers different transaction speeds and fee structures.",
    category: "escrow"
  },
  // AI Category
  {
    question: "How does AI verification work?",
    answer: "AetherLock uses Arcanum.ai to analyze submitted work against the escrow requirements. The AI examines evidence files, descriptions, and deliverables to assess quality, completeness, and accuracy. It provides a confidence score (0-100) and detailed feedback on the submission.",
    category: "ai"
  },
  {
    question: "What is the AI confidence score?",
    answer: "The confidence score is a 0-100 rating that indicates how well the submitted work meets the requirements. Scores 71+ are considered passing, 41-70 require review, and 0-40 indicate significant issues. The score is based on quality, completeness, and accuracy metrics.",
    category: "ai"
  },
  {
    question: "Can the AI make mistakes?",
    answer: "While our AI is highly accurate, it's not infallible. That's why we have a dispute period after AI verification. Clients can review the AI's assessment and open a dispute if they disagree. The AI provides suggestions and detailed analysis to help both parties understand the evaluation.",
    category: "ai"
  },
  {
    question: "What types of work can the AI verify?",
    answer: "The AI can verify various types of deliverables including code, designs, documents, videos, and other digital assets. It analyzes file content, metadata, and descriptions to assess whether requirements are met. Complex or subjective work may require additional human review.",
    category: "ai"
  },
  // Security Category
  {
    question: "Is my wallet secure on AetherLock?",
    answer: "Yes. AetherLock never stores your private keys or has access to your wallet. All transactions require your explicit approval through your wallet extension. We use wallet signature verification for authentication, ensuring only you can access your account.",
    category: "security"
  },
  {
    question: "How is my data protected?",
    answer: "All sensitive data is encrypted at rest and in transit using industry-standard protocols. We use HTTPS for all API requests and WSS for WebSocket connections. Files uploaded to IPFS are stored on decentralized infrastructure, and we implement rate limiting and input validation to prevent attacks.",
    category: "security"
  },
  {
    question: "What happens if there's a smart contract bug?",
    answer: "Our smart contracts undergo rigorous security audits before deployment. They include emergency pause functionality and reentrancy guards. In the unlikely event of a critical bug, we have procedures to protect user funds and migrate to updated contracts.",
    category: "security"
  },
  // KYC Category
  {
    question: "Why do I need to complete KYC verification?",
    answer: "KYC (Know Your Customer) verification helps maintain platform integrity and trust. It prevents fraud, ensures compliance with regulations, and builds confidence between clients and freelancers. Verified users have higher trust scores and access to premium features.",
    category: "kyc"
  },
  {
    question: "How long does KYC verification take?",
    answer: "KYC verification through zkMe is typically instant to a few minutes. The process uses zero-knowledge proofs to verify your identity without exposing sensitive personal information. You'll receive immediate feedback on your verification status.",
    category: "kyc"
  },
  {
    question: "What if my KYC verification is rejected?",
    answer: "If your KYC verification is rejected, you'll receive specific reasons for the rejection. You can re-attempt verification after addressing the issues. Common reasons include unclear documents, mismatched information, or technical issues during the verification process.",
    category: "kyc"
  },
  {
    question: "Is my personal information shared with others?",
    answer: "No. We use zkMe's zero-knowledge proof technology, which verifies your identity without storing or sharing your personal information. Only your verification status (verified/not verified) is recorded on our platform.",
    category: "kyc"
  },
  // Fees Category
  {
    question: "What fees does AetherLock charge?",
    answer: "AetherLock charges a small platform fee (typically 2-3%) on completed transactions. This covers AI verification, IPFS storage, and platform maintenance. Blockchain transaction fees (gas fees) are separate and paid directly to the network.",
    category: "fees"
  },
  {
    question: "Who pays the transaction fees?",
    answer: "Transaction fees are typically split between parties or included in the escrow amount. The client pays fees when creating the escrow, and the freelancer pays fees when withdrawing funds. Specific fee structures depend on the blockchain used.",
    category: "fees"
  },
  {
    question: "Are there any hidden fees?",
    answer: "No. All fees are clearly displayed before you confirm any transaction. This includes platform fees, blockchain gas fees, and any applicable network charges. We believe in complete transparency regarding costs.",
    category: "fees"
  },
  // Technical Category
  {
    question: "What file types can I upload as evidence?",
    answer: "You can upload images (JPG, PNG, GIF), documents (PDF, DOC, DOCX), videos (MP4, MOV), archives (ZIP, RAR), and code files. Maximum file size is 100MB per file. All files are stored on IPFS for decentralized, permanent storage.",
    category: "technical"
  },
  {
    question: "How do I connect my wallet?",
    answer: "Click the 'Connect Wallet' button in the navigation bar, select your wallet type (Phantom, MetaMask, Sui, or TON), and approve the connection in your wallet extension. Make sure you have the wallet extension installed in your browser.",
    category: "technical"
  },
  {
    question: "Can I use AetherLock on mobile?",
    answer: "Yes! AetherLock is fully responsive and works on mobile devices. However, for the best experience with wallet connections and file uploads, we recommend using a desktop browser with your wallet extension installed.",
    category: "technical"
  }
];

const categories = [
  { id: "all", label: "All Questions" },
  { id: "escrow", label: "Escrow" },
  { id: "ai", label: "AI Verification" },
  { id: "security", label: "Security" },
  { id: "kyc", label: "KYC" },
  { id: "fees", label: "Fees" },
  { id: "technical", label: "Technical" }
];

/**
 * FAQ Accordion Item Component
 */
const FAQAccordionItem = ({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-accent-electric/20 rounded-lg overflow-hidden backdrop-blur-sm bg-black/40 hover:border-accent-electric/40 transition-colors"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent-electric/5 transition-colors"
      >
        <span className="text-lg font-medium text-white pr-4">{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-accent-electric" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t border-accent-electric/10 text-gray-300 leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * FAQ Page Component
 * 
 * Features:
 * - 20 FAQ items across 6 categories
 * - Category filtering
 * - Search functionality
 * - Accordion-style expandable answers
 * - Responsive design
 */
export const FAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search by 300ms
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(null);

  // Filter FAQs based on category and search query (using debounced value for better performance)
  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = 
      debouncedSearchQuery === "" ||
      item.question.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="relative pt-24 pb-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-electric/5 via-transparent to-accent-purple/5 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-accent-electric via-accent-cyan to-accent-purple bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Find answers to common questions about AetherLock's escrow platform, AI verification, and security features.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-black/60 border-accent-electric/30 focus:border-accent-electric text-white placeholder:text-gray-500"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-accent-electric to-accent-cyan text-black shadow-neon"
                    : "bg-black/60 text-gray-400 border border-accent-electric/20 hover:border-accent-electric/40 hover:text-white"
                }`}
              >
                {category.label}
              </button>
            ))}
          </motion.div>

          {/* FAQ List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto space-y-4"
          >
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item, index) => (
                <FAQAccordionItem
                  key={index}
                  item={item}
                  isOpen={openItemIndex === index}
                  onToggle={() => setOpenItemIndex(openItemIndex === index ? null : index)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No questions found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 text-accent-electric hover:text-accent-cyan transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto mt-16 text-center"
          >
            <div className="border border-accent-electric/20 rounded-lg p-8 backdrop-blur-sm bg-black/40">
              <h3 className="text-2xl font-bold text-white mb-3">Still have questions?</h3>
              <p className="text-gray-400 mb-6">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-black font-semibold rounded-lg hover:shadow-neon-lg transition-all hover:scale-105"
              >
                Contact Support
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
