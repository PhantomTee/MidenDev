'use client';

import React, { useState } from 'react';
import { TerminalPageLayout } from '@/components/TerminalPageLayout';
import { MidenClient, AccountType } from '@miden-sdk/miden-sdk';

export default function DeployFaucetPage() {
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState('8');
  const [maxSupply, setMaxSupply] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLogs([]);
    addLog('COMMENCING GENESIS_ACCOUNT_PROCEDURE...');

    try {
      addLog('INITIALIZING MIDEN KERNEL...');
      const client = await MidenClient.create();
      
      addLog(`PARAMS: SYMBOL=${symbol}, DECIMALS=${decimals}, SUPPLY=${maxSupply}`);

      // Real Logic as requested:
      const account = await client.accounts.create({ 
        type: AccountType.FungibleFaucet, 
        symbol, 
        decimals: parseInt(decimals), 
        maxSupply: BigInt(maxSupply), 
        storage: 'public' 
      });

      addLog('SUCCESS: FUNGIBLE FAUCET DEPLOYED.');
      addLog(`FAUCET_ID: ${account.id}`);
      addLog('STORAGE: PUBLIC');
      addLog('ACCOUNT_HAS_BEEN_PERSISTED_TO_LOCAL_DATABASE.');

    } catch (err: any) {
      addLog(`CRITICAL: Deployment failure.`);
      addLog(`ERROR_CODE: ${err.name || 'ABORT'}`);
      addLog(`MESSAGE: ${err.message || 'Check terminal logs'}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TerminalPageLayout title="Faucet Launcher">
      <form onSubmit={handleDeploy} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 text-xs">
          <div className="space-y-2">
            <label className="uppercase tracking-widest text-orange-500/60">Token Symbol [e.g. MILK]</label>
            <input 
              type="text" 
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="SYMBOL"
              className="w-full bg-black border border-orange-500 p-3 outline-none focus:bg-orange-500/10 transition-colors rounded-none"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="uppercase tracking-widest text-orange-500/60">Decimals</label>
              <input 
                type="number" 
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                className="w-full bg-black border border-orange-500 p-3 outline-none focus:bg-orange-500/10 transition-colors rounded-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="uppercase tracking-widest text-orange-500/60">Max Supply</label>
              <input 
                type="number" 
                value={maxSupply}
                onChange={(e) => setMaxSupply(e.target.value)}
                placeholder="1000000000"
                className="w-full bg-black border border-orange-500 p-3 outline-none focus:bg-orange-500/10 transition-colors rounded-none"
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 border border-orange-500 bg-orange-500 text-black font-black uppercase tracking-[0.2em] hover:bg-black hover:text-orange-500 transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? 'WORKING...' : '[ DEPLOY FAUCET ]'}
        </button>
      </form>

      {logs.length > 0 && (
        <div className="mt-8 border-t border-orange-500/30 pt-6">
          <div className="bg-black/50 p-4 font-mono text-[10px] sm:text-xs text-orange-500 overflow-x-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={log.includes('CRITICAL') ? 'text-red-500' : ''}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </TerminalPageLayout>
  );
}
