'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Terminal, Database, Cpu, Github, Book, Twitter, ArrowRight, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TYPING_TEXT = "miden-client tx new --private";

export default function LandingPage() {
  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  // Typing effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(TYPING_TEXT.substring(0, i));
      i++;
      if (i > TYPING_TEXT.length) {
        clearInterval(interval);
      }
    }, 100);

    const cursorInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, []);

  const SAMPLE_CODE = `#[component]
pub struct TokenVault;

impl TokenVault {
    #[export]
    pub fn deposit(&self, note_ptr: Word) {
        let slot = StorageSlotName::new("miden::component::vault::balances");
        let caller = self.get_id();
        assert!(caller != AccountId::zero(), "invalid caller");
    }
}`;

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-300 font-mono selection:bg-[#FF6600]/30 selection:text-white flex flex-col">
      {/* Navbar Minimal */}
      <header className="border-b border-gray-800 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Terminal className="text-[#FF6600] w-6 h-6" />
          <span className="text-[#FF6600] font-bold tracking-widest text-sm">MIDEN.DEV</span>
        </div>
        <Link 
          href="/terminal"
          className="text-xs px-4 py-2 border border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600] hover:text-black transition-colors uppercase tracking-widest font-bold"
        >
          Launch Terminal
        </Link>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-24 px-6 gap-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl tracking-tight"
          >
            Build on Miden, <br className="hidden md:block"/>
            <span className="text-[#FF6600]">Without Leaving the Terminal.</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl mt-8"
          >
            <div className="bg-[#161B22] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
              <div className="flex items-center px-4 py-3 border-b border-gray-800 bg-[#0D1117] gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                <span className="ml-4 text-xs text-gray-500">bash — miden-client</span>
              </div>
              <div className="p-6 text-left text-sm whitespace-pre-wrap flex items-start gap-3 h-24">
                <span className="text-[#FF6600] mt-0.5 font-bold">~ ❯</span>
                <span className="text-gray-100 mt-0.5">
                  {typedText}
                  <span className={`inline-block w-2.5 h-4 ml-1 bg-[#FF6600] align-middle ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}></span>
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Link 
              href="/terminal"
              className="inline-flex items-center gap-2 bg-[#FF6600] text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#CC5200] transition-colors group"
            >
              Start Building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 border-t border-gray-800 bg-[#0D1117]/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 border border-gray-800 bg-[#161B22] hover:border-[#FF6600]/50 transition-colors"
              >
                <Cpu className="text-[#FF6600] w-8 h-8 mb-6" />
                <h3 className="text-lg font-bold text-white mb-3">Client-Side Proving</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Generate ZK proofs locally without exposing execution traces. MidenDev strictly enforces zero-knowledge architecture best practices.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-8 border border-gray-800 bg-[#161B22] hover:border-[#FF6600]/50 transition-colors"
              >
                <Database className="text-[#FF6600] w-8 h-8 mb-6" />
                <h3 className="text-lg font-bold text-white mb-3">UTXO State Visualizer</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Easily model complex note flows. P2ID, SWAP, and Conditional notes mapped naturally from your prompt to MASM.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="p-8 border border-gray-800 bg-[#161B22] hover:border-[#FF6600]/50 transition-colors"
              >
                <Terminal className="text-[#FF6600] w-8 h-8 mb-6" />
                <h3 className="text-lg font-bold text-white mb-3">AI-Assisted MASM</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  From Rust SDK components straight to deployment scripts. We automatically handle `#![no_std]` constraints and AuthSingleSig correctly.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Code Preview */}
        <section className="py-24 px-6 border-t border-gray-800 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF6600]/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Designed for <br/> <span className="text-[#FF6600]">Complex Privacy Logic.</span></h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-[#FF6600]/10 p-1 rounded text-[#FF6600]">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-white mb-1 tracking-widest text-sm">STATEFUL ACCOUNTS</strong>
                    <p className="text-sm text-gray-400">Map custom Rust structs to Miden&apos;s typed storage slots instantly.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-[#FF6600]/10 p-1 rounded text-[#FF6600]">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-white mb-1 tracking-widest text-sm">NOTE COMPATIBILITY</strong>
                    <p className="text-sm text-gray-400">Never panic on access controls. MidenDev enforces proper assertion checks across note scripts.</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-10">
                <Link 
                  href="/terminal"
                  className="text-[#FF6600] hover:text-white transition-colors border-b border-[#FF6600] hover:border-white pb-1 font-bold text-sm tracking-widest uppercase"
                >
                  Start your first project ➜
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-gray-800 text-xs text-gray-400">
                  lib.rs
                </div>
                <div className="p-4 overflow-auto text-xs leading-relaxed max-h-[350px]">
                  <SyntaxHighlighter
                    language="rust"
                    style={dracula}
                    PreTag="div"
                    className="!m-0 !bg-transparent !p-0"
                  >
                    {SAMPLE_CODE}
                  </SyntaxHighlighter>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 bg-[#0B0E14]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="text-[#FF6600] w-4 h-4" />
            <span className="text-gray-400 text-xs tracking-widest font-bold">MIDEN.DEV</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-[#FF6600] transition-colors flex items-center gap-1 group">
              <Github className="w-4 h-4 group-hover:scale-110 transition-transform" /> GitHub
            </a>
            <a href="#" className="hover:text-[#FF6600] transition-colors flex items-center gap-1 group">
              <Book className="w-4 h-4 group-hover:scale-110 transition-transform" /> Docs
            </a>
            <a href="#" className="hover:text-[#FF6600] transition-colors flex items-center gap-1 group">
              <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" /> Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
