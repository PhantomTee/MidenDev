'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Terminal as TerminalIcon, Send, XCircle, Search, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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
      <div className="relative group my-4 flex flex-col bg-[#0D0D0E] border border-[#1A1A1C]">
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
    <code {...props} className="text-[#FF79C6] bg-[#1A1A1C] px-1 py-0.5 rounded-sm">
        {children}
    </code>
  );
};

function AssistantMessage({ content }: { content: string }) {
  const codeIndex = content.indexOf('```');
  
  if (codeIndex <= 0) {
    return (
       <div className="prose prose-invert prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0 max-w-none text-[11px] prose-p:leading-relaxed prose-headings:text-gray-100 prose-a:text-[#FF6600]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: CustomCodeBlock }}
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
        <details className="group border border-[#1A1A1C] bg-[#121214] rounded-md overflow-hidden">
          <summary className="cursor-pointer px-4 py-3 text-[10px] text-[#8E9299] hover:text-[#FF6600] font-bold select-none list-none flex items-center gap-2">
            <span className="group-open:hidden">[+] Expand reasoning...</span>
            <span className="hidden group-open:inline">[-] Collapse reasoning</span>
          </summary>
          <div className="p-4 border-t border-[#1A1A1C] text-[#A1A1AA] prose prose-invert prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0 max-w-none text-[11px] prose-p:leading-relaxed">
             <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CustomCodeBlock }}>
               {thoughts}
             </ReactMarkdown>
          </div>
        </details>
      )}
      <div className="prose prose-invert prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0 max-w-none text-[11px] prose-p:leading-relaxed prose-headings:text-gray-100 prose-a:text-[#FF6600]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: CustomCodeBlock }}
        >
          {rest}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function TerminalUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to **MidenDev**. I am an expert AI assistant for the Miden blockchain.\n\nType your prompt below to start building Miden smart contracts. E.g. _"build me a token vault contract"_'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [autoScrollEn, setAutoScrollEn] = useState(true);

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
  }, []);

  const handleClear = () => {
    setMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

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
    <div className="flex flex-col h-full bg-[#0A0A0B] text-[#E4E4E7] font-mono selection:bg-[#FF6600]/30 selection:text-black">
      {/* Header Bar */}
      <header className="flex-none h-12 border-b border-[#1A1A1C] flex items-center justify-between px-6 bg-[#0E0E10] select-none">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[#FF6600] shadow-[0_0_8px_#FF6600]"></div>
          <h1 className="text-xs tracking-widest font-bold text-[#FF6600]">MIDEN.DEV // TERMINAL_V1</h1>
        </div>
        <div className="flex items-center gap-6 text-[10px] text-[#8E9299]">
          <span className="hidden sm:inline">PROMPT_TOKENS: --</span>
          <span className="hidden sm:inline">LATENCY: --ms</span>
          <span className="text-[#FF6600]">STATUS: CONNECTED</span>
          <button 
            type="button" 
            onClick={handleClear}
            className="flex items-center gap-1 hover:text-[#FF6600] transition-colors"
          >
            <XCircle size={12} />
            CLEAR HISTORY
          </button>
        </div>
      </header>

      {/* Terminal Area */}
      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0A0A0B]"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={message.id}
              className="flex max-w-4xl mx-auto w-full gap-3 text-[11px] leading-relaxed"
            >
              <div className="flex gap-2 w-full">
                <span className="text-[#FF6600] shrink-0 font-bold mt-0.5">
                  {message.role === 'user' ? '➜' : '●'}
                </span>
                
                <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-[#8E9299]' : 'text-[#A1A1AA]'}`}>
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
      <footer className="flex-none p-4 pb-6 bg-[#0A0A0B] border-t border-[#1A1A1C]">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between opacity-60 italic select-none">
            <span className="text-[10px] text-[#8E9299]">System Prompt: <span className="text-[#FF6600] not-italic">LOADED_&_STRICT</span></span>
            <span className="text-[10px] text-[#8E9299]">v0.13 API</span>
          </div>
          <form onSubmit={handleSubmit} className="bg-[#1A1A1C] rounded-md p-3 flex items-center gap-3 border border-[#2D2D30] focus-within:border-[#FF6600]/50 transition-colors">
            <span className="text-[#FF6600] animate-pulse font-bold">_</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Type your coding request..."
              className="bg-transparent border-none outline-none flex-1 text-[11px] text-[#E4E4E7] placeholder-[#8E9299]"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="text-[#8E9299] hover:text-[#FF6600] disabled:opacity-30 transition-colors disabled:hover:text-[#8E9299]"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
