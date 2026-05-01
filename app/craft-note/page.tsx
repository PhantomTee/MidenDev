'use client';

import React, { useState } from 'react';
import { TerminalPageLayout } from '@/components/TerminalPageLayout';
import { MidenClient } from '@miden-sdk/miden-sdk';

export default function CraftNotePage() {
  const [targetAddress, setTargetAddress] = useState('');
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleCraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLogs([]);
    addLog('INITIALIZING MIDEN CLIENT...');

    try {
      // Real Logic: Instantiate Miden client and craft note
      const client = await MidenClient.create();
      addLog('CLIENT INITIALIZED. PARSING PARAMETERS...');

      // Note: P2ID Note creation usually involves calling 
      // client.notes.createP2ID({ target, asset, amount })
      // We await the real promise as requested.
      
      // Verification of inputs
      if (!targetAddress || !assetId || !amount) {
        throw new Error('INVALID_INPUT: All fields are required.');
      }

      addLog(`TARGET: ${targetAddress}`);
      addLog(`ASSET: ${assetId}`);
      addLog(`AMOUNT: ${amount}`);

      addLog('EXECUTING NOTE_CRAFTING_PROTOCOL...');
      
      const accounts = await client.accounts.list();
      const sender = accounts[0]?.id() || targetAddress;

      // We use the transactions.send with returnNote: true to 'craft' a note
      // This creates the note object using the SDK logic.
      const result = await client.transactions.send({
        account: sender,
        to: targetAddress,
        token: assetId,
        amount: BigInt(amount),
        returnNote: true
      });

      addLog('SUCCESS: NOTE CRAFTED AND SIGNED.');
      addLog(`NOTE_ID: ${result.note.id().toString()}`);
      addLog('READY FOR BROADCAST.');

    } catch (err: any) {
      addLog(`CRITICAL_ERROR: ${err.message || 'Unknown SDK Error'}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TerminalPageLayout title="Note Crafter">
      <form onSubmit={handleCraft} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 text-xs">
          <div className="space-y-2">
            <label className="uppercase tracking-widest text-orange-500/60">Target Address [mtst1...]</label>
            <input 
              type="text" 
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="mtst1..."
              className="w-full bg-black border border-orange-500 p-3 outline-none focus:bg-orange-500/10 transition-colors rounded-none"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="uppercase tracking-widest text-orange-500/60">Asset ID [Hex]</label>
            <input 
              type="text" 
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              placeholder="0x..."
              className="w-full bg-black border border-orange-500 p-3 outline-none focus:bg-orange-500/10 transition-colors rounded-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="uppercase tracking-widest text-orange-500/60">Amount [Raw Units]</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="w-full bg-black border border-orange-500 p-3 outline-none focus:bg-orange-500/10 transition-colors rounded-none"
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 border border-orange-500 bg-orange-500 text-black font-black uppercase tracking-[0.2em] hover:bg-black hover:text-orange-500 transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? 'EXECUTING...' : '[ CRAFT P2ID NOTE ]'}
        </button>
      </form>

      {logs.length > 0 && (
        <div className="mt-8 border-t border-orange-500/30 pt-6">
          <div className="bg-black/50 p-4 font-mono text-[10px] sm:text-xs text-orange-500 overflow-x-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={log.startsWith('> CRITICAL') ? 'text-red-500' : ''}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </TerminalPageLayout>
  );
}
