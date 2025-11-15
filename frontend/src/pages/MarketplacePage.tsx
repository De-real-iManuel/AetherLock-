import * as React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketplacePage() {
  const [search, setSearch] = React.useState('');
  const [minPrice, setMinPrice] = React.useState('');

  const jobs = [
    { id: 1, title: 'Website Design', budget: 500, client: '0x1234...5678', skills: ['React', 'Tailwind'] },
    { id: 2, title: 'Smart Contract Audit', budget: 1200, client: '0xabcd...efgh', skills: ['Solidity', 'Security'] },
    { id: 3, title: 'Logo Design', budget: 300, client: '0x9876...5432', skills: ['Design', 'Branding'] },
    { id: 4, title: 'Mobile App', budget: 2000, client: '0x5555...6666', skills: ['React Native', 'API'] },
    { id: 5, title: 'NFT Collection', budget: 800, client: '0x7777...8888', skills: ['Art', 'Blockchain'] },
    { id: 6, title: 'DeFi Protocol', budget: 3000, client: '0x9999...0000', skills: ['Solidity', 'DeFi'] },
  ];

  const filtered = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) &&
    (!minPrice || j.budget >= Number(minPrice))
  );

  return (
    <div className="min-h-screen">
      <nav className="border-b border-neon-blue/20 p-4 flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg" />
          <span className="font-bold">AetherLock</span>
        </Link>
        <Link to="/dashboard" className="hover:text-neon-blue">Dashboard</Link>
        <Link to="/marketplace" className="text-neon-blue">Marketplace</Link>
      </nav>

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 glow-text">Job Marketplace</h1>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 glow-border rounded-lg"
            />
          </div>
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min Budget"
            className="w-32 px-4 py-3 bg-slate-900/50 glow-border rounded-lg"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-3 glow-border rounded-lg flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </motion.button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ y: -5 }}
              className="p-6 glow-border rounded-xl bg-slate-900/50"
            >
              <h3 className="text-xl font-bold mb-2">{job.title}</h3>
              <div className="text-2xl font-bold text-neon-purple mb-3">${job.budget}</div>
              <div className="text-sm text-slate-400 mb-3">Client: {job.client}</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-neon-blue/20 text-neon-blue rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full p-2 bg-neon-blue text-black font-semibold rounded-lg"
              >
                Quick Apply
              </motion.button>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center text-slate-400">
          Showing {filtered.length} of {jobs.length} jobs
        </div>
      </div>
    </div>
  );
}
