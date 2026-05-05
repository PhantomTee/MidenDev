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
  Award,
  Code2,
  BookOpen,
  FileText,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '@miden-sdk/miden-wallet-adapter';
import { formatMidenAddress, shortenAddress } from '@/lib/utils';
import { StatusBar } from '@/components/StatusBar';
import { useAuth } from '@/components/FirebaseAuthProvider';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  setDoc, 
  getDoc,
  increment,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { linkWithPopup, TwitterAuthProvider, GithubAuthProvider, getAdditionalUserInfo } from 'firebase/auth';

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
  authorId: string;
}

interface UserProfile {
  xp: number;
  completedTaskIds: string[];
  midenAddress: string;
  twitterConnected?: boolean;
  twitterId?: string;
  githubConnected?: boolean;
  githubUsername?: string;
  telegramConnected?: boolean;
  telegramUsername?: string;
}

interface UserTask {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  platform: 'X' | 'GitHub' | 'Discord' | 'Telegram' | 'Miden';
}

const DEFAULT_TASKS: UserTask[] = [
  { id: 't1', title: 'Follow @PolygonMiden on X', xp: 50, completed: false, platform: 'X' },
  { id: 't2', title: 'Star the Miden-VM Repo', xp: 100, completed: false, platform: 'GitHub' },
  { id: 't3', title: 'Join the Miden Discord', xp: 50, completed: false, platform: 'Discord' },
  { id: 't5', title: 'Follow the Miden Telegram Channel', xp: 50, completed: false, platform: 'Telegram'},
  { id: 't4', title: 'Submit Your First Build', xp: 500, completed: false, platform: 'Miden' },
];

