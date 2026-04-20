import { useState } from 'react';
import { discoverCompanies, getContacts, generateEmail, sendEmail, generateManualEmail, sendManualEmail } from '../api';
import { 
  Target, Building2, Mail, Zap, Activity, 
  Send, Sparkles, AlertCircle, Loader2, 
  CheckCircle, ChevronRight, User, 
  ArrowRight, Globe, Search, MessageSquare, 
  Settings, LayoutDashboard, Database,
  ArrowLeft, Clock, ShieldCheck, MailOpen
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const STEPS = [
  { id: 1, label: 'Capture Signals', description: 'Define ICP & find targets' },
  { id: 2, label: 'Analyze Account', description: 'Select company & research' },
  { id: 3, label: 'Generate Outreach', description: 'Select contact & draft' },
  { id: 4, label: 'Send Email', description: 'Review & deliver' }
];

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('campaign'); // 'campaign' or 'manual'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stageText, setStageText] = useState('');

  // Form & Workflow state
  const [icp, setIcp] = useState('Cybersecurity training for Series B startups in United States');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  
  const [emailPreview, setEmailPreview] = useState(null); // { subject, email, signals }
  const [editableSubject, setEditableSubject] = useState('');
  const [editableBody, setEditableBody] = useState('');

  const [sendResult, setSendResult] = useState(null);

  // Manual Mode state
  const [manualEmail, setManualEmail] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualIcp, setManualIcp] = useState('');
  const [manualDraft, setManualDraft] = useState({ subject: '', email: '', signals: [] });
  const [isDraftGenerated, setIsDraftGenerated] = useState(false);

  const handleDiscoverCompanies = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setStageText('Discovering Target Companies...');
    try {
      const data = await discoverCompanies(icp);
      setCompanies(data.companies || []);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to discover companies.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = async (companyName) => {
    setSelectedCompany(companyName);
    setLoading(true); setError(null); setStageText('Finding Key Decision Makers...');
    try {
      const data = await getContacts(companyName);
      setContacts(data.contacts || []);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to get contacts.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setLoading(true); setError(null); setStageText('Harvesting Signals & Generating Draft...');
    try {
      const data = await generateEmail(selectedCompany, icp, contact.name, contact.email);
      setEmailPreview(data);
      setEditableSubject(data.subject);
      setEditableBody(data.email);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Failed to generate email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true); setError(null); setStageText('Sending Outreach Email...');
    try {
      const response = await sendEmail(selectedContact.email, editableSubject, editableBody);
      setSendResult(response);
      setStep(5);
    } catch (err) {
      setError(err.message || 'Failed to send email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateManualEmail = async (e) => {
    e.preventDefault();
    if (!manualEmail) return;
    setLoading(true); setError(null); setStageText('Generating Manual Outreach...');
    try {
      const data = await generateManualEmail(manualEmail, manualCompany, manualIcp);
      setManualDraft({
        subject: data.subject,
        email: data.email,
        signals: data.signals
      });
      setManualCompany(data.company);
      setIsDraftGenerated(true);
    } catch (err) {
      setError(err.message || 'Failed to generate manual email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendManualEmail = async () => {
    setLoading(true); setError(null); setStageText('Sending Manual Email...');
    try {
      const response = await sendManualEmail(manualEmail, manualDraft.subject, manualDraft.email);
      setSendResult(response);
      setStep(5);
      setSelectedContact({ name: manualEmail, email: manualEmail });
      setSelectedCompany(manualCompany);
    } catch (err) {
      setError(err.message || 'Failed to send email.');
    } finally {
      setLoading(false);
    }
  };

  // UI Components
  const BackgroundBlobs = () => (
    <>
      <div className="blob w-[500px] h-[500px] -top-48 -left-48 bg-indigo-200" />
      <div className="blob w-[600px] h-[600px] top-1/2 -right-48 bg-blue-100" />
      <div className="blob w-[400px] h-[400px] -bottom-24 left-1/4 bg-purple-100" />
    </>
  );

  const StepTimeline = () => (
    <div className="flex flex-col gap-0 relative">
      <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-indigo-50" />
      {STEPS.map((s) => {
        const isActive = step === s.id;
        const isCompleted = step > s.id;
        return (
          <div key={s.id} className={cn("flex gap-4 pb-8 relative group transition-all duration-500", !isActive && !isCompleted && "opacity-40 grayscale-[50%]")}>
            <div className={cn(
              "z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500",
              isCompleted ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200" : 
              isActive ? "bg-white border-indigo-500 text-indigo-600 shadow-xl shadow-indigo-200 scale-110" : 
              "bg-white border-gray-100 text-gray-300"
            )}>
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{s.id}</span>}
            </div>
            <div className="flex flex-col pt-1">
              <span className={cn("text-xs font-black uppercase tracking-widest transition-colors", isActive ? "text-indigo-600" : "text-gray-400")}>
                {s.label}
              </span>
              <span className="text-[10px] text-gray-400 font-bold">{s.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const LoadingOverlay = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-indigo-50 border-t-indigo-500" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-gray-900 font-bold text-lg">{stageText}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">AI processing in progress</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-600">
      <BackgroundBlobs />
      
      {/* Soft Premium Navbar */}
      <nav className="sticky top-0 z-[60] bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight gradient-text">
                FireReach
              </h1>
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none mt-0.5">
                Outreach Intelligence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-1 p-1 bg-white/50 border border-white rounded-2xl shadow-inner">
              <button 
                onClick={() => { setMode('campaign'); setStep(1); }}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  mode === 'campaign' ? "bg-white text-indigo-600 shadow-md shadow-indigo-100" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Campaigns
              </button>
              <button 
                onClick={() => { setMode('manual'); setStep(1); }}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  mode === 'manual' ? "bg-white text-indigo-600 shadow-md shadow-indigo-100" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Manual Mode
              </button>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-indigo-50/50 border border-indigo-100/50 rounded-full">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" 
              />
              <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">Agent Ready</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Enhanced Timeline */}
          {mode === 'campaign' && step < 5 && (
            <aside className="lg:col-span-3 sticky top-28">
              <div className="flex flex-col gap-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-8">Agent Workflow</h2>
                  <StepTimeline />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="p-6 bg-white/40 backdrop-blur-md border border-white rounded-3xl shadow-sm"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="text-xs font-bold text-gray-900">Intelligence Brief</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-bold opacity-80 italic">
                    "FireReach agent is currently harvesting high-intent signals and analyzing account structure for optimal outreach alignment."
                  </p>
                </motion.div>
              </div>
            </aside>
          )}

          {/* Main: Content Area */}
          <main className={cn(
            "lg:col-span-9 space-y-10",
            (mode === 'manual' || step === 5) && "lg:col-span-12 max-w-5xl mx-auto w-full"
          )}>
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-red-50/80 backdrop-blur-md border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 shadow-xl shadow-red-500/5"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  </div>
                  <p className="text-sm font-bold">{error}</p>
                </motion.div>
              )}

              <div className="relative">
                <AnimatePresence mode="wait">
                  {loading && <LoadingOverlay />}

                  {/* STEP 1: SOFT HERO CONTROL */}
                  {mode === 'campaign' && step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                      <div className="soft-card !p-12 border-white relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-50/50 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-indigo-100/30 transition-colors duration-700" />
                        
                        <div className="relative z-10">
                          <div className="flex flex-col gap-2 mb-10">
                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-400/5 mb-4 group-hover:scale-110 transition-transform duration-500">
                              <Target className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Discovery Parameters</h2>
                            <p className="text-gray-400 font-bold text-sm">Define your ICP. Our agent will discover and qualify the highest matching accounts.</p>
                          </div>

                          <form onSubmit={handleDiscoverCompanies} className="space-y-10">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ideal Customer Profile</label>
                                <span className="text-[10px] text-indigo-500 font-black bg-indigo-50 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-indigo-100 transition-all border border-indigo-100 hover:scale-105 active:scale-95">AUTO-COMPLETE AI</span>
                              </div>
                              <textarea 
                                required
                                rows="4"
                                value={icp}
                                onChange={(e) => setIcp(e.target.value)}
                                placeholder="e.g. Early-stage AI companies in Europe focusing on data privacy..."
                                className="soft-input !text-lg !p-8 !min-h-[160px] !resize-none leading-relaxed"
                              />
                            </div>

                            <motion.button 
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              type="submit" 
                              disabled={loading} 
                              className="gradient-button-primary !py-6 !px-12 !text-lg group"
                            >
                              Initialize Intelligence Discovery
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                            </motion.button>
                          </form>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: COMPANY CARDS WITH GLOW */}
                  {mode === 'campaign' && step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                      <div className="flex items-end justify-between px-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Target Intelligence</h2>
                          </div>
                          <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">Identified {companies.length} verified accounts</p>
                        </div>
                        <button onClick={() => setStep(1)} className="soft-button-secondary !py-2.5 !px-5 !text-xs gap-2 hover:bg-indigo-50 border-indigo-100 text-indigo-600">
                          <ArrowLeft className="w-4 h-4" /> Refine Parameters
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map((company, idx) => (
                          <motion.button 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={idx}
                            onClick={() => handleSelectCompany(company.name)}
                            className={cn(
                              "soft-card group text-left border-gray-100 hover:border-indigo-400 hover:shadow-indigo-500/10 hover:shadow-2xl transition-all duration-500",
                              selectedCompany === company.name && "border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/20 bg-indigo-50/30"
                            )}
                          >
                            <div className="flex items-center justify-between mb-8">
                              <div className="w-14 h-14 bg-gray-50/50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-blue-500 transition-all duration-500 overflow-hidden shadow-sm">
                                <Building2 className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-4">
                                <ChevronRight className="w-4 h-4 text-indigo-500" />
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors truncate">{company.name}</h3>
                            
                            {company.signals && company.signals.length > 0 && (
                              <div className="mt-auto pt-5 border-t border-gray-100/50 flex flex-wrap gap-2">
                                {company.signals.slice(0, 2).map((sig, i) => (
                                  <span key={i} className="text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                    {sig}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: CONTACT SELECTION */}
                  {mode === 'campaign' && step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                      <div className="soft-card !p-0 overflow-hidden border-indigo-100/50 bg-white/60 backdrop-blur-md">
                        <div className="px-10 py-10 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 border-b border-white">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center border border-indigo-100 shadow-xl shadow-indigo-200/10">
                              <Building2 className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Target Account</p>
                              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedCompany}</h2>
                            </div>
                          </div>
                        </div>

                        <div className="p-10">
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Verified Decision Makers</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {contacts.map((contact, idx) => (
                              <motion.button 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                onClick={() => handleSelectContact(contact)}
                                className="group p-6 bg-white border border-gray-100 rounded-3xl flex items-center justify-between hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 text-left active:scale-[0.98]"
                              >
                                <div className="flex items-center gap-5">
                                  <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center border border-gray-100 group-hover:from-indigo-50 group-hover:to-blue-50 transition-colors overflow-hidden">
                                      <User className="w-6 h-6 text-gray-400 group-hover:text-indigo-500" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                      <ShieldCheck className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{contact.name}</h4>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{contact.role}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                  <div className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all truncate max-w-[120px]">
                                    {contact.email.split('@')[0]}...
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: REAL EMAIL PREVIEW PANEL */}
                  {mode === 'campaign' && step === 4 && emailPreview && (
                    <motion.div key="step4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      
                      {/* Sidebar Brief */}
                      <div className="lg:col-span-4 space-y-8">
                        <div className="soft-card !p-8 bg-white/60 backdrop-blur-md">
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">Target Intelligence</h3>
                          <div className="space-y-8">
                            <div className="flex gap-5">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                                <Building2 className="w-5 h-5 text-indigo-500" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest space-y-0.5">Account</p>
                                <p className="text-sm font-bold text-gray-900 leading-tight mt-0.5">{selectedCompany}</p>
                              </div>
                            </div>
                            <div className="flex gap-5">
                              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100 shadow-sm">
                                <User className="w-5 h-5 text-purple-500" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Decision Maker</p>
                                <p className="text-sm font-bold text-gray-900 leading-tight">{selectedContact?.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tight">{selectedContact?.email}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="soft-card !p-8 border-indigo-100 bg-indigo-50/30">
                          <div className="flex items-center justify-between mb-8 border-b border-indigo-100/50 pb-5">
                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Growth Signals</h3>
                            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                          </div>
                          <div className="space-y-4">
                            {emailPreview.signals.map((sig, i) => (
                              <div key={i} className="p-5 bg-white border border-indigo-100 rounded-2xl text-[11px] font-bold text-gray-600 leading-relaxed shadow-sm hover:translate-x-1 transition-all duration-300">
                                <div className="flex items-start gap-3">
                                  <Activity className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                                  {sig}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Realistic Email Client Panel */}
                      <div className="lg:col-span-8 soft-card !p-0 overflow-hidden border-indigo-100/50 shadow-2xl shadow-indigo-500/5 bg-white flex flex-col min-h-[700px]">
                        <div className="bg-gray-50/50 border-b border-gray-100 p-8 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                                <MailOpen className="w-6 h-6 text-indigo-500" />
                              </div>
                              <div>
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Email Intelligence</h2>
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-0.5">Optimized for high-intent delivery</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 px-4 py-2 bg-green-50 border border-green-100 rounded-xl">
                              <ShieldCheck className="w-4 h-4 text-green-500" />
                              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Verified Sender</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Subject:</span>
                              <input 
                                type="text" 
                                value={editableSubject}
                                onChange={(e) => setEditableSubject(e.target.value)}
                                className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/5 transition-all outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-10 flex-1 flex flex-col">
                          <textarea 
                            value={editableBody}
                            onChange={(e) => setEditableBody(e.target.value)}
                            className="w-full flex-1 min-h-[460px] bg-transparent text-[15px] text-gray-700 font-medium leading-relaxed !resize-none outline-none focus:ring-0 transition-all font-sans"
                            style={{ fontVariantLigatures: 'no-common-ligatures' }}
                          />
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                          <button 
                            onClick={() => setStep(3)}
                            className="soft-button-secondary !py-3 !px-8 hover:bg-white"
                          >
                            Cancel
                          </button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendEmail}
                            className="gradient-button-primary !py-4 !px-12 shadow-xl shadow-indigo-500/20"
                          >
                            <Send className="w-5 h-5" />
                            Deliver outreach
                          </motion.button>
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* STEP 5: SUCCESS & ANALYTICS */}
                  {step === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto py-16 text-center">
                      <div className="soft-card !p-16 border-white shadow-2xl shadow-indigo-500/10 relative overflow-hidden bg-white/70 backdrop-blur-xl">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
                        
                        <div className="relative">
                          <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-28 h-28 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-xl shadow-green-100"
                          >
                            <CheckCircle className="w-12 h-12 text-green-500" />
                          </motion.div>
                          
                          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Mission Accomplished</h2>
                          <p className="text-gray-500 font-bold text-sm mb-12 max-w-sm mx-auto leading-relaxed uppercase tracking-wider">
                            Intelligent outreach delivered to <span className="text-indigo-600">{selectedContact?.name}</span>.
                          </p>

                          <div className="grid grid-cols-2 gap-4 mb-12">
                            <div className="p-6 bg-white border border-indigo-50 rounded-3xl shadow-sm">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Deliverability</p>
                              <p className="text-xl font-black text-indigo-600">99.8%</p>
                            </div>
                            <div className="p-6 bg-white border border-indigo-50 rounded-3xl shadow-sm">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Stability</p>
                              <p className="text-xl font-black text-green-500">Verified</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-5">
                            <button 
                              onClick={() => {
                                setStep(1);
                                setSelectedCompany(null);
                                setSelectedContact(null);
                                setEmailPreview(null);
                                setIsDraftGenerated(false);
                                setMode('campaign');
                              }}
                              className="gradient-button-primary flex-1 !py-5"
                            >
                              Initialize Next Campaign
                            </button>
                            <button onClick={() => window.location.reload()} className="soft-button-secondary flex-1 !py-5">
                              Main Dashboard
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* MANUAL MODE REDESIGN */}
                  {mode === 'manual' && step === 1 && (
                    <motion.div key="manual" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                      
                      {/* Manual Side Form */}
                      <div className="lg:col-span-5 soft-card !p-12 relative overflow-hidden group border-white bg-white/70 backdrop-blur-xl">
                        <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-indigo-50/50 rounded-full w-64 h-64 blur-3xl opacity-50 group-hover:bg-indigo-100 transition-colors duration-500" />

                        <div className="relative z-10">
                          <div className="flex items-center gap-5 mb-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-xl shadow-indigo-500/5 group-hover:scale-110 transition-transform duration-500">
                              <MessageSquare className="w-8 h-8 text-indigo-500" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Direct Terminal</h2>
                              <p className="text-[10px] font-black text-indigo-400 mt-1 uppercase tracking-widest">Manual Intent Deployment</p>
                            </div>
                          </div>

                          <form onSubmit={handleGenerateManualEmail} className="space-y-8">
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Target Identity</label>
                                <input 
                                  required
                                  type="email"
                                  placeholder="name@organization.com"
                                  value={manualEmail}
                                  onChange={(e) => setManualEmail(e.target.value)}
                                  className="soft-input !p-4 !text-base focus:shadow-indigo-500/10"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Account Branding</label>
                                <input 
                                  type="text"
                                  placeholder="Organization Name"
                                  value={manualCompany}
                                  onChange={(e) => setManualCompany(e.target.value)}
                                  className="soft-input !p-4 !text-base focus:shadow-indigo-500/10"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Intent Vector</label>
                                <textarea 
                                  rows="4"
                                  placeholder="Briefly define the context for this outreach..."
                                  value={manualIcp}
                                  onChange={(e) => setManualIcp(e.target.value)}
                                  className="soft-input !resize-none !p-5 !text-base !min-h-[140px] focus:shadow-indigo-500/10 leading-relaxed"
                                />
                              </div>
                            </div>

                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="submit" 
                              disabled={loading} 
                              className="gradient-button-primary w-full !py-5 shadow-xl shadow-indigo-500/20 group"
                            >
                              Initialize Manual Intelligence
                              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                            </motion.button>
                          </form>
                        </div>
                      </div>

                      {/* Manual Side Preview */}
                      <div className="lg:col-span-7">
                        {!isDraftGenerated ? (
                          <div className="h-full border-2 border-dashed border-white/50 bg-white/20 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-16 text-center group hover:bg-white/40 transition-all duration-700">
                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-200/5 group-hover:scale-110 transition-transform duration-500 border border-white">
                              <Database className="w-10 h-10 text-gray-200 group-hover:text-indigo-200 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Intelligence Pipeline Idle</h3>
                            <p className="text-xs font-bold text-gray-400 max-w-[320px] leading-relaxed uppercase tracking-widest">Awaiting deployment parameters from the direct terminal interface</p>
                          </div>
                        ) : (
                          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col soft-card !p-0 shadow-2xl border-white bg-white/80 backdrop-blur-xl overflow-hidden">
                            <div className="p-10 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                                  <Clock className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div>
                                  <span className="font-bold text-gray-900 tracking-tight block">Intelligence Draft</span>
                                  <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">AI Refined Generation</span>
                                </div>
                              </div>
                            </div>

                            <div className="p-10 flex-1 space-y-10">
                              <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] block ml-1">Subject Vector</label>
                                <input 
                                  type="text" 
                                  value={manualDraft.subject}
                                  onChange={(e) => setManualDraft({...manualDraft, subject: e.target.value})}
                                  className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-base font-bold text-gray-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/5 outline-none transition-all shadow-sm"
                                />
                              </div>
                              <div className="space-y-4 flex-1">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] block ml-1">Intelligence Package Content</label>
                                <textarea 
                                  value={manualDraft.email}
                                  onChange={(e) => setManualDraft({...manualDraft, email: e.target.value})}
                                  className="w-full h-full min-h-[420px] bg-transparent text-[16px] text-gray-700 font-medium leading-relaxed outline-none !resize-none focus:ring-0 transition-all font-sans"
                                />
                              </div>
                            </div>

                            <div className="p-10 bg-gray-100/30 border-t border-gray-100">
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSendManualEmail}
                                className="gradient-button-primary w-full !py-5 shadow-2xl shadow-indigo-500/20"
                              >
                                <Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                Deploy Manual Outreach
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Modern Soft Footer */}
      <footer className="max-w-6xl mx-auto px-10 py-16 border-t border-white/50 flex flex-col md:flex-row justify-between items-center gap-10 opacity-60">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-all">
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">FireReach v3.0 Intelligence System</span>
        </div>
        <div className="flex items-center gap-10">
          {['Compliance', 'Security', 'Architecture', 'Status'].map((item) => (
            <span key={item} className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors">
              {item}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

