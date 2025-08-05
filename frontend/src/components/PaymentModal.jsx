import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useWallet } from "../contexts/WalletContext";
import { Wallet, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

const PaymentModal = ({ isOpen, onClose, onSuccess, amount, currency, purpose = "Job Posting Fee" }) => {
  const { isConnected, walletAddress, walletType, connectMetaMask, connectPhantom, sendTransaction } = useWallet();
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, connecting, processing, success, error
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus("idle");
      setTransactionHash("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWalletConnect = async (type) => {
    setPaymentStatus("connecting");
    setError("");
    
    try {
      let success = false;
      if (type === 'metamask') {
        success = await connectMetaMask();
      } else if (type === 'phantom') {
        success = await connectPhantom();
      }
      
      if (success) {
        setPaymentStatus("idle");
      } else {
        setPaymentStatus("idle");
        setError("Failed to connect wallet");
      }
    } catch (err) {
      setPaymentStatus("idle");
      setError("Failed to connect wallet");
    }
  };

  const handlePayment = async () => {
    // For testing: Auto-approve payment for Kapil
    const storedUser = localStorage.getItem("jobPortalUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    if (user && user.email === 'kapilalpha73@gmail.com') {
      // Auto-approve for Kapil (testing mode)
      setPaymentStatus("processing");
      setTimeout(() => {
        setTransactionHash("test_tx_hash_" + Date.now());
        setPaymentStatus("success");
        setTimeout(() => {
          onSuccess("test_tx_hash_" + Date.now());
        }, 2000);
      }, 1000);
      return;
    }

    if (!isConnected) return;
    
    setPaymentStatus("processing");
    setError("");
    
    try {
      // Admin wallet addresses (replace with actual addresses)
      const adminWallets = {
        metamask: "0x742d35Cc6635C0532925a3b8D0B7C2E2f84fD8", // Replace with actual ETH/Polygon address
        phantom: "HmQ6p8JXzB4Cy4EfPyfEEJzn4fX8w6bGr5wKY3nD4nZ7" // Replace with actual Solana address
      };
      
      const recipientAddress = adminWallets[walletType];
      
      const result = await sendTransaction(amount, recipientAddress);
      
      if (result.success) {
        setTransactionHash(result.transactionHash);
        setPaymentStatus("success");
        
        // Simulate blockchain confirmation delay
        setTimeout(() => {
          onSuccess(result.transactionHash);
        }, 2000);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      setPaymentStatus("error");
      setError(err.message || "Payment failed");
    }
  };

  const getStatusContent = () => {
    switch (paymentStatus) {
      case "connecting":
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connecting Wallet</h3>
            <p className="text-gray-600">Please approve the connection in your wallet</p>
          </div>
        );

      case "processing":
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please confirm the transaction in your wallet</p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Amount:</strong> {amount} {currency.toUpperCase()}<br/>
                <strong>Purpose:</strong> {purpose}<br/>
                <strong>Wallet:</strong> {walletType === 'metamask' ? 'MetaMask' : 'Phantom'}
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">Your transaction has been confirmed</p>
            {transactionHash && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Transaction Hash:</p>
                <p className="text-xs font-mono break-all">{transactionHash}</p>
              </div>
            )}
          </div>
        );

      case "error":
        return (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => setPaymentStatus("idle")} variant="outline">
              Try Again
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Payment Details */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-3">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Purpose:</span>
                  <span>{purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">{amount} {currency.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span>{currency === 'sol' ? 'Solana' : 'Ethereum/Polygon'}</span>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            {!isConnected ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-center">Connect Your Wallet</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col gap-2"
                    onClick={() => handleWalletConnect('metamask')}
                    disabled={paymentStatus === "connecting"}
                  >
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <span>MetaMask</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col gap-2"
                    onClick={() => handleWalletConnect('phantom')}
                    disabled={paymentStatus === "connecting"}
                  >
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">P</span>
                    </div>
                    <span>Phantom</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Connected Wallet Info */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">Wallet Connected</span>
                  </div>
                  <p className="text-sm font-mono break-all">{walletAddress}</p>
                  <p className="text-sm text-gray-600">
                    {walletType === 'metamask' ? 'MetaMask' : 'Phantom'} Wallet
                  </p>
                </div>

                {/* Payment Warning */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Important:</p>
                      <p>Make sure you have sufficient balance to cover the transaction fee plus network gas fees.</p>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <Button 
                  onClick={handlePayment} 
                  className="w-full"
                  disabled={paymentStatus === "processing"}
                >
                  {paymentStatus === "processing" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay {amount} {currency.toUpperCase()}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet size={20} />
              {purpose}
            </CardTitle>
            <CardDescription>
              Complete your payment to proceed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getStatusContent()}
            
            {paymentStatus !== "success" && (
              <div className="mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="w-full"
                  disabled={paymentStatus === "processing" || paymentStatus === "connecting"}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentModal;
