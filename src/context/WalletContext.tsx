import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { WalletAccount } from "@/types";
import { toast } from "@/lib/toast";

interface WalletContextType {
  isConnected: boolean;
  account: WalletAccount | null;
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);

  // Check if Sui wallet is available in window object
  const isSuiWalletAvailable = (): boolean => {
    return typeof window !== "undefined" && "suiWallet" in window;
  };

  // Connect to Sui wallet
  const connectToSuiWallet = async (): Promise<WalletAccount> => {
    try {
      if (!isSuiWalletAvailable()) {
        throw new Error(
          "Sui wallet not found. Please install Sui wallet extension"
        );
      }

      // @ts-ignore - Sui wallet types are not available
      const accounts = await window.suiWallet.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in Sui wallet");
      }

      // Use the first account
      const walletAddress = accounts[0];

      return {
        address: walletAddress,
        publicKey: walletAddress, // In a real implementation, you would get the actual public key
      };
    } catch (error) {
      console.error("Error connecting to Sui wallet:", error);
      throw error;
    }
  };

  // Mock wallet for testing - will be used as a fallback and for 'mock' wallet type
  const connectToMockWallet = async (): Promise<WalletAccount> => {
    // Mock successful connection
    return {
      address:
        "0x" +
        Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join(""),
      publicKey:
        "mock_public_key_" + Math.random().toString(36).substring(2, 15),
    };
  };

  // Mock Ethos wallet for UI demonstration
  const connectToEthosWallet = async (): Promise<WalletAccount> => {
    // Mock successful connection with an Ethos-like address
    return {
      address:
        "0x" +
        Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join(""),
      publicKey:
        "ethos_public_key_" + Math.random().toString(36).substring(2, 15),
    };
  };

  const connectWallet = async (preferredWalletType?: string) => {
    try {
      console.log("Connecting to wallet...", preferredWalletType);
      let connectedAccount: WalletAccount;
      let selectedWalletType = preferredWalletType || "sui";

      switch (selectedWalletType) {
        case "sui":
          if (isSuiWalletAvailable()) {
            connectedAccount = await connectToSuiWallet();
            setWalletType("sui");
          } else {
            throw new Error(
              "Sui wallet not detected. Please install the extension"
            );
          }
          break;

        case "ethos":
          connectedAccount = await connectToEthosWallet();
          setWalletType("ethos");
          break;

        case "mock":
        default:
          console.log("Using mock wallet");
          connectedAccount = await connectToMockWallet();
          setWalletType("mock");
          break;
      }

      setAccount(connectedAccount);
      setIsConnected(true);

      const walletName =
        selectedWalletType === "sui"
          ? "Sui Wallet"
          : selectedWalletType === "ethos"
          ? "Ethos Wallet"
          : "Demo Wallet";

      toast.success(`Wallet connected: ${walletName}`);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error(
        "Failed to connect wallet: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setWalletType(null);
    toast.success("Wallet disconnected");
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!isConnected || !account) {
      toast.error("Wallet not connected");
      return null;
    }

    try {
      let signature;

      if (walletType === "sui" && isSuiWalletAvailable()) {
        // @ts-ignore - Sui wallet types are not available
        signature = await window.suiWallet.signMessage({
          message: new TextEncoder().encode(message),
          account: account.address,
        });

        return signature.signature;
      } else {
        // Mock signing for development
        console.log(`Signing message with ${walletType} wallet: ${message}`);

        // Mock signing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock transaction ID
        const transactionId =
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("");

        return transactionId;
      }
    } catch (error) {
      console.error("Failed to sign message:", error);
      toast.error(
        "Failed to sign message: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      return null;
    }
  };

  const value = {
    isConnected,
    account,
    connectWallet,
    disconnectWallet,
    signMessage,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
