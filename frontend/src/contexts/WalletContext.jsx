import { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletType, setWalletType] = useState(""); // 'metamask' or 'phantom'
  const [isLoading, setIsLoading] = useState(false);

  // Check if wallet is already connected on load
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          setWalletType('metamask');
        }
      } catch (error) {
        console.error('Error checking MetaMask connection:', error);
      }
    }
    
    // Check for Phantom wallet (Solana)
    if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setWalletAddress(response.publicKey.toString());
          setIsConnected(true);
          setWalletType('phantom');
        }
      } catch (error) {
        console.error('Error checking Phantom connection:', error);
      }
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        setWalletType('metamask');
        return true;
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask');
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const connectPhantom = async () => {
    if (typeof window.solana === 'undefined' || !window.solana.isPhantom) {
      alert('Phantom wallet is not installed. Please install Phantom to continue.');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await window.solana.connect();
      if (response.publicKey) {
        setWalletAddress(response.publicKey.toString());
        setIsConnected(true);
        setWalletType('phantom');
        return true;
      }
    } catch (error) {
      console.error('Error connecting to Phantom:', error);
      alert('Failed to connect to Phantom wallet');
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const disconnect = async () => {
    if (walletType === 'phantom' && window.solana) {
      try {
        await window.solana.disconnect();
      } catch (error) {
        console.error('Error disconnecting Phantom:', error);
      }
    }
    
    setIsConnected(false);
    setWalletAddress("");
    setWalletType("");
  };

  const sendTransaction = async (amount, recipient) => {
    // This is a placeholder for transaction functionality
    // In a real implementation, you would handle actual blockchain transactions here
    console.log(`Sending ${amount} to ${recipient} via ${walletType}`);
    
    // Mock transaction for now
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
        });
      }, 2000);
    });
  };

  const value = {
    isConnected,
    walletAddress,
    walletType,
    isLoading,
    connectMetaMask,
    connectPhantom,
    disconnect,
    sendTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
