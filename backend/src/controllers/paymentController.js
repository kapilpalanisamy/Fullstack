/**
 * Payment Controller
 * Handles payment operations and blockchain transactions
 */

const paymentService = require('../services/paymentService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class PaymentController {
  /**
   * Create job posting payment
   * POST /api/payments/job-posting
   */
  createJobPostingPayment = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { jobData, walletAddress } = req.body;

    // Validate required fields
    if (!jobData || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Job data and wallet address are required'
      });
    }

    // Validate job data
    const requiredJobFields = ['title', 'description', 'company_id', 'location', 'job_type'];
    const missingFields = requiredJobFields.filter(field => !jobData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required job fields: ${missingFields.join(', ')}`
      });
    }

    const payment = await paymentService.createJobPostingPayment(
      userId,
      jobData,
      walletAddress
    );

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  });

  /**
   * Confirm payment after transaction signing
   * POST /api/payments/:id/confirm
   */
  confirmPayment = asyncHandler(async (req, res) => {
    const { id: paymentId } = req.params;
    const { transactionSignature } = req.body;

    if (!transactionSignature) {
      return res.status(400).json({
        success: false,
        message: 'Transaction signature is required'
      });
    }

    const confirmation = await paymentService.confirmPayment(
      paymentId,
      transactionSignature
    );

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: confirmation
    });
  });

  /**
   * Get payment status
   * GET /api/payments/:id
   */
  getPaymentStatus = asyncHandler(async (req, res) => {
    const { id: paymentId } = req.params;

    const payment = await paymentService.getPaymentStatus(paymentId);

    res.status(200).json({
      success: true,
      message: 'Payment status retrieved successfully',
      data: payment
    });
  });

  /**
   * Get user payment history
   * GET /api/payments/my-payments
   */
  getMyPayments = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page, limit, status, type } = req.query;

    const payments = await paymentService.getUserPayments(userId, {
      page,
      limit,
      status,
      type
    });

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: payments
    });
  });

  /**
   * Refund payment (admin only)
   * POST /api/payments/:id/refund
   */
  refundPayment = asyncHandler(async (req, res) => {
    const { id: paymentId } = req.params;
    const { reason } = req.body;
    const adminUserId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason is required'
      });
    }

    const refund = await paymentService.refundPayment(
      paymentId,
      adminUserId,
      reason
    );

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      data: refund
    });
  });

  /**
   * Get payment statistics (admin only)
   * GET /api/payments/stats
   */
  getPaymentStats = asyncHandler(async (req, res) => {
    // This would typically include aggregate queries
    // For now, returning placeholder data
    const stats = {
      totalPayments: 0,
      totalRevenue: 0,
      pendingPayments: 0,
      confirmedPayments: 0,
      refundedPayments: 0,
      jobPostingPayments: 0
    };

    res.status(200).json({
      success: true,
      message: 'Payment statistics retrieved successfully',
      data: { stats }
    });
  });

  /**
   * Get transaction fee estimate
   * POST /api/payments/estimate-fee
   */
  estimateFee = asyncHandler(async (req, res) => {
    const { amount = 0.01 } = req.body; // Default job posting fee

    // For Solana, transaction fees are very low and consistent
    const estimate = {
      transactionFee: 0.000005, // ~5000 lamports
      jobPostingFee: amount,
      totalCost: amount + 0.000005,
      currency: 'SOL'
    };

    res.status(200).json({
      success: true,
      message: 'Fee estimated successfully',
      data: estimate
    });
  });

  /**
   * Webhook for payment confirmations (external services)
   * POST /api/payments/webhook
   */
  paymentWebhook = asyncHandler(async (req, res) => {
    const { signature, paymentId, status } = req.body;

    // Verify webhook authenticity here
    // For now, just log the webhook
    logger.info('Payment webhook received', {
      signature,
      paymentId,
      status,
      body: req.body
    });

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  });
}

module.exports = new PaymentController();
