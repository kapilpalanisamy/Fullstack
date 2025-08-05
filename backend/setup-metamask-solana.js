const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function setupSolanaWithMetaMask() {
  console.log('🦊 Setting up Solana Integration with MetaMask...\n');
  
  try {
    console.log('📋 MetaMask Solana Setup Guide:');
    console.log('1. Open MetaMask extension');
    console.log('2. Click network dropdown (usually shows "Ethereum Mainnet")');
    console.log('3. Click "Add Network" or "Custom RPC"');
    console.log('4. Add Solana Devnet with these details:');
    console.log('   - Network Name: Solana Devnet');
    console.log('   - RPC URL: https://api.devnet.solana.com');
    console.log('   - Chain ID: (leave empty for Solana)');
    console.log('   - Currency Symbol: SOL');
    console.log('   - Block Explorer: https://explorer.solana.com/?cluster=devnet');
    console.log('');
    
    // Connect to Solana devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    console.log('🌐 Connected to Solana Devnet');
    
    // Test network connection
    const slot = await connection.getSlot();
    const blockTime = await connection.getBlockTime(slot);
    
    console.log('✅ Network connection successful:');
    console.log('📊 Current Slot:', slot);
    console.log('⏰ Block Time:', new Date(blockTime * 1000).toLocaleString());
    
    console.log('\n🔑 Admin Wallet Setup:');
    console.log('You have two options:');
    console.log('');
    console.log('Option 1 - Use your existing MetaMask Solana wallet:');
    console.log('1. Switch to Solana network in MetaMask');
    console.log('2. Copy your Solana wallet address');
    console.log('3. Get some devnet SOL from: https://faucet.solana.com/');
    console.log('');
    console.log('Option 2 - Create a dedicated admin wallet:');
    console.log('1. Create a new account in MetaMask');
    console.log('2. Switch to Solana network');
    console.log('3. Use that address as your admin wallet');
    
    console.log('\n💡 For testing, I can generate a sample admin address:');
    
    // Generate a sample keypair for demonstration
    const { Keypair } = require('@solana/web3.js');
    const sampleKeypair = Keypair.generate();
    const sampleAddress = sampleKeypair.publicKey.toString();
    
    console.log('🎲 Sample Admin Address:', sampleAddress);
    
    // Test if the sample address is valid
    try {
      const balance = await connection.getBalance(sampleKeypair.publicKey);
      console.log('💰 Sample Address Balance:', balance / LAMPORTS_PER_SOL, 'SOL');
    } catch (error) {
      console.log('💰 Sample Address Balance: 0 SOL (new address)');
    }
    
    console.log('\n🔧 Environment Variables to Set:');
    console.log('Copy one of these configurations to your .env file:');
    console.log('');
    console.log('# Using sample generated address:');
    console.log(`ADMIN_WALLET_ADDRESS=${sampleAddress}`);
    console.log('SOLANA_NETWORK=devnet');
    console.log('SOLANA_RPC_URL=https://api.devnet.solana.com');
    console.log('JOB_POSTING_FEE_SOL=0.01');
    console.log('');
    console.log('# Or replace with your MetaMask Solana address:');
    console.log('ADMIN_WALLET_ADDRESS=your_metamask_solana_address_here');
    console.log('SOLANA_NETWORK=devnet');
    console.log('SOLANA_RPC_URL=https://api.devnet.solana.com');
    console.log('JOB_POSTING_FEE_SOL=0.01');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Choose an admin wallet address (your MetaMask or generated)');
    console.log('2. Update your .env file with the wallet address');
    console.log('3. Get some devnet SOL from the faucet');
    console.log('4. Test the Solana integration');
    
    return {
      sampleAddress,
      network: 'devnet',
      rpcUrl: 'https://api.devnet.solana.com',
      connected: true
    };
    
  } catch (error) {
    console.log('❌ Solana setup failed:', error.message);
    throw error;
  }
}

// Run the setup
setupSolanaWithMetaMask()
  .then((result) => {
    console.log('\n✅ Solana setup guide completed');
    console.log('🦊 Ready to integrate with MetaMask!');
  })
  .catch((error) => {
    console.log('\n❌ Setup failed:', error.message);
  });