export default function MidenHub() {
  const { connected, publicKey } = useWallet();
  const { user, login, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'tasks' | 'profile' | 'submit' | 'admin'>('feed');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ xp: 0, completedTaskIds: [], midenAddress: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filterType, setFilterType] = useState<Submission['type'] | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'approved' | 'featured'>('All');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Tool' as Submission['type'],
    url: '',
    tags: '',
  });

  const walletAddr = useMemo(() => formatMidenAddress(publicKey), [publicKey]);

  // Sync Submissions
  useEffect(() => {
    // Determine query based on admin status
    let q;
    if (isAdmin) {
      q = query(collection(db, 'submissions'));
    } else {
      q = query(
        collection(db, 'submissions'),
        where('status', 'in', ['approved', 'featured'])
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let subs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Submission));
      // Sort client-side to avoid requiring composite indexes
      subs.sort((a, b) => b.timestamp - a.timestamp);
      setSubmissions(subs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Sync User Profile
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!user) {
      setProfile({ xp: 0, completedTaskIds: [], midenAddress: '' });
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    const unsubscribe = onSnapshot(doc(db, 'userProfiles', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        // Initial creation
        setDoc(doc(db, 'userProfiles', user.uid), {
          xp: 0,
          completedTaskIds: [],
          midenAddress: walletAddr
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `userProfiles/${user.uid}`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `userProfiles/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user, walletAddr]);

  // Derived Tasks State
  const userTasks = useMemo(() => {
    return DEFAULT_TASKS.map(task => ({
      ...task,
      completed: profile.completedTaskIds.includes(task.id)
    }));
  }, [profile]);

  const xp = profile.xp;

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
  const handleLike = async (id: string) => {
    try {
      await updateDoc(doc(db, 'submissions', id), {
        likes: increment(1)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const [verifyingTask, setVerifyingTask] = useState<string | null>(null);

  const completeTask = async (id: string, taskXp: number, platform: string) => {
    if (!user) return login();
    
    // Eligibility Check
    if (platform === 'X' && !profile.twitterConnected) return alert('Please connect Twitter first in the Profile tab.');
    if (platform === 'GitHub' && !profile.githubConnected) return alert('Please connect GitHub first in the Profile tab.');
    if (platform === 'Telegram' && !profile.telegramConnected) return alert('Please connect Telegram first in the Profile tab.');

    setVerifyingTask(id);
    try {
      if (id === 't4') {
        const hasSubmission = submissions.some(s => s.authorId === user.uid);
        if (!hasSubmission) {
          alert('You must submit a build first to complete this task.');
          setVerifyingTask(null);
          return;
        }
      } else if (platform !== 'Miden' && platform !== 'Discord') {
        const res = await fetch('/api/verify-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            taskId: id, 
            githubUsername: profile.githubUsername,
            twitterId: profile.twitterId,
            telegramUsername: profile.telegramUsername
          })
        });

        const data = await res.json();
        if (!res.ok) {
          alert(`Verification failed: ${data.error || 'Server error'}`);
          setVerifyingTask(null);
          return;
        }
      } else if (platform === 'Discord') {
          alert('Discord verification is currently not set up. Please configure the integration.');
          setVerifyingTask(null);
          return;
      }

      await updateDoc(doc(db, 'userProfiles', user.uid), {
        xp: increment(taskXp),
        completedTaskIds: arrayUnion(id)
      });
      alert('Task verified and completed!');
    } catch (e: any) {
      alert(`Error verifying task: ${e.message}`);
    } finally {
      setVerifyingTask(null);
    }
  };

  const handleConnectProvider = async (providerName: 'twitter' | 'github') => {
    if (!user) return login();
    try {
      const provider = providerName === 'twitter' 
        ? new TwitterAuthProvider() 
        : new GithubAuthProvider();
      
      const result = await linkWithPopup(auth.currentUser!, provider);
      const additionalInfo = getAdditionalUserInfo(result);
      
      const updates: any = {
        [`${providerName}Connected`]: true
      };

      if (providerName === 'github' && additionalInfo?.profile?.login) {
        updates.githubUsername = additionalInfo.profile.login;
      }
      if (providerName === 'twitter' && (additionalInfo?.profile?.id_str || additionalInfo?.profile?.id)) {
        updates.twitterId = (additionalInfo.profile.id_str || additionalInfo.profile.id).toString();
      }

      await updateDoc(doc(db, 'userProfiles', user.uid), updates);
      alert(`Successfully connected ${providerName}!`);
    } catch (error: any) {
      console.error(error);
      alert(`Failed to connect ${providerName}: ${error.message} (Note: Provider may need to be enabled in Firebase Console)`);
    }
  };

  const [tUsername, setTUsername] = useState('');
  const handleConnectTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return login();
    if (!tUsername) return;
    try {
      await updateDoc(doc(db, 'userProfiles', user.uid), {
        telegramConnected: true,
        telegramUsername: tUsername
      });
      alert('Telegram connected!');
    } catch (error) {
      console.error(error);
      alert('Failed to connect Telegram');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return login();
    if (!connected) return alert('Connect wallet to verify author');
    
    try {
      await addDoc(collection(db, 'submissions'), {
        title: formData.title,
        author: walletAddr,
        description: formData.description,
        type: formData.type,
        url: formData.url,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        likes: 0,
        timestamp: Date.now(),
        status: 'pending',
        authorId: user.uid
      });
      setActiveTab('feed');
      setFormData({ title: '', description: '', type: 'Tool', url: '', tags: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'submissions');
    }
  };

  const approveSubmission = async (id: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'submissions', id), { 
        status: 'approved' 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const rejectSubmission = async (id: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'submissions', id), { 
        status: 'rejected' 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.status !== 'pending' && s.status !== 'rejected' &&
    (filterType === 'All' || s.type === filterType) &&
    (filterStatus === 'All' || s.status === filterStatus) &&
    (s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0D1117] font-mono text-white selection:bg-orange-500/30 overflow-hidden">
      <StatusBar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-10">
          <header className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase text-orange-500">MidenHub_</h1>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] mt-2">The Central Archive for Verifiable Innovation</p>
            </div>
            {!user && !authLoading && (
              <button 
                onClick={login}
                className="bg-orange-500 text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
              >
                Login with Google
              </button>
            )}
            {user && (
              <div className="text-right">
                <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest block">AGENT: {user.email?.split('@')[0]}</span>
                <span className="text-[8px] text-white/20 uppercase tracking-tighter block">ID: {shortenAddress(user.uid, 4)}</span>
              </div>
            )}
          </header>

          {/* Navigation Tabs */}
          <div className="flex gap-8 border-b border-white/5 mb-10 overflow-x-auto no-scrollbar">
            {(['feed', 'tasks', 'profile', 'submit', 'admin'] as const).map(tab => (
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
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 px-4 py-2 border border-white/10 rounded">
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <Search size={18} className="text-white/20" />
                    <input 
                      type="text" 
                      placeholder="Search submissions, tags, builders..."
                      className="bg-transparent border-none outline-none text-sm w-full placeholder:text-white/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <select
                      className="bg-[#0D1117] border border-white/10 text-xs text-white/60 py-1.5 px-3 outline-none"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as Submission['type'] | 'All')}
                    >
                      <option value="All">All Types</option>
                      <option value="Tool">Tool</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Note">Note</option>
                      <option value="Contract">Contract</option>
                    </select>
                    <select
                      className="bg-[#0D1117] border border-white/10 text-xs text-white/60 py-1.5 px-3 outline-none"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'All' | 'approved' | 'featured')}
                    >
                      <option value="All">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="featured">Featured</option>
                    </select>
                  </div>
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
                          {task.platform === 'Telegram' && <Share2 size={20} />}
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
                        onClick={() => !task.completed && verifyingTask !== task.id && completeTask(task.id, task.xp, task.platform)}
                        disabled={task.completed || verifyingTask === task.id}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          task.completed 
                            ? 'text-orange-500' 
                            : verifyingTask === task.id
                            ? 'bg-orange-500/50 text-white animate-pulse'
                            : 'bg-orange-500 text-black hover:bg-white'
                        }`}
                      >
                        {task.completed ? <CheckCircle2 size={16} /> : verifyingTask === task.id ? 'VERIFYING...' : 'Claim'}
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

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                {!user ? (
                  <div className="text-center py-20 border border-white/5 bg-[#161B22]">
                    <User size={48} className="mx-auto text-orange-500/20 mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2 uppercase">Login Required</h2>
                    <p className="text-xs text-white/40 uppercase mb-8">Authentication required to view and link accounts</p>
                    <button 
                      onClick={login}
                      className="bg-orange-500 text-black px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-all"
                    >
                      Login with Google
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-8 border border-white/5 bg-[#161B22]">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-full border border-orange-500 flex items-center justify-center bg-orange-500/10">
                          <User size={28} className="text-orange-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold uppercase tracking-widest text-white">{user.email}</h2>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest mt-2">{walletAddr || 'WALLET NOT CONNECTED'}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-white/5 bg-[#0D1117] text-center">
                          <div className="text-2xl font-black text-orange-500 mb-1">{profile.xp}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest">Total XP</div>
                        </div>
                        <div className="p-4 border border-white/5 bg-[#0D1117] text-center">
                          <div className="text-2xl font-black text-white mb-1">{profile.completedTaskIds?.length || 0}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest">Tasks Done</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 border border-white/5 bg-[#161B22]">
                      <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-6 border-b border-white/5 pb-4">Social Accounts</h3>
                      <div className="space-y-4">
                        
                        <div className="flex items-center justify-between p-4 border border-white/5 bg-[#0D1117]">
                          <div className="flex items-center gap-4">
                            <Twitter size={20} className="text-white/40" />
                            <div>
                              <div className="text-sm font-bold uppercase tracking-widest text-white">X (Twitter)</div>
                              {profile.twitterConnected && <div className="text-[10px] text-orange-500 uppercase">Connected</div>}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleConnectProvider('twitter')}
                            disabled={profile.twitterConnected}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                              profile.twitterConnected ? 'text-white/20 border border-white/10' : 'bg-orange-500 text-black hover:bg-white'
                            }`}
                          >
                            {profile.twitterConnected ? 'Linked' : 'Connect'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-white/5 bg-[#0D1117]">
                          <div className="flex items-center gap-4">
                            <Github size={20} className="text-white/40" />
                            <div>
                              <div className="text-sm font-bold uppercase tracking-widest text-white">GitHub</div>
                              {profile.githubConnected && <div className="text-[10px] text-orange-500 uppercase">Connected</div>}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleConnectProvider('github')}
                            disabled={profile.githubConnected}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                              profile.githubConnected ? 'text-white/20 border border-white/10' : 'bg-orange-500 text-black hover:bg-white'
                            }`}
                          >
                            {profile.githubConnected ? 'Linked' : 'Connect'}
                          </button>
                        </div>

                        <form onSubmit={handleConnectTelegram} className="flex items-center justify-between p-4 border border-white/5 bg-[#0D1117] gap-4">
                          <div className="flex items-center gap-4 shrink-0">
                            <Share2 size={20} className="text-white/40" />
                            <div>
                              <div className="text-sm font-bold uppercase tracking-widest text-white">Telegram</div>
                              {profile.telegramConnected && <div className="text-[10px] text-orange-500 uppercase">@{profile.telegramUsername}</div>}
                            </div>
                          </div>
                          {profile.telegramConnected ? (
                            <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/20 border border-white/10 shrink-0">
                              Linked
                            </div>
                          ) : (
                            <div className="flex w-full justify-end max-w-xs relative items-center">
                              <span className="absolute left-3 text-white/40 text-xs">@</span>
                              <input 
                                type="text"
                                placeholder="username"
                                value={tUsername}
                                onChange={(e) => setTUsername(e.target.value)}
                                className="w-full bg-[#161B22] border border-white/10 pl-8 pr-4 py-2 text-xs focus:border-orange-500 outline-none text-white mr-2"
                              />
                              <button 
                                type="submit"
                                disabled={!tUsername}
                                className="shrink-0 bg-orange-500 text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                              >
                                Connect
                              </button>
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'submit' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                {!user ? (
                  <div className="text-center py-20 border border-white/5 bg-[#161B22]">
                    <Shield size={48} className="mx-auto text-orange-500/20 mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2 uppercase">Login Required</h2>
                    <p className="text-xs text-white/40 uppercase mb-8">Authentication required to push to queue</p>
                    <button 
                      onClick={login}
                      className="bg-orange-500 text-black px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-all"
                    >
                      Login with Google
                    </button>
                  </div>
                ) : !connected ? (
                  <div className="text-center py-20 border border-white/5 bg-[#161B22]">
                    <Shield size={48} className="mx-auto text-orange-500/20 mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2 uppercase">Connection Required</h2>
                    <p className="text-xs text-white/40 uppercase mb-8">Author identity must be verifiable on-chain</p>
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

                    <div className="pt-6 border-t border-white/5 mt-8 block">
                      <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Live Preview</h3>
                      <div className="p-6 border border-white/5 bg-[#161B22] hover:border-orange-500/30 transition-all flex flex-col group relative overflow-hidden pointer-events-none">
                         <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded border border-white/10 flex items-center justify-center bg-[#0D1117]">
                               {formData.type === 'Tool' && <Code2 size={16} className="text-white/60" />}
                               {formData.type === 'Tutorial' && <BookOpen size={16} className="text-white/60" />}
                               {formData.type === 'Note' && <FileText size={16} className="text-white/60" />}
                               {formData.type === 'Contract' && <Terminal size={16} className="text-white/60" />}
                             </div>
                             <div>
                               <h3 className="font-bold text-white uppercase tracking-widest text-sm group-hover:text-orange-500 transition-colors">
                                 {formData.title || 'Miden Explorer Alpha'}
                               </h3>
                               <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                                 {formData.type} {'//'} {shortenAddress(walletAddr || 'YOUR_WALLET')}
                               </div>
                             </div>
                           </div>
                         </div>
                         <p className="text-sm text-white/50 leading-relaxed mb-6 line-clamp-2">
                           {formData.description || 'EXPLAIN THE CORE LOGIC AND ZK-PROVING EFFICIENCY...'}
                         </p>
                         <div className="mt-auto">
                           <div className="flex flex-wrap gap-2 mb-4">
                             {(formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : ['ZK', 'MASM', 'P2ID']).map(tag => (
                               <span key={tag} className="text-[9px] px-2 py-1 bg-white/5 border border-white/10 text-white/60 font-mono">
                                 {tag}
                               </span>
                             ))}
                           </div>
                           <div className="flex items-center justify-between text-[11px] font-bold border-t border-white/5 pt-4 uppercase tracking-widest text-white/40">
                             <div className="flex gap-4">
                               <span className="flex items-center gap-1.5 transition-colors">
                                 <Heart size={14} /> 0
                               </span>
                               <span className="flex items-center gap-1.5 transition-colors">
                                 <MessageCircle size={14} /> 0
                               </span>
                             </div>
                             <span className="flex items-center gap-1.5 transition-colors">
                               <ExternalLink size={14} /> LAUNCH
                             </span>
                           </div>
                         </div>
                      </div>
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
                {!isAdmin ? (
                  <div className="text-center py-20 border border-white/5 bg-[#161B22]">
                    <Shield size={48} className="mx-auto text-orange-500/20 mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2 uppercase">Restricted Access</h2>
                    <p className="text-xs text-white/40 uppercase mb-8">Admin credentials required for moderation</p>
                  </div>
                ) : (
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
                           <button onClick={() => rejectSubmission(sub.id)} className="border border-white/10 text-white/40 px-4 py-2 text-[10px] font-bold uppercase hover:bg-red-500/20 hover:text-red-500 hover:border-red-500 transition-all">
                             Reject
                           </button>
                         </div>
                       </div>
                     ))
                   )}
                </div>
                )}
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
