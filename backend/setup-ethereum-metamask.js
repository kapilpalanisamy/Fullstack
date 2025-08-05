// =============================================================================
// RizeOS Job Portal - Ethereum + MetaMask Integration Setup
// =============================================================================

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Ethereum + MetaMask Integration for RizeOS Job Portal...\n');

// =============================================================================
// ETHEREUM NETWORK CONFIGURATIONS
// =============================================================================

const networks = {
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: '0xaa36a7', // 11155111 in hex
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'SEP',
      decimals: 18
    }
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: '0x1',
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://etherscan.io'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  polygon: {
    name: 'Polygon Mainnet',
    chainId: '0x89', // 137 in hex
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  }
};

// =============================================================================
// JOB PORTAL SMART CONTRACT TEMPLATES
// =============================================================================

const smartContracts = {
  jobEscrow: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract JobEscrow {
    struct Job {
        address employer;
        address freelancer;
        uint256 amount;
        bool completed;
        bool disputed;
    }
    
    mapping(uint256 => Job) public jobs;
    uint256 public jobCounter;
    
    event JobCreated(uint256 jobId, address employer, uint256 amount);
    event JobCompleted(uint256 jobId, address freelancer);
    
    function createJob() external payable {
        jobs[jobCounter] = Job({
            employer: msg.sender,
            freelancer: address(0),
            amount: msg.value,
            completed: false,
            disputed: false
        });
        
        emit JobCreated(jobCounter, msg.sender, msg.value);
        jobCounter++;
    }
    
    function completeJob(uint256 _jobId, address _freelancer) external {
        require(jobs[_jobId].employer == msg.sender, "Only employer can complete");
        require(!jobs[_jobId].completed, "Job already completed");
        
        jobs[_jobId].freelancer = _freelancer;
        jobs[_jobId].completed = true;
        
        payable(_freelancer).transfer(jobs[_jobId].amount);
        emit JobCompleted(_jobId, _freelancer);
    }
}`,
  
  skillCertificate: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SkillCertificate is ERC721 {
    struct Certificate {
        string skillName;
        address issuer;
        uint256 timestamp;
        string metadataURI;
    }
    
    mapping(uint256 => Certificate) public certificates;
    uint256 public tokenCounter;
    
    constructor() ERC721("RizeOS Skill Certificate", "RSC") {}
    
    function issueCertificate(
        address _recipient,
        string memory _skillName,
        string memory _metadataURI
    ) external returns (uint256) {
        certificates[tokenCounter] = Certificate({
            skillName: _skillName,
            issuer: msg.sender,
            timestamp: block.timestamp,
            metadataURI: _metadataURI
        });
        
        _mint(_recipient, tokenCounter);
        tokenCounter++;
        
        return tokenCounter - 1;
    }
}`
};

// =============================================================================
// GENERATE ETHEREUM WALLET
// =============================================================================

function generateEthereumWallet() {
  console.log('🔐 Generating Ethereum Wallet...\n');
  
  const wallet = ethers.Wallet.createRandom();
  
  console.log('✅ Ethereum Wallet Generated:');
  console.log(`   Address: ${wallet.address}`);
  console.log(`   Private Key: ${wallet.privateKey}`);
  console.log(`   Mnemonic: ${wallet.mnemonic.phrase}\n`);
  
  console.log('⚠️  SECURITY WARNING:');
  console.log('   - Store private key securely');
  console.log('   - Never commit private keys to version control');
  console.log('   - Use environment variables for production\n');
  
  return wallet;
}

// =============================================================================
// METAMASK INTEGRATION GUIDE
// =============================================================================

function displayMetaMaskGuide(wallet) {
  console.log('🦊 MetaMask Integration Guide:\n');
  
  console.log('1️⃣  Add Sepolia Testnet to MetaMask:');
  console.log('   - Open MetaMask extension');
  console.log('   - Click network dropdown (currently shows "Sepolia ETH")');
  console.log('   - You already have Sepolia! ✅\n');
  
  console.log('2️⃣  Get Test ETH:');
  console.log('   - Visit: https://sepoliafaucet.com/');
  console.log('   - Enter your address: 0xeE1B...43cE0');
  console.log('   - Request test ETH\n');
  
  console.log('3️⃣  Frontend Integration Code:');
  console.log(`
// Connect to MetaMask
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      console.log('Connected:', address);
      return { provider, signer, address };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  } else {
    alert('Please install MetaMask!');
  }
}

// Switch to Sepolia Network
async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia
    });
  } catch (switchError) {
    // Network not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        }]
      });
    }
  }
}
  `);
  
  console.log('4️⃣  Backend Integration:');
  console.log(`   - Install: npm install ethers web3`);
  console.log(`   - RPC Endpoint: https://sepolia.infura.io/v3/YOUR_INFURA_KEY`);
  console.log(`   - Contract Address: ${wallet.address}\n`);
}

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

function generateEnvConfig(wallet) {
  const envConfig = `
# =============================================================================
# ETHEREUM BLOCKCHAIN CONFIGURATION
# =============================================================================
BLOCKCHAIN_NETWORK=ethereum
ETHEREUM_NETWORK=sepolia
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHEREUM_CHAIN_ID=11155111
ETHEREUM_PRIVATE_KEY=${wallet.privateKey}
ETHEREUM_ADDRESS=${wallet.address}

# MetaMask Integration
METAMASK_ENABLED=true
SUPPORTED_NETWORKS=sepolia,mainnet,polygon

# Smart Contracts
JOB_ESCROW_CONTRACT=0x...
SKILL_CERTIFICATE_CONTRACT=0x...

# Infura Configuration (Get from https://infura.io/)
INFURA_PROJECT_ID=your_infura_project_id
INFURA_PROJECT_SECRET=your_infura_project_secret

# Gas Configuration
GAS_LIMIT=3000000
GAS_PRICE=20000000000

# Job Portal Features
ENABLE_CRYPTO_PAYMENTS=true
ENABLE_SKILL_NFTS=true
ENABLE_ESCROW_SERVICES=true
`;

  console.log('📝 Environment Configuration:');
  console.log(envConfig);
  
  return envConfig;
}

// =============================================================================
// MAIN SETUP EXECUTION
// =============================================================================

async function main() {
  try {
    console.log('🌟 RizeOS Job Portal - Ethereum Integration Setup\n');
    console.log('================================\n');
    
    // Generate wallet
    const wallet = generateEthereumWallet();
    
    // Display MetaMask guide
    displayMetaMaskGuide(wallet);
    
    // Generate environment config
    const envConfig = generateEnvConfig(wallet);
    
    console.log('✅ Setup Complete!\n');
    console.log('Next Steps:');
    console.log('1. Get Infura API key from https://infura.io/');
    console.log('2. Add environment variables to .env file');
    console.log('3. Install required packages: npm install ethers web3');
    console.log('4. Test MetaMask connection');
    console.log('5. Deploy smart contracts to Sepolia testnet\n');
    
    console.log('🎯 Your Ethereum address:', wallet.address);
    console.log('🦊 Your MetaMask address: 0xeE1B...43cE0\n');
    
    console.log('💡 Recommendation: Use your existing MetaMask address for testing!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run setup
main();
