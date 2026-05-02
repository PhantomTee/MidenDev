'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Share2, 
  Shield, 
  Star, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Search,
  ExternalLink,
  Twitter,
  Github,
  MessageCircle,
  Trophy,
  Filter,
  User,
  PlusCircle,
  History,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '@miden-sdk/miden-wallet-adapter';
import { formatMidenAddress, shortenAddress } from '@/lib/utils';
import { StatusBar } from '@/components/StatusBar';

// Types
interface Submission {
  id: string;
  title: string;
  author: string;
  description: string;
  type: 'Tool' | 'Tutorial' | 'Note' | 'Contract';
  url: string;
  tags: string[];
  likes: number;
  timestamp: number;
  status: 'approved' | 'pending' | 'featured';
}

interface UserTask {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  platform: 'X' | 'GitHub' | 'Discord' | 'Miden';
}

const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: '1',
    title: 'Miden VM Visualizer',
    author: 'mdev1qztsu0jdhngfhqp42vhd42rme9cqzkzy89e',
    description: 'A real-time debugger for MASM instructions with stack visualization.',
    type: 'Tool',
    url: 'https://github.com/example/miden-viz',
    tags: ['MASM', 'Debug', 'UI'],
    likes: 24,
    timestamp: Date.now() - 86400000 * 2,
    status: 'featured',
  },
  {
    id: '2',
    title: 'Zero-Knowledge Privacy Note',
    author: 'mdev1pztsu1jdhngfhqp42vhd42rme9cqzkzy99a',
    description: 'A template for creating stealth account notes using P2ID.',
    type: 'Note',
    url: 'https://miden.dev/notes/privacy',
    tags: ['Note', 'Privacy', 'MASM'],
    likes: 12,
    timestamp: Date.now() - 86400000,
    status: 'approved',
  }
];

const DEFAULT_TASKS: UserTask[] = [
  { id: 't1', title: 'Follow @PolygonMiden on X', xp: 50, completed: false, platform: 'X' },
  { id: 't2', title: 'Star the Miden-VM Repo', xp: 100, completed: false, platform: 'GitHub' },
  { id: 't3', title: 'Join the Miden Discord', xp: 50, completed: false, platform: 'Discord' },
  { id: 't4', title: 'Submit Your First Build', xp: 500, completed: false, platform: 'Miden' },
];

