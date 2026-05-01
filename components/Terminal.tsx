'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Terminal as TerminalIcon, Send, XCircle, Search, Cpu, Sun, Moon, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

const CustomCodeBlock = ({ node, inline, className, children, theme, ...props }: any) => {
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
      <div className="relative group my-4 flex flex-col bg-[#0D0D0E] border border-[#1A1A1C] rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-3 h-8 bg-[#121214] border-b border-[#1A1A1C] text-[10px] text-[#8E9299]">
          <span>{match[1]}</span>
          <button
            onClick={handleCopy}
            className="hover:text-[#FF6600] transition-colors flex items-center gap-2"
            aria-label="Copy code"
          >
            <Copy size={12} />
            <span>{copied ? 'COPIED' : 'COPY'}</span>
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
    <code {...props} className={`px-1 py-0.5 rounded-sm ${theme === 'light' ? 'text-[#FF6600] bg-[#F3F4F6] font-bold' : 'text-[#FF79C6] bg-[#1A1A1C]'}`}>
        {children}
    </code>
  );
};

function AssistantMessage({ content, theme }: { content: string, theme: 'light' | 'dark' }) {
  const codeIndex = content.indexOf('```');
  
  const proseClass = theme === 'light' 
    ? "prose prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0 max-w-none text-[11px] prose-p:leading-relaxed prose-headings:text-black prose-a:text-[#FF6600] text-black"
    : "prose prose-invert prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0 max-w-none text-[11px] prose-p:leading-relaxed prose-headings:text-gray-100 prose-a:text-[#FF6600]";

  if (codeIndex <= 0) {
    return (
       <div className={proseClass}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: (props) => <CustomCodeBlock theme={theme} {...props} /> }}
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
        <details className={`group border rounded-md overflow-hidden ${theme === 'light' ? 'border-[#E5E7EB] bg-[#F9FAFB]' : 'border-[#1A1A1C] bg-[#121214]'}`}>
          <summary className={`cursor-pointer px-4 py-3 text-[10px] hover:text-[#FF6600] font-bold select-none list-none flex items-center gap-2 ${theme === 'light' ? 'text-[#6B7280]' : 'text-[#8E9299]'}`}>
            <span className="group-open:hidden">[+] Expand reasoning...</span>
            <span className="hidden group-open:inline">[-] Collapse reasoning</span>
          </summary>
          <div className={`p-4 border-t text-[11px] prose-p:leading-relaxed max-w-none prose ${theme === 'light' ? 'border-[#E5E7EB] text-[#4B5563] prose-p:text-[#4B5563] prose-headings:text-black prose-a:text-[#FF6600]' : 'border-[#1A1A1C] text-[#A1A1AA] prose-invert prose-headings:text-gray-100 prose-a:text-[#FF6600]'}`}>
             <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: (props) => <CustomCodeBlock theme={theme} {...props} /> }}>
               {thoughts}
             </ReactMarkdown>
          </div>
        </details>
      )}
      <div className={proseClass}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: (props) => <CustomCodeBlock theme={theme} {...props} /> }}
        >
          {rest}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function TerminalUI() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [autoScrollEn, setAutoScrollEn] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('miden-terminal-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
    }
    const savedMessages = localStorage.getItem('miden-terminal-messages');
    if (savedMessages) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Welcome to **MidenDev**. I am an expert AI assistant for the Miden blockchain.\n\nType your prompt below to start building Miden smart contracts. E.g. _"build me a token vault contract"_',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('miden-terminal-theme', theme);
    }
  }, [theme, isInitialized]);

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
    <div className={`flex flex-col h-full font-mono selection:bg-[#FF6600]/30 selection:text-black ${theme === 'light' ? 'bg-[#FFFFFF] text-black' : 'bg-[#0A0A0B] text-[#E4E4E7]'}`}>
      {/* Header Bar */}
      <header className={`flex-none h-12 border-b flex items-center justify-between px-4 sm:px-6 select-none ${theme === 'light' ? 'border-[#E5E7EB] bg-[#F9FAFB]' : 'border-[#1A1A1C] bg-[#0E0E10]'}`}>
        <Link href="/" className="flex items-center gap-3 sm:gap-4 hover:opacity-80 transition-opacity">
          <div className="w-3 h-3 rounded-full bg-[#FF6600] shadow-[0_0_8px_#FF6600]"></div>
          <h1 className="text-[10px] sm:text-xs tracking-widest font-bold text-[#FF6600]">
            <span className="hidden sm:inline">MIDEN.DEV // TERMINAL_V1</span>
            <span className="inline sm:hidden">MIDEN.DEV</span>
          </h1>
        </Link>
        <div className={`flex items-center gap-4 sm:gap-6 text-[10px] ${theme === 'light' ? 'text-[#6B7280]' : 'text-[#8E9299]'}`}>
          <span className="hidden sm:inline">PROMPT_TOKENS: --</span>
          <span className="hidden sm:inline">LATENCY: --ms</span>
          <span className="hidden sm:inline text-[#FF6600]">STATUS: CONNECTED</span>
          <span className="sm:hidden text-[#FF6600]">LIVE</span>
          
          <div className="flex gap-4 sm:gap-6 items-center">
            <button 
              type="button" 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1 hover:text-[#FF6600] transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
            </button>
            <button 
              type="button" 
              onClick={handleExport}
              className="flex items-center gap-1 hover:text-[#FF6600] transition-colors"
              title="Export Session"
            >
              <Download size={12} />
              <span className="hidden sm:inline">EXPORT</span>
            </button>
            <button 
              type="button" 
              onClick={handleClear}
              className="flex items-center gap-1 hover:text-[#FF6600] transition-colors"
              title="Clear History"
            >
              <XCircle size={12} />
              <span className="hidden sm:inline">CLEAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Terminal Area */}
      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 ${theme === 'light' ? 'bg-[#FFFFFF]' : 'bg-[#0A0A0B]'}`}
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={message.id}
              className="flex flex-col max-w-4xl mx-auto w-full gap-1 text-[11px] leading-relaxed"
            >
              {message.timestamp && (
                <div className={`text-[9px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'} ${message.role === 'user' ? 'text-left ml-6' : 'text-right'}`}>
                  {message.timestamp}
                </div>
              )}
              <div className="flex gap-2 w-full">
                <span className="text-[#FF6600] shrink-0 font-bold mt-0.5">
                  {message.role === 'user' ? '➜' : '●'}
                </span>
                
                <div className={`flex-1 min-w-0 ${
                  message.role === 'user' 
                    ? (theme === 'light' ? 'text-[#4B5563] font-semibold' : 'text-[#8E9299]') 
                    : (theme === 'light' ? 'text-black' : 'text-[#A1A1AA]')
                }`}>
                  {message.role === 'user' ? (
                     <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                     <AssistantMessage content={message.content} theme={theme} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex max-w-4xl mx-auto w-full gap-3 text-[11px] leading-relaxed">
             <div className="flex gap-2 w-full">
                <span className="text-[#FF6600] shrink-0 font-bold mt-0.5">●</span>
                <div className="flex gap-1 items-center h-4 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-bounce" />
                </div>
             </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Input Area */}
      <footer className={`flex-none p-4 pb-4 sm:pb-6 border-t ${theme === 'light' ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#0A0A0B] border-[#1A1A1C]'}`}>
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between opacity-60 italic select-none">
            <span className={`text-[10px] ${theme === 'light' ? 'text-[#6B7280]' : 'text-[#8E9299]'}`}>System Prompt: <span className="text-[#FF6600] not-italic">LOADED_&_STRICT</span></span>
            <span className={`text-[10px] ${theme === 'light' ? 'text-[#6B7280]' : 'text-[#8E9299]'}`}>v0.13 API</span>
          </div>
          <form onSubmit={handleSubmit} className={`rounded-md p-3 flex items-center gap-3 border transition-colors focus-within:border-[#FF6600]/50 ${theme === 'light' ? 'bg-[#F9FAFB] border-[#D1D5DB]' : 'bg-[#1A1A1C] border-[#2D2D30]'}`}>
            <span className="text-[#FF6600] animate-pulse font-bold">_</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Type your coding request..."
              className={`bg-transparent border-none outline-none flex-1 text-[11px] ${theme === 'light' ? 'text-black placeholder-[#9CA3AF]' : 'text-[#E4E4E7] placeholder-[#8E9299]'}`}
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`disabled:opacity-30 transition-colors ${theme === 'light' ? 'text-[#9CA3AF] hover:text-[#FF6600] disabled:hover:text-[#9CA3AF]' : 'text-[#8E9299] hover:text-[#FF6600] disabled:hover:text-[#8E9299]'}`}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
