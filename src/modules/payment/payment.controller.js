const mongoose = require('mongoose');
const BaseController = require('../base/BaseController');
const PaymentService = require('./payment.service');
const { PaymentStatuses } = require('../../utils/enums');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const PaymentModel = require('./payment.model');

class PaymentController extends BaseController {
    constructor() {
        super(PaymentService); 
    }

    async createPayment(req, res) {
      try {
          const { purchaseAllocations, paymentData } = req.body;
          const org = req.user.org;
          const paidBy = req.user.userId;
  
          // Basic input validation
          if (!purchaseAllocations || !Array.isArray(purchaseAllocations) || purchaseAllocations.length === 0) {
              return res.status(400).json({
                  success: false,
                  message: 'purchaseAllocations must be a non-empty array.'
              });
          }
          if (!paymentData || typeof paymentData !== 'object') {
              return res.status(400).json({
                  success: false,
                  message: 'paymentData must be provided.'
              });
          }
  
          // Determine unique paidTos from allocations
          const uniquePaidTos = await PaymentService.getUniquePaidTosFromAllocations(purchaseAllocations);
  
          if (uniquePaidTos.length > 1) {
              return res.status(400).json({
                  success: false,
                  message: 'All purchase allocations must be to the same vendor or user.'
              });
          }
  
          const paidTo = uniquePaidTos[0].id;
          const paidToModel = uniquePaidTos[0].model;
          // Create the payment in `pending` status
          const payment = await PaymentService.createPayment(purchaseAllocations, paymentData, org, paidBy, paidTo, paidToModel);
          return res.status(201).json({ success: true, payment });
      } catch (error) {
          console.error('Error creating payment:', error);
          return res.status(400).json({ success: false, message: error.message });
      }
  }
    async approvePayment(req, res) {
        try {
            const { paymentId } = req.params;

            // Validate paymentId format
            if (!mongoose.Types.ObjectId.isValid(paymentId)) {
                return res.status(400).json({ success: false, message: 'Invalid paymentId.' });
            }
            const approvedBy = req.user.userId;
            const payment = await PaymentService.approvePayment(paymentId, approvedBy);

            return res.status(200).json({ success: true, payment });
        } catch (error) {
            console.error('Error approving payment:', error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    
    async getPaymentsByPurchase(req,res){
        try {
            const {purchaseId}=req.params
            const paymentList=await PaymentService.getpaymentsByPurchase(purchaseId)

            return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,paymentList,"payments Raised for Particular Purchase"))
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))

        }
    }

    async markAsPaid(req,res){
      try {
          const {paymentId}=req.params
          const payment=await PaymentService.markAsPaid(paymentId)

          return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,payment,"Payments marked as Paid"))
      } catch (error) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))
      }
    }

    async getAllPayments(req, res) {
        try {
          const orgId = new mongoose.Types.ObjectId(req.user.org);
      
          const paymentList = await PaymentModel.aggregate([
            // Match payments for the specific organization
            { $match: { org: orgId } },
          
            // Lookup to populate 'paidToUser'
            {
              $lookup: {
                from: 'users',
                localField: 'paidTo',
                foreignField: '_id',
                as: 'paidToUser',
              },
            },
          
            // Lookup to populate 'paidToVendor'
            {
              $lookup: {
                from: 'vendors', // Ensure this matches your actual 'Vendor' collection name
                localField: 'paidTo',
                foreignField: '_id',
                as: 'paidToVendor',
              },
            },
          
            // Determine whether 'paidTo' is a user or a vendor
            {
              $addFields: {
                paidTo: {
                  $cond: [
                    { $gt: [{ $size: '$paidToUser' }, 0] },
                    { $arrayElemAt: ['$paidToUser', 0] },
                    { $arrayElemAt: ['$paidToVendor', 0] },
                  ],
                },
              },
            },
          
            // Remove temporary fields used for determining 'paidTo'
            {
              $unset: ['paidToUser', 'paidToVendor'],
            },
          
            // Lookup to populate 'paidBy'
            {
              $lookup: {
                from: 'users', // Ensure this matches your actual 'User' collection name
                localField: 'paidBy',
                foreignField: '_id',
                as: 'paidByUser',
              },
            },
          
            // Unwind 'paidByUser' to simplify the structure
            {
              $unwind: {
                path: '$paidByUser',
                preserveNullAndEmptyArrays: true,
              },
            },
          
            // Lookup to populate 'approvedBy'
            {
              $lookup: {
                from: 'users', // Ensure this matches your actual 'User' collection name
                localField: 'approvedBy',
                foreignField: '_id',
                as: 'approvedByUser',
              },
            },
          
            // Unwind 'approvedByUser' to simplify the structure
            {
              $unwind: {
                path: '$approvedByUser',
                preserveNullAndEmptyArrays: true,
              },
            },
          
            // Calculate the sum of payment allocations
            {
              $addFields: {
                allocationSum: { $sum: '$paymentAllocation.amount' },
              },
            },
          
            // Final projection to shape the output
            {
              $project: {
                amount: '$allocationSum',
                paidTo: {
                  _id: '$paidTo._id',
                  name: '$paidTo.name',
                },
                paidBy: {
                  _id: '$paidByUser._id',
                  name: '$paidByUser.name',
                },
                approvedBy: {
                  _id: '$approvedByUser._id',
                  name: '$approvedByUser.name',
                },
                method: 1,
                paidToModel: 1,
                status: 1,
                createdAt: 1,
                approvedOn: 1,
                paymentAllocation: 1
              },
            },
          ]);
          
      
          return res.status(StatusCodes.OK).json(
            new ApiResponse(
              StatusCodes.OK,
              paymentList,
              'Payments Fetched Successfully'
            )
          );
        } catch (error) {
          console.error('Error fetching payments:', error);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new ApiError(
              StatusCodes.INTERNAL_SERVER_ERROR,
              'Something Went Wrong',
              error.message
            )
          );
        }
      }
      
}

module.exports = new PaymentController();
