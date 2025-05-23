import { createRoot } from 'react-dom/client'
// import { WalletProvider } from '@suiet/wallet-kit';
import App from './App.tsx'
import '@suiet/wallet-kit/style.css';
import './index.css'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
import { networkConfig } from './config/networkConfig.ts';


createRoot(document.getElementById('root')).render(
    // <WalletProvider>
    <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      <WalletProvider autoConnect>
        <App />
    {/* // </WalletProvider> */}
    </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
);