export default function MidenHub() {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'feed' | 'tasks' | 'submit' | 'admin'>('feed');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [xp, setXp] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Tool' as Submission['type'],
    url: '',
    tags: '',
  });

  const walletAddr = useMemo(() => formatMidenAddress(publicKey), [publicKey]);

  // Persistence
  useEffect(() => {
    const savedSubmissions = localStorage.getItem('miden_submissions');
    const savedTasks = localStorage.getItem('miden_tasks');
    const savedXp = localStorage.getItem('miden_xp');

    /* eslint-disable react-hooks/set-state-in-effect */
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
    else setSubmissions(DEFAULT_SUBMISSIONS);

    if (savedTasks) setUserTasks(JSON.parse(savedTasks));
    else setUserTasks(DEFAULT_TASKS);

    if (savedXp) setXp(parseInt(savedXp, 10));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (submissions.length > 0) localStorage.setItem('miden_submissions', JSON.stringify(submissions));
    localStorage.setItem('miden_tasks', JSON.stringify(userTasks));
    localStorage.setItem('miden_xp', xp.toString());
  }, [submissions, userTasks, xp]);

  // Level Logic
  const getLevelInfo = (currentXp: number) => {
    const levels = [
      { name: 'Newcomer', min: 0 },
      { name: 'Builder', min: 200 },
      { name: 'Contributor', min: 500 },
      { name: 'Architect', min: 1000 },
      { name: 'Core Dev', min: 2500 },
      { name: 'Legend', min: 5000 },
    ];
    
    let currentLevel = levels[0];
    let nextLevel = levels[1];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (currentXp >= levels[i].min) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || levels[i];
        break;
      }
    }
    
    const progress = Math.min(100, ((currentXp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100);
    return { currentLevel, nextLevel, progress };
  };

  const levelInfo = getLevelInfo(xp);

  // Actions
  const handleLike = (id: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes + 1 } : s));
  };

  const completeTask = (id: string) => {
    setUserTasks(prev => prev.map(t => {
      if (t.id === id && !t.completed) {
        setXp(prevXp => prevXp + t.xp);
        return { ...t, completed: true };
      }
      return t;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return alert('Connect wallet to submit');
    
    const newSubmission: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      author: walletAddr,
      description: formData.description,
      type: formData.type,
      url: formData.url,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      likes: 0,
      timestamp: Date.now(),
      status: 'pending',
    };

    setSubmissions(prev => [newSubmission, ...prev]);
    setActiveTab('feed');
    setFormData({ title: '', description: '', type: 'Tool', url: '', tags: '' });
  };

  const approveSubmission = (id: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
  };

  const filteredSubmissions = submissions.filter(s => 
    s.status !== 'pending' && 
    (s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0D1117] font-mono text-white selection:bg-orange-500/30 overflow-hidden">
      <StatusBar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-10">
          <header className="mb-12">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-orange-500">MidenHub_</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] mt-2">The Central Archive for Verifiable Innovation</p>
          </header>

          {/* Navigation Tabs */}
          <div className="flex gap-8 border-b border-white/5 mb-10 overflow-x-auto no-scrollbar">
            {(['feed', 'tasks', 'submit', 'admin'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? 'text-orange-500' : 'text-white/20 hover:text-white/60'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeHubTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'feed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 border border-white/10 rounded">
                  <Search size={18} className="text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Search submissions, tags, builders..."
                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-white/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Filter size={16} className="text-white/20" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSubmissions.map(sub => (
                    <div key={sub.id} className="group border border-white/5 bg-[#161B22] p-6 hover:border-orange-500/50 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-orange-500/10 text-orange-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold border border-orange-500/20">
                          {sub.type}
                        </span>
                        {sub.status === 'featured' && <Award size={14} className="text-orange-500" />}
                      </div>
                      <h3 className="text-lg font-black uppercase text-white mb-2 group-hover:text-orange-500 transition-colors">{sub.title}</h3>
                      <p className="text-xs text-white/40 mb-4 h-12 line-clamp-3 uppercase leading-relaxed">{sub.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {sub.tags.map(tag => (
                          <span key={tag} className="text-[8px] text-white/20 border border-white/5 px-1.5 py-0.5 uppercase">#{tag}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <User size={12} className="text-orange-500" />
                          </div>
                          <span className="text-[10px] text-white/60 font-mono italic">{shortenAddress(sub.author)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => handleLike(sub.id)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-orange-500 transition-colors">
                            <Heart size={14} className={sub.likes > 0 ? "fill-orange-500 text-orange-500" : ""} />
                            {sub.likes}
                          </button>
                          <a href={sub.url} target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4">
                  {userTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`flex items-center justify-between p-6 border ${
                        task.completed ? 'border-orange-500/10 opacity-60' : 'border-white/5 hover:border-orange-500/30'
                      } bg-[#161B22] transition-all`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-10 h-10 flex items-center justify-center border ${
                          task.completed ? 'border-orange-500 text-orange-500' : 'border-white/10 text-white/20'
                        }`}>
                          {task.platform === 'X' && <Twitter size={20} />}
                          {task.platform === 'GitHub' && <Github size={20} />}
                          {task.platform === 'Discord' && <MessageCircle size={20} />}
                          {task.platform === 'Miden' && <Zap size={20} />}
                        </div>
                        <div>
                          <h3 className={`text-sm font-bold uppercase tracking-widest ${task.completed ? 'text-orange-500' : 'text-white'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-orange-500 font-bold">+{task.xp} XP</span>
                            <span className="text-[10px] text-white/20 uppercase tracking-tighter">PLATFORM: {task.platform}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => !task.completed && completeTask(task.id)}
                        disabled={task.completed}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          task.completed 
                            ? 'text-orange-500' 
                            : 'bg-orange-500 text-black hover:bg-white'
                        }`}
                      >
                        {task.completed ? <CheckCircle2 size={16} /> : 'Claim'}
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 p-8 border border-orange-500/20 bg-orange-500/5">
                  <div className="flex gap-4 items-start">
                    <AlertCircle className="text-orange-500 shrink-0" size={24} />
                    <div>
                      <h4 className="text-sm font-bold text-orange-500 uppercase mb-2">Social Verification</h4>
                      <p className="text-xs text-white/40 leading-relaxed uppercase">
                        For cross-platform tasks, the system verifies your connected account ID automatically via the Miden Oracle. Ensure your wallet is connected to prevent state desync.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'submit' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                {!connected ? (
                  <div className="text-center py-20 border border-white/5 bg-[#161B22]">
                    <Shield size={48} className="mx-auto text-orange-500/20 mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2 uppercase">Connection Required</h2>
                    <p className="text-xs text-white/40 uppercase mb-8">Author identity must be verifiable on-chain</p>
                    {/* Assuming Sidebar or Header handles connection, but we can hint */}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8 bg-[#161B22] p-8 border border-white/5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">Build Title</label>
                       <input 
                        required
                        type="text" 
                        placeholder="e.g. Miden Explorer Alpha"
                        className="w-full bg-[#0D1117] border border-white/10 px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">Module Type</label>
                        <select 
                          className="w-full bg-[#0D1117] border border-white/10 px-4 py-3 text-sm focus:border-orange-500 outline-none appearance-none"
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value as Submission['type']})}
                        >
                          <option value="Tool">TOOL</option>
                          <option value="Tutorial">TUTORIAL</option>
                          <option value="Note">NOTE_TEMPLATE</option>
                          <option value="Contract">MASM_CONTRACT</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">Resource Link</label>
                        <input 
                          required
                          type="url" 
                          placeholder="GITHUB / DOCS URL"
                          className="w-full bg-[#0D1117] border border-white/10 px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all"
                          value={formData.url}
                          onChange={e => setFormData({...formData, url: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">Brief Description</label>
                        <span className="text-[8px] text-white/20 font-mono">{formData.description.length}/240</span>
                      </div>
                      <textarea 
                        required
                        maxLength={240}
                        rows={4}
                        placeholder="EXPLAIN THE CORE LOGIC AND ZK-PROVING EFFICIENCY..."
                        className="w-full bg-[#0D1117] border border-white/10 px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all resize-none"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">Tags (Comma Separated)</label>
                       <input 
                        type="text" 
                        placeholder="ZK, MASM, P2ID"
                        className="w-full bg-[#0D1117] border border-white/10 px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all"
                        value={formData.tags}
                        onChange={e => setFormData({...formData, tags: e.target.value})}
                       />
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        className="w-full bg-orange-500 text-black py-4 font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3"
                      >
                       <PlusCircle size={18} /> Push to Queue
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex flex-col gap-6">
                   <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                       <Shield size={20} className="text-orange-500" /> Review_Queue
                     </h2>
                     <span className="text-[10px] text-white/20 uppercase tracking-widest">
                       Pending Submissions: {submissions.filter(s => s.status === 'pending').length}
                     </span>
                   </div>

                   {submissions.filter(s => s.status === 'pending').length === 0 ? (
                     <div className="py-20 border border-white/5 text-center text-white/20 uppercase text-[10px] tracking-widest">
                       Queue Empty // Systems Optimal
                     </div>
                   ) : (
                     submissions.filter(s => s.status === 'pending').map(sub => (
                       <div key={sub.id} className="bg-[#161B22] border border-white/10 p-6 flex flex-col sm:flex-row justify-between gap-6">
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 font-bold uppercase">{sub.type}</span>
                              <h3 className="font-bold uppercase tracking-wider">{sub.title}</h3>
                            </div>
                            <p className="text-xs text-white/40 uppercase leading-relaxed mb-4">{sub.description}</p>
                            <div className="flex items-center gap-4 text-[10px] text-white/20 font-mono">
                              <span>BY: {shortenAddress(sub.author)}</span>
                              <span>TS: {new Date(sub.timestamp).toLocaleTimeString()}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 shrink-0">
                           <button 
                            onClick={() => approveSubmission(sub.id)}
                            className="bg-orange-500 text-black px-4 py-2 text-[10px] font-bold uppercase hover:bg-white transition-colors"
                           >
                             Approve
                           </button>
                           <button className="border border-white/10 text-white/40 px-4 py-2 text-[10px] font-bold uppercase hover:bg-red-500/20 hover:text-red-500 hover:border-red-500 transition-all">
                             Reject
                           </button>
                         </div>
                       </div>
                     ))
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Sidebar (Hub Sidebar) */}
        <div className="hidden xl:flex w-80 border-l border-white/5 flex-col bg-[#0D1117] p-8 space-y-12">
          {/* User Progress */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} /> User_Intelligence
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Current Class</span>
                  <span className="text-lg font-black uppercase text-white italic">{levelInfo.currentLevel.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-orange-500">{xp}</span>
                  <span className="text-[10px] text-white/20 uppercase ml-1">XP</span>
                </div>
              </div>

              <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  className="absolute h-full bg-orange-500"
                />
              </div>

              <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-white/20">
                <span>0 XP</span>
                <span>Next: {levelInfo.nextLevel.name} ({levelInfo.nextLevel.min} XP)</span>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
              <Trophy size={16} /> Unlocked_Badges
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Zap, unlocked: xp > 0, label: 'Pioneer' },
                { icon: Shield, unlocked: xp >= 200, label: 'Guardian' },
                { icon: Star, unlocked: xp >= 500, label: 'Elite' },
                { icon: Plus, unlocked: submissions.length > 5, label: 'Creator' }
              ].map((badge, i) => (
                <div 
                  key={i} 
                  className={`aspect-square flex items-center justify-center border transition-all ${
                    badge.unlocked ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 opacity-20'
                  }`}
                  title={badge.label}
                >
                  <badge.icon size={16} className={badge.unlocked ? 'text-orange-500' : 'text-white'} />
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Snippet */}
          <div className="space-y-6">
             <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
              <History size={16} /> Top_Contributors
            </h3>
            <div className="space-y-3">
              {[
                { name: '0xFA...57', xp: 12450 },
                { name: '0x12...BC', xp: 8200 },
                { name: '0x99...FC', xp: 6540 },
              ].map((user, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-white/40">#{i+1} {user.name}</span>
                  <span className="text-orange-500/60 font-bold">{user.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ecosystem Links */}
          <div className="pt-12 border-t border-white/5 space-y-4">
             <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Ecosystem_Matrix</h3>
             <div className="grid grid-cols-2 gap-3">
               {[
                 { l: 'DOCS', h: 'https://0xpolygonmiden.github.io/miden-base/' },
                 { l: 'GITHUB', h: 'https://github.com/0xPolygonMiden' },
                 { l: 'FAUCET', h: '/deploy-faucet' },
                 { l: 'EXPLORER', h: 'https://scan.miden.dev' }
               ].map(link => (
                 <a 
                  key={link.l} 
                  href={link.h} 
                  className="block p-2 border border-white/5 text-[8px] uppercase tracking-widest text-white/40 hover:text-orange-500 hover:border-orange-500/30 transition-all font-bold"
                 >
                   {link.l}
                 </a>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
