'use client';

import dynamic from 'next/dynamic';

const ConnectWallet = dynamic(() => import('@/components/ConnectWallet'), { ssr: false });

export default ConnectWallet;
