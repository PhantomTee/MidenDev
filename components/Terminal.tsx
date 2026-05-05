'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Terminal as TerminalIcon, Send, XCircle, Search, Cpu, Sun, Moon, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useWallet } from '@miden-sdk/miden-wallet-adapter';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

const CustomCodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group my-4 flex flex-col bg-black border border-orange-500/30 rounded-none overflow-hidden">
        <div className="flex items-center justify-between px-3 h-8 bg-orange-500/5 border-b border-orange-500/30 text-[10px] text-orange-500/60 font-mono">
          <span className="uppercase tracking-widest">{match[1]}</span>
          <button
            onClick={handleCopy}
            className="hover:text-white transition-colors flex items-center gap-2"
            aria-label="Copy code"
          >
            <Copy size={12} />
            <span className="font-bold">{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
        <div className="p-4 overflow-x-auto text-[11px] leading-relaxed">
          <SyntaxHighlighter
            {...props}
            style={dracula}
            language={match[1]}
            PreTag="div"
            className="!m-0 !p-0 !bg-transparent"
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <code {...props} className="px-1 py-0.5 bg-orange-500/10 text-orange-500 font-bold border border-orange-500/20">
        {children}
    </code>
  );
};

function AssistantMessage({ content }: { content: string }) {
  const codeIndex = content.indexOf('```');
  
  const proseClass = "prose prose-invert prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0 max-w-none text-[11px] prose-p:leading-relaxed prose-headings:text-orange-500 prose-a:text-white prose-p:text-orange-500/90 prose-strong:text-orange-500 prose-code:text-orange-500";

  if (codeIndex <= 0) {
    return (
       <div className={proseClass}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: (props) => <CustomCodeBlock {...props} /> }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  const thoughts = content.substring(0, codeIndex).trim();
  const rest = content.substring(codeIndex);

  return (
    <div className="flex flex-col gap-4 w-full">
      {thoughts && (
        <details className="group border border-orange-500/20 bg-black/40 overflow-hidden rounded-none">
          <summary className="cursor-pointer px-4 py-3 text-[10px] hover:text-white font-bold select-none list-none flex items-center gap-2 text-orange-500/60 uppercase tracking-widest">
            <span className="group-open:hidden">[+] REASONING_UNIT</span>
            <span className="hidden group-open:inline">[-] COLLAPSE_COGNITION</span>
          </summary>
          <div className="p-4 border-t border-orange-500/20 text-[11px] prose-p:leading-relaxed max-w-none prose prose-invert prose-p:text-orange-500/70 prose-headings:text-orange-500">
             <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: (props) => <CustomCodeBlock {...props} /> }}>
               {thoughts}
             </ReactMarkdown>
          </div>
        </details>
      )}
      <div className={proseClass}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: (props) => <CustomCodeBlock {...props} /> }}
        >
          {rest}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function TerminalUI() {
  const { connected, publicKey } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [autoScrollEn, setAutoScrollEn] = useState(true);

  const shortenAddress = (pubKey: Uint8Array | null) => {
    if (!pubKey) return 'DISCONNECTED';
    const hex = Array.from(pubKey).map(b => b.toString(16).padStart(2, '0')).join('');
    const displayAddress = hex.startsWith('mtst1') ? hex : `mtst1${hex}`;
    return `${displayAddress.slice(0, 9)}...${displayAddress.slice(-4)}`;
  };

  useEffect(() => {
    const savedMessages = localStorage.getItem('miden-terminal-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(parsed);
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    } else {
       
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: '# MIDEN_DEV CORE LOADED\n\nWelcome to the specialized terminal for Polygon Miden.\n\nAvailable Protocols:\n- [/craft-note](/craft-note)\n- [/deploy-faucet](/deploy-faucet)\n- [/node-status](/node-status)\n\nType your command or prompt below.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      localStorage.setItem('miden-terminal-messages', JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  const handleScroll = () => {
    if (!mainRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScrollEn(isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (autoScrollEn) {
      scrollToBottom();
    }
  }, [messages, isLoading, autoScrollEn]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isInitialized]);

  const handleClear = () => {
    const defaultMessages: Message[] = [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome to **MidenDev**. I am an expert AI assistant for the Miden blockchain.\n\nType your prompt below to start building Miden smart contracts. E.g. _"build me a token vault contract"_',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(defaultMessages);
    localStorage.removeItem('miden-terminal-messages');
  };

  const handleExport = () => {
    const markdown = messages.map(m => `**${m.role === 'user' ? 'User' : 'MidenDev'}**:\n\n${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `miden-session-${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { 
      id: assistantMessageId, 
      role: 'assistant', 
      content: '', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      if (!response.body) throw new Error('No readable stream available');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let textBuffer = '';
      let streamBuffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          streamBuffer += decoder.decode(value, { stream: true });
          
          let eolIndex;
          while ((eolIndex = streamBuffer.indexOf('\n')) >= 0) {
            const line = streamBuffer.slice(0, eolIndex).trim();
            streamBuffer = streamBuffer.slice(eolIndex + 1);
            
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              if (dataStr) {
                 try {
                    const data = JSON.parse(dataStr);
                    textBuffer += data.content;
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId ? { ...msg, content: textBuffer } : msg
                    ));
                 } catch (err) {
                   console.error("Failed to parse SSE data", err);
                 }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Failed to connect to the MidenDev core. Please ensure your API keys are configured correctly.'
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex flex-col h-full font-mono selection:bg-orange-500/30 selection:text-black bg-[#0D1117] text-orange-500">
      {/* Terminal Content Area (Scrollable) */}
      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#07090D]"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={message.id}
              className="flex flex-col max-w-4xl mx-auto w-full gap-1 text-[11px] leading-relaxed"
            >
              <div className="flex gap-2 w-full">
                <span className="text-orange-500 shrink-0 font-bold mt-0.5">
                  {message.role === 'user' ? '➜' : '●'}
                </span>
                
                <div className={`flex-1 min-w-0 ${
                  message.role === 'user' 
                    ? 'text-orange-500/80 font-bold' 
                    : 'text-orange-500'
                }`}>
                  {message.role === 'user' ? (
                     <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                     <AssistantMessage content={message.content} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex max-w-4xl mx-auto w-full gap-3 text-[11px] leading-relaxed">
             <div className="flex gap-2 w-full">
                <span className="text-orange-500 shrink-0 font-bold mt-0.5">●</span>
                <div className="flex gap-1 items-center h-4 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-orange-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-orange-500 animate-pulse [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-orange-500 animate-pulse [animation-delay:0.4s]" />
                </div>
             </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 pb-4 sm:pb-6 border-t border-orange-500/30 bg-[#0D1117]">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between opacity-60 italic select-none">
            <span className="text-[10px] text-orange-500">System Protocol: <span className="text-orange-500 not-italic font-bold">STRICT_ORANGE</span></span>
            <span className="text-[10px] text-orange-500">MIDEN_SDK v0.14.5</span>
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 flex items-center gap-3 border border-orange-500 transition-colors focus-within:bg-orange-500/5 bg-black/20">
            <span className="text-orange-500 animate-pulse font-bold">_</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="ENTER_COMMAND_OR_PROMPT..."
              className="bg-transparent border-none outline-none flex-1 text-[11px] text-orange-500 placeholder-orange-900"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="disabled:opacity-30 transition-colors text-orange-500 hover:text-white"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
