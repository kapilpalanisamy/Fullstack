import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useWallet } from "../contexts/WalletContext";
import { Wallet, ExternalLink } from "lucide-react";

const WalletConnection = ({ onConnect, showDisconnect = true }) => {
  const { 
    isConnected, 
    walletAddress, 
    walletType, 
    isLoading, 
    connectMetaMask, 
    connectPhantom, 
    disconnect 
  } = useWallet();

  const [selectedWallet, setSelectedWallet] = useState("");

  const handleConnect = async (type) => {
    let success = false;
    
    if (type === 'metamask') {
      success = await connectMetaMask();
    } else if (type === 'phantom') {
      success = await connectPhantom();
    }
    
    if (success && onConnect) {
      onConnect(walletAddress, type);
    }
  };

  if (isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            {walletType === 'metamask' ? 'MetaMask' : 'Phantom'} wallet is connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="text-sm font-medium">Address:</p>
              <p className="text-xs font-mono break-all">
                {walletAddress}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(walletAddress)}
              >
                Copy Address
              </Button>
              
              {showDisconnect && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={disconnect}
                >
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet size={20} />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>
          Choose a wallet to connect for blockchain payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => handleConnect('metamask')}
              disabled={isLoading}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span>MetaMask</span>
              <span className="text-xs text-gray-500">Ethereum & EVM chains</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => handleConnect('phantom')}
              disabled={isLoading}
            >
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span>Phantom</span>
              <span className="text-xs text-gray-500">Solana</span>
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Don't have a wallet?
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                Get MetaMask <ExternalLink size={12} />
              </a>
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-sm flex items-center gap-1"
              >
                Get Phantom <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnection;
