// =============================================================================
// RizeOS Job Portal - Ethereum Integration Test
// =============================================================================

const { ethers } = require('ethers');
require('dotenv').config();

console.log('🧪 Testing Ethereum Integration...\n');

async function testEthereumConnection() {
  try {
    console.log('📋 Configuration Check:');
    console.log(`   Network: ${process.env.ETHEREUM_NETWORK}`);
    console.log(`   Chain ID: ${process.env.ETHEREUM_CHAIN_ID}`);
    console.log(`   Address: ${process.env.ETHEREUM_ADDRESS}`);
    console.log(`   MetaMask Enabled: ${process.env.METAMASK_ENABLED}\n`);
    
    // Test with public RPC (Sepolia)
    console.log('🌐 Testing Sepolia Network Connection...');
    const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`✅ Connected to: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    console.log(`📦 Latest Block: ${blockNumber}`);
    
    // Test wallet creation
    console.log('\n🔐 Testing Wallet Functions...');
    const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
    console.log(`✅ Wallet Address: ${wallet.address}`);
    
    // Get balance
    const balance = await provider.getBalance(wallet.address);
    const ethBalance = ethers.formatEther(balance);
    console.log(`💰 Balance: ${ethBalance} ETH`);
    
    // Test your MetaMask address
    console.log('\n🦊 Testing MetaMask Address...');
    const metamaskAddress = '0xeE11B5C629F81B7a02c5cf663345145F36f43cE0'; // Your actual MetaMask
    try {
      const metamaskBalance = await provider.getBalance(metamaskAddress);
      const metamaskEthBalance = ethers.formatEther(metamaskBalance);
      console.log(`💰 MetaMask Balance: ${metamaskEthBalance} ETH`);
    } catch (error) {
      console.log(`💰 MetaMask Address: ${metamaskAddress} (Test mode - balance check skipped)`);
    }
    
    console.log('\n✅ Ethereum Integration Test Passed!');
    console.log('\n🎯 Next Steps:');
    console.log('1. Get Infura API key from https://infura.io/');
    console.log('2. Replace YOUR_INFURA_KEY in .env file');
    console.log('3. Get Sepolia ETH from https://sepoliafaucet.com/');
    console.log('4. Deploy smart contracts');
    console.log('5. Test MetaMask frontend integration');
    
  } catch (error) {
    console.error('❌ Ethereum test failed:', error.message);
    
    if (error.message.includes('missing response')) {
      console.log('\n💡 Tip: You need an Infura API key for production use');
      console.log('   Visit: https://infura.io/ to get your API key');
    }
  }
}

// Test smart contract interaction simulation
async function testSmartContractSimulation() {
  console.log('\n📜 Smart Contract Simulation...');
  
  // Simulate job escrow contract
  const jobData = {
    jobId: 1,
    employer: process.env.ETHEREUM_ADDRESS,
    freelancer: '0xeE11B5C629F81B7a02c5cf663345145F36f43cE0', // Your MetaMask
    amount: ethers.parseEther('0.1'), // 0.1 ETH
    description: 'Frontend Development Task'
  };
  
  console.log('🏗️  Job Escrow Simulation:');
  console.log(`   Job ID: ${jobData.jobId}`);
  console.log(`   Employer: ${jobData.employer}`);
  console.log(`   Freelancer: ${jobData.freelancer}`);
  console.log(`   Amount: ${ethers.formatEther(jobData.amount)} ETH`);
  console.log(`   Description: ${jobData.description}`);
  
  // Simulate skill certificate NFT
  const certificateData = {
    tokenId: 1,
    recipient: jobData.freelancer,
    skillName: 'React.js Development',
    issuer: 'RizeOS Job Portal',
    metadataURI: 'https://api.rizejobs.com/certificates/1'
  };
  
  console.log('\n🏆 Skill Certificate NFT Simulation:');
  console.log(`   Token ID: ${certificateData.tokenId}`);
  console.log(`   Recipient: ${certificateData.recipient}`);
  console.log(`   Skill: ${certificateData.skillName}`);
  console.log(`   Issuer: ${certificateData.issuer}`);
  console.log(`   Metadata URI: ${certificateData.metadataURI}`);
}

// Run tests
async function main() {
  await testEthereumConnection();
  await testSmartContractSimulation();
}

main().catch(console.error);
