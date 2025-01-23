const mongoose = require('mongoose');
const BaseService = require('../base/BaseService');
const PurchaseModel = require('../purchase/purchase.model');
const PaymentModel = require('./payment.model');
const { PaymentStatuses } = require('../../utils/enums');

class PaymentService extends BaseService {
    constructor() {
        super(PaymentModel);
    }

    /**
     * Example custom: findPaymentsByOrg
     * (Adjust as you need; not the main focus.)
     */
    async findPaymentsByOrg(orgId) {
        return await this.model.find({ org: orgId })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('inventoryRequest.material', 'name category')
            .populate('vendor', 'name address');
    }

    async createPayment(purchaseAllocations, paymentData) {
        const totalAllocated = purchaseAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
        if (totalAllocated !== paymentData.amount) {
            throw new Error('Total allocated amount does not match the payment amount.');
        }

        for (const alloc of purchaseAllocations) {
            if (!mongoose.Types.ObjectId.isValid(alloc.purchaseId)) {
                throw new Error(`Invalid purchaseId in allocation: ${alloc.purchaseId}`);
            }
            const purchase = await PurchaseModel.findById(alloc.purchaseId);
            if (!purchase) {
                throw new Error(`Purchase with ID ${alloc.purchaseId} not found.`);
            }

            const sumOfAllocated = purchase.payments.reduce((sum, p) => sum + p.amount, 0);
            const leftover = purchase.amount - sumOfAllocated;

            if (alloc.amount > leftover) {
                throw new Error(`Allocation ₹${alloc.amount} exceeds leftover ₹${leftover} for Purchase ${alloc.purchaseId}.`);
            }
        }

        const payment = new PaymentModel({
            ...paymentData,
            status: PaymentStatuses.PENDING, 
            paymentAllocation: purchaseAllocations
        });

        await payment.save();

        return payment;
    }

    async approvePayment(paymentId) {
        const payment = await PaymentModel.findById(paymentId);
        if (!payment) {
            throw new Error(`Payment with ID ${paymentId} not found.`);
        }

        if (payment.status !== PaymentStatuses.PENDING) {
            throw new Error(`Only 'pending' payments can be approved. Current status: ${payment.status}`);
        }

        for (const alloc of payment.paymentAllocation) {
            if (!mongoose.Types.ObjectId.isValid(alloc.purchaseId)) {
                throw new Error(`Invalid purchaseId in allocation: ${alloc.purchaseId}`);
            }
            const purchase = await PurchaseModel.findById(alloc.purchaseId);
            if (!purchase) {
                throw new Error(`Purchase with ID ${alloc.purchaseId} not found.`);
            }

            const sumOfAllocated = purchase.payments.reduce((sum, p) => sum + p.amount, 0);
            const leftover = purchase.amount - sumOfAllocated;

            if (alloc.amount > leftover) {
                throw new Error(
                    `Allocation ₹${alloc.amount} exceeds leftover ₹${leftover} for Purchase ${alloc.purchaseId}.`
                );
            }
        }

        payment.status = PaymentStatuses.APPROVED; // "approved"
        await payment.save();

        for (const alloc of payment.paymentAllocation) {
            await PurchaseModel.findByIdAndUpdate(
                alloc.purchaseId,
                {
                    $push: {
                        payments: {
                            paymentId: payment._id,
                            amount: alloc.amount
                        }
                    }
                },
                { new: true } // returns updated doc (not mandatory, but can be helpful)
            );
        }

        return payment;
    }

    async getRemainingAmount(paymentList,purchaseData){  
        let totalPaidAmount=0
        paymentList.forEach((payment)=>{
          totalPaidAmount+=payment.amount
        })
         const remainingAmount=purchaseData.amount-totalPaidAmount
         return {remainingAmount:remainingAmount}
      }
    
      async getPurchasesWithBalanceAmount(vendorId) {
        const purchases = await PurchaseModel.find({ vendor: vendorId })  
        .lean()
    
      if(purchases.length===0){
        return []
      }
        const purchasesWithBalance = purchases.map((purchaseData) => {
          let totalPayments=0
          purchaseData.payments.forEach((payment)=>{
            totalPayments+=payment.amount ||0
          })
           const remainingAmount = purchaseData.amount - totalPayments;
          if (remainingAmount > 0) {
            return {
              purchase: purchaseData,
              remainingAmount: remainingAmount
            };
          }
        }).filter(Boolean); 
    
        return purchasesWithBalance;
      }    
}

module.exports = new PaymentService();
