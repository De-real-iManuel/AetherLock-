import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  project: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Web3 Developer",
    avatar: "SC",
    rating: 5,
    text: "AetherLock's AI verification saved me countless hours of dispute resolution. The smart contracts work flawlessly, and I love the transparency of the entire process.",
    project: "DeFi Dashboard Development",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Blockchain Consultant",
    avatar: "MR",
    rating: 5,
    text: "As a client, I finally have peace of mind. The zkMe KYC integration ensures I'm working with verified freelancers, and the AI verification is incredibly accurate.",
    project: "NFT Marketplace Integration",
  },
  {
    id: 3,
    name: "Aisha Patel",
    role: "Smart Contract Auditor",
    avatar: "AP",
    rating: 5,
    text: "The multi-chain support is a game-changer. Being able to work across Solana and ZetaChain with the same escrow platform is exactly what the industry needs.",
    project: "Cross-Chain Bridge Audit",
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Full-Stack Developer",
    avatar: "JW",
    rating: 5,
    text: "I've used traditional escrow services before, but AetherLock's speed and low fees are unmatched. Plus, the IPFS storage means my work is permanently documented.",
    project: "dApp Development",
  },
  {
    id: 5,
    name: "Elena Volkov",
    role: "UI/UX Designer",
    avatar: "EV",
    rating: 5,
    text: "The trust score system helped me build my reputation quickly. Now I get more high-value projects because clients can see my verified track record.",
    project: "Crypto Wallet Design",
  },
];

// Star Rating Component with animated fill
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: star * 0.1, duration: 0.3 }}
        >
          <Star
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-600 text-gray-600"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary-card/80 to-black/80 border border-accent-electric/30 backdrop-blur-xl shadow-2xl">
        {/* Quote decoration */}
        <div className="absolute top-4 left-4 text-6xl text-accent-electric/20 font-serif">
          "
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Avatar and Info */}
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-electric to-accent-cyan rounded-full blur-md opacity-50" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center text-white font-bold text-xl">
                {testimonial.avatar}
              </div>
            </div>

            {/* Name and Role */}
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white">{testimonial.name}</h4>
              <p className="text-gray-400">{testimonial.role}</p>
            </div>

            {/* Rating */}
            <div>
              <StarRating rating={testimonial.rating} />
            </div>
          </div>

          {/* Testimonial Text */}
          <p className="text-lg text-gray-300 leading-relaxed mb-4 italic">
            {testimonial.text}
          </p>

          {/* Project Tag */}
          <div className="inline-block px-4 py-2 rounded-full bg-accent-electric/10 border border-accent-electric/30 text-accent-electric text-sm font-semibold">
            Project: {testimonial.project}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-4 right-4 text-6xl text-accent-cyan/20 font-serif rotate-180">
          "
        </div>
      </div>
    </motion.div>
  );
};

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (isAutoPlaying) {
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-black via-primary-background to-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-cyan rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-accent-electric to-accent-cyan bg-clip-text text-transparent">
              Users Say
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied clients and freelancers who trust AetherLock
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Testimonial Card */}
          <AnimatePresence mode="wait">
            <TestimonialCard
              key={currentIndex}
              testimonial={testimonials[currentIndex]}
            />
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
            <button
              onClick={handlePrevious}
              className="pointer-events-auto w-12 h-12 rounded-full bg-primary-card/80 border border-accent-electric/30 backdrop-blur-sm flex items-center justify-center text-accent-electric hover:bg-accent-electric/20 hover:border-accent-electric transition-all duration-300 shadow-lg hover:shadow-accent-electric/50"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="pointer-events-auto w-12 h-12 rounded-full bg-primary-card/80 border border-accent-electric/30 backdrop-blur-sm flex items-center justify-center text-accent-electric hover:bg-accent-electric/20 hover:border-accent-electric transition-all duration-300 shadow-lg hover:shadow-accent-electric/50"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-accent-electric w-8"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="text-center mt-4">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            {isAutoPlaying ? "Pause" : "Resume"} auto-play
          </button>
        </div>
      </div>
    </section>
  );
};
