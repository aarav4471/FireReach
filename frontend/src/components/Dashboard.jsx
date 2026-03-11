import { useState } from 'react';
import { runAgent } from '../api';
import { Target, Building2, Mail, Zap, Activity, BookOpen, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const [formData, setFormData] = useState({
    icp: 'Cybersecurity training for Series B startups',
    company: 'Stripe',
    email: 'candidate-email@example.com'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [stage, setStage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setStage('Initializing FireReach Agent...');

    try {
      // Small simulated delay for UX timeline
      setTimeout(() => setStage('Harvesting Live Business Signals...'), 1500);
      setTimeout(() => setStage('Analyzing with Research Analyst...'), 4000);
      setTimeout(() => setStage('Generating Hyper-Personalized Email...'), 7000);
      
      const data = await runAgent(formData.company, formData.icp, formData.email);
      setResults(data);
      setStage('Complete');
    } catch (err) {
      setError(err.message || 'An error occurred while running the agent.');
      setStage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-8">
      
      {/* Header */}
      <header className="flex items-center justify-between animate-fade-in border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl rounded-tl-sm border border-primary/20 glow-primary">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-br from-white to-textMuted bg-clip-text text-transparent">FireReach</h1>
            <p className="text-sm text-textMuted -mt-1 font-medium tracking-wide">Autonomous Outreach Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-surface border border-border">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></div>
          <span className="text-textMuted">Agent Systems Online</span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <section className="lg:col-span-4 flex flex-col gap-6 animate-slide-up" style={{animationDelay: "0.1s"}}>
          <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-black/50">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" /> Configure Outreach
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textMuted flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Ideal Customer Profile (ICP)
                </label>
                <textarea 
                  name="icp"
                  required
                  rows="3"
                  value={formData.icp}
                  onChange={handleChange}
                  className="w-full bg-surfaceLight border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  placeholder="e.g. We sell cybersecurity training to Series B startups"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textMuted flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Target Company
                </label>
                <input 
                  type="text"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-surfaceLight border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. Stripe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textMuted flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Target Email
                </label>
                <input 
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surfaceLight border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. candidate-email@example.com"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={cn(
                  "mt-2 w-full py-3.5 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group",
                  loading ? "bg-surfaceLight text-textMuted cursor-not-allowed border border-border" 
                          : "bg-primary text-white hover:bg-primaryHover glow-primary"
                )}
              >
                {!loading && <div className="absolute inset-0 bg-white/10 w-full translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>}
                
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {stage || "Agent Running..."}</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Run FireReach Agent</>
                  )}
                </span>
              </button>
              
              {error && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Results Data Panel */}
        <section className="lg:col-span-8 flex flex-col gap-6 animate-slide-up" style={{animationDelay: "0.2s"}}>
          
          <AnimatePresence mode="wait">
            {!results && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] glass-panel rounded-2xl border-dashed border-2 flex flex-col items-center justify-center text-textMuted p-10 text-center"
              >
                <div className="p-4 bg-surface rounded-full mb-4 border border-border/50">
                  <Zap className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-xl font-medium text-text">Waiting for Agent</h3>
                <p className="mt-2 max-w-sm">Fill out the configuration on the left to deploy the autonomous outreach agent. It will harvest signals, conduct research, and dispatch an email.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] glass-panel rounded-2xl flex flex-col items-center justify-center p-10 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
                    <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center shadow-lg shadow-primary/20">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mt-6 text-white text-center">
                    {stage}
                  </h3>
                  
                  <div className="w-64 h-1.5 bg-surfaceLight rounded-full mt-6 overflow-hidden border border-border">
                    <div className="h-full bg-primary rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-2/3"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {results && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                {/* Signals Panel */}
                <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 pb-2 border-b border-border/50">
                    <Activity className="w-5 h-5 text-green-400" /> Captured Signals
                  </h3>
                  <ul className="space-y-3 relative z-10">
                    {results.signals && results.signals.length > 0 ? (
                      results.signals.map((signal, idx) => (
                        <li key={idx} className="flex gap-3 text-sm items-start p-3 bg-surfaceLight/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                          <p className="text-textMuted leading-relaxed">{signal.replace(/^\"|\"$/g, '')}</p>
                        </li>
                      ))
                    ) : (
                      <p className="text-sm text-textMuted italic">No signals harvested.</p>
                    )}
                  </ul>
                </div>

                {/* Research Panel */}
                <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 pb-2 border-b border-border/50">
                    <BookOpen className="w-5 h-5 text-blue-400" /> Account Research Brief
                  </h3>
                  <div className="text-sm text-textMuted leading-relaxed space-y-4">
                    {results.research ? (
                      results.research.split('\n\n').map((para, i) => (
                         <p key={i}>{para.replace(/^\"|\"$/g, '')}</p>
                      ))
                    ) : (
                      <p className="italic">No research generated.</p>
                    )}
                  </div>
                </div>

                {/* Email Template Panel */}
                <div className="glass-panel rounded-2xl shadow-xl relative overflow-hidden border-primary/20 glow-primary">
                  <div className="bg-surface/80 p-4 border-b border-border/50 flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                       <Send className="w-5 h-5 text-primary" /> Generated Outreach Email
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md">Automated Push</span>
                  </div>
                  <div className="p-6 bg-[#0c0d11]">
                    <div className="font-mono text-sm text-textMuted whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                      {results.email ? results.email.replace(/^\"|\"$/g, '') : "No email output."}
                    </div>
                  </div>
                  {results.target_email && (
                    <div className="bg-green-500/10 border-t border-green-500/20 p-4 text-center">
                      <p className="text-green-400 font-medium text-sm">
                        ✅ Email sent successfully to {results.target_email}
                      </p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>
    </div>
  );
}
