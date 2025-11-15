import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, MessageSquare, Send, CheckCircle, Github, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * Contact Page Component
 * 
 * Features:
 * - Contact form with validation
 * - Multiple contact methods
 * - Social media links
 * - Support information
 */
export const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call (replace with actual API endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, send to backend:
      // await api.post('/api/contact', formData);
      
      setIsSubmitted(true);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="relative pt-24 pb-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-cyan/5 via-transparent to-accent-electric/5 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-accent-cyan/10 border border-accent-cyan/30">
                <MessageSquare className="w-12 h-12 text-accent-cyan" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-accent-cyan via-accent-electric to-accent-purple bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have questions or need support? We're here to help. Send us a message and we'll respond within 24 hours.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="border border-accent-electric/20 rounded-lg p-8 backdrop-blur-sm bg-black/40">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-400 mb-6">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-white font-medium mb-2">
                        Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="bg-black/60 border-accent-electric/30 focus:border-accent-electric text-white"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-white font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="bg-black/60 border-accent-electric/30 focus:border-accent-electric text-white"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-white font-medium mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What's this about?"
                        className="bg-black/60 border-accent-electric/30 focus:border-accent-electric text-white"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-white font-medium mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more..."
                        rows={6}
                        className="w-full px-4 py-3 bg-black/60 border border-accent-electric/30 rounded-lg focus:border-accent-electric focus:outline-none focus:ring-1 focus:ring-accent-electric text-white placeholder:text-gray-500 resize-none"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Email */}
              <div className="border border-accent-electric/20 rounded-lg p-6 backdrop-blur-sm bg-black/40">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent-electric/10 border border-accent-electric/30">
                    <Mail className="w-6 h-6 text-accent-electric" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Email Us</h3>
                    <p className="text-gray-400 text-sm mb-2">
                      For general inquiries and support
                    </p>
                    <a
                      href="mailto:support@aetherlock.app"
                      className="text-accent-electric hover:text-accent-cyan transition-colors"
                    >
                      support@aetherlock.app
                    </a>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="border border-accent-cyan/20 rounded-lg p-6 backdrop-blur-sm bg-black/40">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
                    <MessageSquare className="w-6 h-6 text-accent-cyan" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Live Chat</h3>
                    <p className="text-gray-400 text-sm mb-2">
                      Available Monday-Friday, 9am-6pm EST
                    </p>
                    <button className="text-accent-cyan hover:text-accent-electric transition-colors">
                      Start Chat →
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="border border-accent-purple/20 rounded-lg p-6 backdrop-blur-sm bg-black/40">
                <h3 className="text-white font-semibold mb-4">Follow Us</h3>
                <div className="space-y-3">
                  <a
                    href="https://twitter.com/aetherlock"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-400 hover:text-accent-cyan transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </a>
                  <a
                    href="https://github.com/aetherlock"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-400 hover:text-accent-cyan transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://t.me/aetherlock"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-400 hover:text-accent-cyan transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="border border-accent-electric/20 rounded-lg p-6 backdrop-blur-sm bg-black/40 text-center">
                <h3 className="text-white font-semibold mb-2">Need Quick Answers?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Check out our FAQ for instant answers to common questions
                </p>
                <a
                  href="/faq"
                  className="inline-block px-6 py-2 border border-accent-electric text-accent-electric rounded-lg hover:bg-accent-electric hover:text-black transition-all"
                >
                  View FAQ
                </a>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <div className="text-center p-6 border border-accent-electric/20 rounded-lg backdrop-blur-sm bg-black/40">
              <h4 className="text-white font-semibold mb-2">Response Time</h4>
              <p className="text-gray-400 text-sm">
                We typically respond within 24 hours during business days
              </p>
            </div>
            <div className="text-center p-6 border border-accent-cyan/20 rounded-lg backdrop-blur-sm bg-black/40">
              <h4 className="text-white font-semibold mb-2">Support Hours</h4>
              <p className="text-gray-400 text-sm">
                Monday - Friday: 9am - 6pm EST<br />
                Weekend: Limited support
              </p>
            </div>
            <div className="text-center p-6 border border-accent-purple/20 rounded-lg backdrop-blur-sm bg-black/40">
              <h4 className="text-white font-semibold mb-2">Emergency Support</h4>
              <p className="text-gray-400 text-sm">
                For urgent security issues, email security@aetherlock.app
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
