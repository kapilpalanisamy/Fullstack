/**
 * Solana Blockchain Service
 * Handles Solana Web3 operations and Phantom wallet integration
 */

const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const config = require('../config/config');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');

class SolanaService {
  constructor() {
    // Temporarily disabled for Ethereum migration
    // This service will be replaced with EthereumService
    console.log('⚠️  SolanaService temporarily disabled - switching to Ethereum');
    this.connection = null;
    this.adminWallet = null;
    this.jobPostingFee = 0;
  }

  /**
   * Verify wallet address format
   */
  isValidWalletAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get wallet balance in SOL
   */
  async getWalletBalance(walletAddress) {
    try {
      if (!this.isValidWalletAddress(walletAddress)) {
        throw new AppError('Invalid wallet address', 400);
      }

      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      const balanceInSOL = balance / LAMPORTS_PER_SOL;

      logger.info('Wallet balance retrieved', {
        wallet: walletAddress,
        balance: balanceInSOL,
        lamports: balance
      });

      return {
        wallet: walletAddress,
        balance: balanceInSOL,
        lamports: balance
      };
    } catch (error) {
      logger.error('Failed to get wallet balance', {
        wallet: walletAddress,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create job posting payment transaction
   */
  async createJobPostingTransaction(fromWallet, jobData) {
    try {
      if (!this.isValidWalletAddress(fromWallet)) {
        throw new AppError('Invalid sender wallet address', 400);
      }

      if (!this.isValidWalletAddress(this.adminWallet)) {
        throw new AppError('Invalid admin wallet address', 500);
      }

      const fromPubkey = new PublicKey(fromWallet);
      const toPubkey = new PublicKey(this.adminWallet);
      const lamports = this.jobPostingFee * LAMPORTS_PER_SOL;

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Serialize transaction for client signing
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });

      logger.info('Job posting transaction created', {
        from: fromWallet,
        to: this.adminWallet,
        amount: this.jobPostingFee,
        lamports,
        jobTitle: jobData.title
      });

      return {
        transaction: serializedTransaction.toString('base64'),
        amount: this.jobPostingFee,
        currency: 'SOL',
        from: fromWallet,
        to: this.adminWallet,
        jobData
      };
    } catch (error) {
      logger.error('Failed to create job posting transaction', {
        fromWallet,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verify transaction signature
   */
  async verifyTransaction(signature) {
    try {
      const confirmed = await this.connection.getSignatureStatus(signature);
      
      if (!confirmed || !confirmed.value) {
        throw new AppError('Transaction not found', 404);
      }

      const transactionDetails = await this.connection.getTransaction(signature, {
        encoding: 'jsonParsed'
      });

      if (!transactionDetails) {
        throw new AppError('Transaction details not found', 404);
      }

      const isConfirmed = confirmed.value.confirmationStatus === 'confirmed' || 
                         confirmed.value.confirmationStatus === 'finalized';

      logger.info('Transaction verified', {
        signature,
        confirmed: isConfirmed,
        slot: transactionDetails.slot,
        blockTime: transactionDetails.blockTime
      });

      return {
        signature,
        confirmed: isConfirmed,
        confirmationStatus: confirmed.value.confirmationStatus,
        slot: transactionDetails.slot,
        blockTime: transactionDetails.blockTime,
        fee: transactionDetails.meta?.fee || 0,
        details: transactionDetails
      };
    } catch (error) {
      logger.error('Failed to verify transaction', {
        signature,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get transaction history for a wallet
   */
  async getWalletTransactions(walletAddress, limit = 10) {
    try {
      if (!this.isValidWalletAddress(walletAddress)) {
        throw new AppError('Invalid wallet address', 400);
      }

      const publicKey = new PublicKey(walletAddress);
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions = [];
      for (const signatureInfo of signatures) {
        try {
          const transaction = await this.connection.getTransaction(
            signatureInfo.signature,
            { encoding: 'jsonParsed' }
          );

          if (transaction) {
            transactions.push({
              signature: signatureInfo.signature,
              slot: transaction.slot,
              blockTime: transaction.blockTime,
              fee: transaction.meta?.fee || 0,
              status: transaction.meta?.err ? 'failed' : 'success',
              confirmationStatus: signatureInfo.confirmationStatus
            });
          }
        } catch (txError) {
          logger.warn('Failed to fetch transaction details', {
            signature: signatureInfo.signature,
            error: txError.message
          });
        }
      }

      logger.info('Wallet transactions retrieved', {
        wallet: walletAddress,
        count: transactions.length
      });

      return {
        wallet: walletAddress,
        transactions,
        count: transactions.length
      };
    } catch (error) {
      logger.error('Failed to get wallet transactions', {
        wallet: walletAddress,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check network status
   */
  async getNetworkStatus() {
    try {
      const health = await this.connection.getHealth();
      const version = await this.connection.getVersion();
      const epochInfo = await this.connection.getEpochInfo();

      return {
        network: config.solana.network,
        rpcUrl: config.solana.rpcUrl,
        health,
        version: version['solana-core'],
        epoch: epochInfo.epoch,
        slot: epochInfo.absoluteSlot,
        blockHeight: epochInfo.blockHeight
      };
    } catch (error) {
      logger.error('Failed to get network status', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Estimate transaction fee
   */
  async estimateTransactionFee(transaction) {
    try {
      const fee = await this.connection.getFeeForMessage(
        transaction.compileMessage()
      );

      return {
        fee: fee.value / LAMPORTS_PER_SOL,
        lamports: fee.value
      };
    } catch (error) {
      logger.error('Failed to estimate transaction fee', {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new SolanaService();
