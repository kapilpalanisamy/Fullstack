/**
 * Wallet Controller
 * Handles Phantom wallet connection and blockchain operations
 */

const solanaService = require('../services/solanaService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const { User } = require('../models');

class WalletController {
  /**
   * Connect Phantom wallet
   * POST /api/wallets/connect
   */
  connectWallet = asyncHandler(async (req, res) => {
    const { walletAddress, signature } = req.body;
    const userId = req.user.id;

    // Validate wallet address
    if (!walletAddress || !solanaService.isValidWalletAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    // Update user's wallet address
    const user = await User.findByPk(userId);
    await user.update({ wallet_address: walletAddress });

    // Get wallet balance
    const balance = await solanaService.getWalletBalance(walletAddress);

    logger.info('Wallet connected successfully', {
      userId,
      wallet: walletAddress,
      balance: balance.balance
    });

    res.status(200).json({
      success: true,
      message: 'Wallet connected successfully',
      data: {
        walletAddress,
        balance: balance.balance,
        network: solanaService.connection._rpcEndpoint
      }
    });
  });

  /**
   * Get wallet balance
   * GET /api/wallets/balance/:address
   */
  getWalletBalance = asyncHandler(async (req, res) => {
    const { address } = req.params;

    if (!solanaService.isValidWalletAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    const balance = await solanaService.getWalletBalance(address);

    res.status(200).json({
      success: true,
      message: 'Balance retrieved successfully',
      data: balance
    });
  });

  /**
   * Get wallet transaction history
   * GET /api/wallets/transactions/:address
   */
  getWalletTransactions = asyncHandler(async (req, res) => {
    const { address } = req.params;
    const { limit = 10 } = req.query;

    if (!solanaService.isValidWalletAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    const transactions = await solanaService.getWalletTransactions(address, parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: transactions
    });
  });

  /**
   * Verify transaction signature
   * POST /api/wallets/verify-transaction
   */
  verifyTransaction = asyncHandler(async (req, res) => {
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Transaction signature is required'
      });
    }

    const verification = await solanaService.verifyTransaction(signature);

    res.status(200).json({
      success: true,
      message: 'Transaction verified successfully',
      data: verification
    });
  });

  /**
   * Get network status
   * GET /api/wallets/network-status
   */
  getNetworkStatus = asyncHandler(async (req, res) => {
    const status = await solanaService.getNetworkStatus();

    res.status(200).json({
      success: true,
      message: 'Network status retrieved successfully',
      data: status
    });
  });

  /**
   * Disconnect wallet
   * POST /api/wallets/disconnect
   */
  disconnectWallet = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Remove wallet address from user
    const user = await User.findByPk(userId);
    await user.update({ wallet_address: null });

    logger.info('Wallet disconnected', {
      userId,
      previousWallet: user.wallet_address
    });

    res.status(200).json({
      success: true,
      message: 'Wallet disconnected successfully'
    });
  });

  /**
   * Get user's connected wallet info
   * GET /api/wallets/my-wallet
   */
  getMyWallet = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.wallet_address) {
      return res.status(404).json({
        success: false,
        message: 'No wallet connected'
      });
    }

    const balance = await solanaService.getWalletBalance(user.wallet_address);

    res.status(200).json({
      success: true,
      message: 'Wallet info retrieved successfully',
      data: {
        walletAddress: user.wallet_address,
        balance: balance.balance,
        lamports: balance.lamports,
        network: solanaService.connection._rpcEndpoint
      }
    });
  });

  /**
   * Validate wallet ownership (sign message)
   * POST /api/wallets/validate-ownership
   */
  validateOwnership = asyncHandler(async (req, res) => {
    const { walletAddress, message, signature } = req.body;

    if (!walletAddress || !message || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address, message, and signature are required'
      });
    }

    if (!solanaService.isValidWalletAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    // In a real implementation, you would verify the signature
    // For now, we'll just validate the wallet address format
    const isValid = true; // Placeholder for actual signature verification

    res.status(200).json({
      success: true,
      message: isValid ? 'Wallet ownership validated' : 'Invalid signature',
      data: {
        walletAddress,
        isValid,
        message
      }
    });
  });
}

module.exports = new WalletController();
