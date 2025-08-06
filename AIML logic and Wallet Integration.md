## 🤖 AI/ML Integration Details

### Skill Extraction Implementation
```javascript
// AI skill extraction using OpenAI API
const extractSkills = async (text) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Extract professional skills from this text:\n${text}`,
    temperature: 0.5,
    max_tokens: 100
  });
  return parseSkills(response.data.choices[0].text);
};
```

### Job Matching Algorithm
```javascript
// Similarity scoring between job requirements and candidate skills
const calculateMatchScore = (jobSkills, candidateSkills) => {
  const intersection = jobSkills.filter(skill => 
    candidateSkills.includes(skill.toLowerCase())
  );
  return (intersection.length / jobSkills.length) * 100;
};
```

## 💳 Wallet Integration Guide

### MetaMask Setup
```javascript
const connectMetaMask = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      return accounts[0];
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      throw error;
    }
  }
};
```

### Phantom Wallet Setup
```javascript
const connectPhantom = async () => {
  try {
    const { solana } = window;
    if (solana?.isPhantom) {
      const response = await solana.connect();
      return response.publicKey.toString();
    }
  } catch (error) {
    console.error('Phantom connection failed:', error);
    throw error;
  }
};
```

## 👨‍💼 Admin Wallet Configuration

### Testnet Details
```javascript
// Ethereum Testnet (Goerli)
ADMIN_WALLET_ETH = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
NETWORK_ID = 5

// Solana Testnet
ADMIN_WALLET_SOL = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CKCUT"
NETWORK = "devnet"
```

### Test Transaction Flow
```javascript
const sendTestTransaction = async (amount) => {
  try {
    const transaction = {
      to: ADMIN_WALLET_ETH,
      value: ethers.utils.parseEther(amount.toString()),
      gasLimit: 21000,
    };
    
    const tx = await signer.sendTransaction(transaction);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
```

### Payment Verification
```javascript
const verifyPayment = async (txHash) => {
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    return {
      confirmed: receipt.status === 1,
      blockNumber: receipt.blockNumber,
      timestamp: (await provider.getBlock(receipt.blockNumber)).timestamp
    };
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
};
```

## 🔍 Testing Wallets

### Ethereum (Goerli Testnet)
- Network: Goerli Test Network
- RPC URL: https://goerli.infura.io/v3/YOUR-PROJECT-ID
- Chain ID: 5
- Admin Wallet: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
- Test ETH Faucet: https://goerlifaucet.com/

### Solana (Devnet)
- Network: Devnet
- RPC URL: https://api.devnet.solana.com
- Admin Wallet: DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CKCUT
- Test SOL Faucet: https://solfaucet.com/
