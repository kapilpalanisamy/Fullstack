/**
 * Payment Service
 * Business logic for handling blockchain payments
 */

const solanaService = require('./solanaService');
const { PaymentTransaction, Job, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class PaymentService {
  /**
   * Create payment for job posting
   */
  async createJobPostingPayment(userId, jobData, walletAddress) {
    try {
      // Validate wallet address
      if (!solanaService.isValidWalletAddress(walletAddress)) {
        throw new AppError('Invalid wallet address', 400);
      }

      // Check wallet balance
      const balance = await solanaService.getWalletBalance(walletAddress);
      if (balance.balance < solanaService.jobPostingFee) {
        throw new AppError(`Insufficient balance. Required: ${solanaService.jobPostingFee} SOL, Available: ${balance.balance} SOL`, 400);
      }

      // Create transaction
      const transactionData = await solanaService.createJobPostingTransaction(
        walletAddress,
        jobData
      );

      // Create payment record
      const payment = await PaymentTransaction.create({
        user_id: userId,
        from_wallet: walletAddress,
        to_wallet: transactionData.to,
        amount: transactionData.amount,
        currency: 'SOL',
        transaction_type: 'job_posting',
        status: 'pending',
        metadata: {
          jobData,
          transactionCreated: new Date()
        }
      });

      logger.info('Job posting payment created', {
        paymentId: payment.id,
        userId,
        amount: transactionData.amount,
        wallet: walletAddress
      });

      return {
        paymentId: payment.id,
        transaction: transactionData.transaction,
        amount: transactionData.amount,
        currency: 'SOL',
        walletRequired: walletAddress,
        adminWallet: transactionData.to
      };
    } catch (error) {
      logger.error('Failed to create job posting payment', {
        userId,
        wallet: walletAddress,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Confirm payment after transaction is signed
   */
  async confirmPayment(paymentId, transactionSignature) {
    try {
      const payment = await PaymentTransaction.findByPk(paymentId);
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (payment.status !== 'pending') {
        throw new AppError('Payment is not in pending status', 400);
      }

      // Verify transaction on blockchain
      const verification = await solanaService.verifyTransaction(transactionSignature);
      
      if (!verification.confirmed) {
        throw new AppError('Transaction not confirmed on blockchain', 400);
      }

      // Update payment record
      await payment.update({
        transaction_hash: transactionSignature,
        status: 'confirmed',
        block_number: verification.slot,
        confirmation_count: 1,
        gas_fee: verification.fee / 1000000000, // Convert lamports to SOL
        metadata: {
          ...payment.metadata,
          confirmed: true,
          confirmationDetails: verification,
          confirmedAt: new Date()
        }
      });

      // If this is a job posting payment, create the job
      if (payment.transaction_type === 'job_posting' && payment.metadata.jobData) {
        const job = await Job.create({
          ...payment.metadata.jobData,
          created_by: payment.user_id,
          is_active: true,
          payment_transaction_id: payment.id
        });

        await payment.update({
          job_id: job.id,
          metadata: {
            ...payment.metadata,
            jobCreated: true,
            jobId: job.id
          }
        });

        logger.info('Job created after payment confirmation', {
          paymentId: payment.id,
          jobId: job.id,
          transactionHash: transactionSignature
        });
      }

      logger.info('Payment confirmed successfully', {
        paymentId: payment.id,
        transactionHash: transactionSignature,
        amount: payment.amount
      });

      return {
        paymentId: payment.id,
        status: 'confirmed',
        transactionHash: transactionSignature,
        amount: payment.amount,
        currency: payment.currency,
        jobCreated: payment.transaction_type === 'job_posting'
      };
    } catch (error) {
      logger.error('Failed to confirm payment', {
        paymentId,
        signature: transactionSignature,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await PaymentTransaction.findByPk(paymentId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'company_id']
          }
        ]
      });

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      // If payment is confirmed, check latest blockchain status
      if (payment.transaction_hash && payment.status === 'confirmed') {
        try {
          const verification = await solanaService.verifyTransaction(payment.transaction_hash);
          
          // Update confirmation count if needed
          if (verification.confirmed && verification.confirmationStatus === 'finalized') {
            await payment.update({ confirmation_count: 32 }); // Finalized = 32 confirmations
          }
        } catch (verifyError) {
          logger.warn('Could not verify payment transaction', {
            paymentId,
            hash: payment.transaction_hash,
            error: verifyError.message
          });
        }
      }

      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        transactionType: payment.transaction_type,
        transactionHash: payment.transaction_hash,
        confirmationCount: payment.confirmation_count,
        fromWallet: payment.from_wallet,
        toWallet: payment.to_wallet,
        user: payment.user,
        job: payment.job,
        createdAt: payment.created_at,
        metadata: payment.metadata
      };
    } catch (error) {
      logger.error('Failed to get payment status', {
        paymentId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get user payment history
   */
  async getUserPayments(userId, options = {}) {
    try {
      const { page = 1, limit = 20, status, type } = options;
      const offset = (page - 1) * limit;

      const whereConditions = { user_id: userId };
      
      if (status) {
        whereConditions.status = status;
      }
      
      if (type) {
        whereConditions.transaction_type = type;
      }

      const { count, rows: payments } = await PaymentTransaction.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'company_id']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      const totalPages = Math.ceil(count / limit);

      return {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPayments: count,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to get user payments', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Refund payment (admin only)
   */
  async refundPayment(paymentId, adminUserId, reason) {
    try {
      const payment = await PaymentTransaction.findByPk(paymentId);
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (payment.status !== 'confirmed') {
        throw new AppError('Only confirmed payments can be refunded', 400);
      }

      // Create refund record
      const refund = await PaymentTransaction.create({
        user_id: payment.user_id,
        from_wallet: payment.to_wallet,
        to_wallet: payment.from_wallet,
        amount: payment.amount,
        currency: payment.currency,
        transaction_type: 'refund',
        status: 'pending',
        metadata: {
          originalPaymentId: paymentId,
          refundReason: reason,
          refundedBy: adminUserId,
          refundedAt: new Date()
        }
      });

      // Mark original payment as refunded
      await payment.update({
        status: 'refunded',
        metadata: {
          ...payment.metadata,
          refunded: true,
          refundId: refund.id,
          refundReason: reason
        }
      });

      logger.info('Payment refund initiated', {
        originalPaymentId: paymentId,
        refundId: refund.id,
        amount: payment.amount,
        adminUserId
      });

      return {
        refundId: refund.id,
        originalPaymentId: paymentId,
        amount: payment.amount,
        status: 'pending',
        reason
      };
    } catch (error) {
      logger.error('Failed to refund payment', {
        paymentId,
        adminUserId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new PaymentService();
