const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

async function setupSolanaWallet() {
  console.log('🪙 Setting up Solana Wallet Integration...\n');
  
  try {
    // Generate a new keypair for the admin wallet
    const adminKeypair = Keypair.generate();
    const adminPublicKey = adminKeypair.publicKey.toString();
    const adminSecretKey = Array.from(adminKeypair.secretKey);
    
    console.log('🔑 Generated Admin Wallet:');
    console.log('Public Key:', adminPublicKey);
    console.log('Secret Key (first 8 bytes):', adminSecretKey.slice(0, 8).join(','), '...');
    
    // Connect to Solana devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    console.log('\n🌐 Connected to Solana Devnet');
    
    // Check initial balance
    const initialBalance = await connection.getBalance(adminKeypair.publicKey);
    console.log('💰 Initial Balance:', initialBalance / LAMPORTS_PER_SOL, 'SOL');
    
    if (initialBalance === 0) {
      console.log('\n💸 Requesting airdrop from Solana faucet...');
      try {
        const airdropSignature = await connection.requestAirdrop(
          adminKeypair.publicKey,
          2 * LAMPORTS_PER_SOL // Request 2 SOL
        );
        
        // Wait for confirmation
        await connection.confirmTransaction(airdropSignature);
        
        const newBalance = await connection.getBalance(adminKeypair.publicKey);
        console.log('✅ Airdrop successful!');
        console.log('💰 New Balance:', newBalance / LAMPORTS_PER_SOL, 'SOL');
      } catch (airdropError) {
        console.log('⚠️  Airdrop failed (rate limited or network issue)');
        console.log('You can manually request SOL from: https://faucet.solana.com/');
      }
    }
    
    // Save wallet info to a secure file
    const walletInfo = {
      publicKey: adminPublicKey,
      secretKey: adminSecretKey,
      network: 'devnet',
      rpcUrl: 'https://api.devnet.solana.com',
      createdAt: new Date().toISOString()
    };
    
    // Save to a secure file (you should encrypt this in production)
    fs.writeFileSync(
      path.join(__dirname, 'solana-admin-wallet.json'), 
      JSON.stringify(walletInfo, null, 2)
    );
    
    console.log('\n📁 Wallet saved to: solana-admin-wallet.json');
    console.log('⚠️  IMPORTANT: Keep this file secure and never commit it to version control!');
    
    // Test a sample transaction
    console.log('\n🧪 Testing Solana connection...');
    const slot = await connection.getSlot();
    const blockTime = await connection.getBlockTime(slot);
    
    console.log('✅ Connection test successful:');
    console.log('📊 Current Slot:', slot);
    console.log('⏰ Block Time:', new Date(blockTime * 1000).toLocaleString());
    
    console.log('\n🎉 Solana Wallet Setup Complete!');
    console.log('\n📋 Environment Variables to Update:');
    console.log(`ADMIN_WALLET_ADDRESS=${adminPublicKey}`);
    console.log('SOLANA_NETWORK=devnet');
    console.log('SOLANA_RPC_URL=https://api.devnet.solana.com');
    console.log('JOB_POSTING_FEE_SOL=0.01');
    
    return {
      publicKey: adminPublicKey,
      network: 'devnet',
      rpcUrl: 'https://api.devnet.solana.com'
    };
    
  } catch (error) {
    console.log('❌ Solana setup failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n🔧 Network Issue:');
      console.log('- Check your internet connection');
      console.log('- Solana devnet might be temporarily unavailable');
      console.log('- Try again in a few minutes');
    }
    
    throw error;
  }
}

// Run the setup
setupSolanaWallet()
  .then((result) => {
    console.log('\n✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
