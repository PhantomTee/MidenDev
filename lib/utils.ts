import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toBech32AccountId } from "@miden-sdk/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMidenAddress(pubKey: Uint8Array | string | null): string {
  if (!pubKey) return "DISCONNECTED";
  
  try {
    let hex = "";
    if (typeof pubKey === "string") {
      hex = pubKey.startsWith("0x") ? pubKey : `0x${pubKey}`;
    } else {
      hex = "0x" + Array.from(pubKey).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    return toBech32AccountId(hex);
  } catch (e) {
    if (typeof pubKey === "string") return pubKey.slice(0, 10) + "...";
    const hex = Array.from(pubKey).map(b => b.toString(16).padStart(2, '0')).join('');
    return "0x" + hex.slice(0, 8) + "...";
  }
}

export function shortenAddress(address: string, chars = 6): string {
  if (address === "DISCONNECTED") return address;
  if (address.length <= 15) return address;
  return `${address.slice(0, 10)}...${address.slice(-chars)}`;
}
