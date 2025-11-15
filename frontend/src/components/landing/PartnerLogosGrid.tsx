import { motion } from "framer-motion";

interface Partner {
  name: string;
  logo: string;
}

const partners: Partner[] = [
  { name: "Solana", logo: "SOL" },
  { name: "ZetaChain", logo: "ZETA" },
  { name: "Arcanum AI", logo: "ARC" },
  { name: "zkMe", logo: "zkMe" },
  { name: "Pinata", logo: "PIN" },
  { name: "IPFS", logo: "IPFS" },
];

export const PartnerLogosGrid = () => {
  return (
    <section className="relative py-16 px-6 bg-gradient-to-b from-black to-primary-background overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-400 mb-2">
            Powered By Industry Leaders
          </h3>
        </motion.div>

        {/* Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className="group"
            >
              <div className="relative p-6 rounded-xl bg-gradient-to-br from-primary-card/30 to-black/30 border border-accent-electric/20 backdrop-blur-sm hover:border-accent-electric/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent-electric/20">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent-electric to-accent-cyan rounded-xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300" />
                
                {/* Logo placeholder - replace with actual logos */}
                <div className="relative flex items-center justify-center h-16">
                  <span className="text-2xl font-bold text-gray-400 group-hover:text-accent-electric transition-colors">
                    {partner.logo}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
