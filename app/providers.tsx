'use client';

import { MidenProvider } from "@miden-sdk/react";
import { ReactNode } from "react";
import { FirebaseAuthProvider } from "@/components/FirebaseAuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseAuthProvider>
      <MidenProvider 
        config={{
          rpcUrl: "testnet", 
        }}
        errorComponent={(err) => (
          <div style={{ color: "red", padding: "20px" }}>
            <h2>Miden Integration Error</h2>
            <pre>{err?.message || "Unknown error occurred"}</pre>
          </div>
        )}
      >
        {children}
      </MidenProvider>
    </FirebaseAuthProvider>
  );
}
