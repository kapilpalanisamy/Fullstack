import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  DollarSign
} from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

const PaymentComponent = ({ onPaymentSuccess, amount = 0.001, currency = "ETH" }) => {
  const { isConnected, walletAddress, walletType } = useWallet();
  
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  // Admin wallet addresses (replace with your actual admin wallets)
  const ADMIN_WALLETS = {
    ethereum: "0x742d35Cc6634C0532925a3b8D0Cdfa0D16395e3d",
    solana: "7xKVRJrx8vHXBNXLz3yqQH8g1X1zL9vQ4xYKi2n5d8pN"
  };

  const handlePayment = async () => {
    // For testing: Auto-approve payment for Kapil
    const storedUser = localStorage.getItem("jobPortalUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    if (user && user.email === 'kapilalpha73@gmail.com') {
      // Auto-approve for Kapil (testing mode)
      setPaymentLoading(true);
      setTimeout(() => {
        setTxHash("test_tx_hash_" + Date.now());
        setPaymentSuccess(true);
        if (onPaymentSuccess) {
          onPaymentSuccess("test_tx_hash_" + Date.now());
        }
        setPaymentLoading(false);
      }, 1000);
      return;
    }

    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setPaymentLoading(true);
    setError(null);
    
    try {
      let hash;
      
      if (walletType === 'metamask') {
        hash = await sendEthereumPayment();
      } else if (walletType === 'phantom') {
        hash = await sendSolanaPayment();
      }
      
      if (hash) {
        setTxHash(hash);
        setPaymentSuccess(true);
        
        if (onPaymentSuccess) {
          onPaymentSuccess(hash);
        }
      }
    } catch (error) {
      setError(error.message || "Payment failed");
      console.error("Payment failed:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const sendEthereumPayment = async () => {
    try {
      const transactionParameters = {
        to: ADMIN_WALLETS.ethereum,
        from: walletAddress,
        value: (amount * Math.pow(10, 18)).toString(16), // Convert ETH to Wei
      };

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      return txHash;
    } catch (error) {
      throw new Error(error.message || "Ethereum payment failed");
    }
  };

  const sendSolanaPayment = async () => {
    try {
      // This would use Solana Web3.js for actual implementation
      // For now, we'll simulate the payment
      console.log("Sending Solana payment...");
      
      // Simulated transaction hash
      await new Promise(resolve => setTimeout(resolve, 2000));
      return "solana_tx_hash_" + Date.now();
    } catch (error) {
      throw new Error(error.message || "Solana payment failed");
    }
  };

  const getExplorerUrl = (hash) => {
    if (walletType === 'metamask') {
      return `https://etherscan.io/tx/${hash}`;
    } else if (walletType === 'phantom') {
      return `https://explorer.solana.com/tx/${hash}`;
    }
    return "#";
  };

  const formatCurrency = () => {
    if (walletType === 'metamask') return `${amount} ETH`;
    if (walletType === 'phantom') return `${amount * 25} SOL`; // Approximate conversion
    return `${amount} ${currency}`;
  };

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} />
            Payment Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle size={16} />
            <AlertDescription>
              Please connect your wallet to proceed with payment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (paymentSuccess) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle size={16} className="text-green-600" />
            <AlertDescription className="text-green-800">
              Platform fee paid successfully! You can now proceed.
            </AlertDescription>
          </Alert>
          
          {txHash && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Amount Paid:</span>
                <Badge variant="secondary">{formatCurrency()}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transaction:</span>
                <a
                  href={getExplorerUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <span className="text-sm font-mono">
                    {txHash.slice(0, 6)}...{txHash.slice(-4)}
                  </span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Check if current user is Kapil (testing mode)
  const storedUser = localStorage.getItem("jobPortalUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isTestMode = user && user.email === 'kapilalpha73@gmail.com';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign size={20} />
          Platform Fee Payment
          {isTestMode && (
            <Badge variant="secondary" className="ml-2">
              TEST MODE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900">Payment Required</h4>
          <p className="text-sm text-blue-700">
            Pay {formatCurrency()} platform fee to continue
          </p>
          {isTestMode && (
            <p className="text-sm text-green-700 mt-2 font-medium">
              ✅ Test Mode: Payment will be auto-approved for testing
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connected Wallet:</span>
            <Badge variant="outline" className="font-mono">
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Wallet Type:</span>
            <Badge variant="secondary">
              {walletType === 'metamask' ? 'MetaMask' : 'Phantom'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Amount:</span>
            <Badge variant="outline" className="font-bold">
              {formatCurrency()}
            </Badge>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle size={16} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handlePayment}
          disabled={paymentLoading}
          className="w-full"
        >
          {paymentLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <DollarSign size={16} className="mr-2" />
              Pay {formatCurrency()} Platform Fee
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          This payment confirms your job posting and helps maintain the platform
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentComponent;
