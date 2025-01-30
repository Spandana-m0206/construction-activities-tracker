const mongoose = require('mongoose');
const BaseService = require('../base/BaseService');
const PurchaseModel = require('../purchase/purchase.model');
const PaymentModel = require('./payment.model');
const { PaymentStatuses } = require('../../utils/enums');

class PaymentService extends BaseService {
    constructor() {
        super(PaymentModel);
    }

    async findPaymentsByOrg(orgId) {
        return await this.model.find({ org: orgId })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('inventoryRequest.material', 'name category')
            .populate('vendor', 'name address');
    }

    async getUniquePaidTosFromAllocations(purchaseAllocations) {
        const paidTos = [];
    
        for (const alloc of purchaseAllocations) {
            const purchase = await PurchaseModel.findById(alloc.purchaseId)
                .populate('vendor')
                .populate('purchasedBy');
    
            if (!purchase) {
                throw new Error(`Purchase with ID ${alloc.purchaseId} not found.`);
            }
    
            // Determine if the purchase is linked to a Vendor or User
            if (purchase.vendor) {
                paidTos.push({ id: purchase.vendor._id.toString(), model: 'Vendor' });
            } else if (purchase.purchasedBy) {
                paidTos.push({ id: purchase.purchasedBy._id.toString(), model: 'User' });
            } else {
                throw new Error(`Purchase with ID ${alloc.purchaseId} has no associated Vendor or User.`);
            }
        }
    
        // Remove duplicates by creating a map
        const uniquePaidTosMap = {};
        paidTos.forEach(pt => {
            uniquePaidTosMap[pt.id] = pt.model;
        });
    
        // Convert the map back to an array
        const uniquePaidTos = Object.keys(uniquePaidTosMap).map(id => ({
            id,
            model: uniquePaidTosMap[id]
        }));
        return uniquePaidTos;
    };
    
    async createPayment(purchaseAllocations, paymentData, org, paidBy, paidTo, paidToModel) {
        const totalAllocated = purchaseAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
        if (totalAllocated !== paymentData.amount) {
            throw new Error('Total allocated amount does not match the payment amount.');
        }
    
        // Validate each allocation
        for (const alloc of purchaseAllocations) {
            if (!mongoose.Types.ObjectId.isValid(alloc.purchaseId)) {
                throw new Error(`Invalid purchaseId in allocation: ${alloc.purchaseId}`);
            }
            const purchase = await PurchaseModel.findById(alloc.purchaseId).populate('vendor').populate('purchasedBy');
            if (!purchase) {
                throw new Error(`Purchase with ID ${alloc.purchaseId} not found.`);
            }
    
            const sumOfAllocated = purchase.payments.reduce((sum, p) => sum + p.amount, 0);
            const leftover = purchase.amount - sumOfAllocated;
    
            if (alloc.amount > leftover) {
                throw new Error(`Allocation ₹${alloc.amount} exceeds leftover ₹${leftover} for Purchase ${alloc.purchaseId}.`);
            }
        }
    
        // Create the payment document
        const payment = new PaymentModel({
            ...paymentData,
            status: PaymentStatuses.PENDING, 
            paymentAllocation: purchaseAllocations,
            org: org,
            paidBy: paidBy,
            paidTo: paidTo,
            paidToModel: paidToModel
        });
    
        await payment.save();
    
        return payment;
    };

    async approvePayment(paymentId, approvedBy) {
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

        payment.status = PaymentStatuses.APPROVED;
        payment.approvedOn = new Date();
        payment.approvedBy = approvedBy;
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
    
    async markAsPaid(paymentId) {
        const payment = await PaymentModel.findById(paymentId);
  
        if (!payment) {
            throw new Error(`Payment with ID ${paymentId} not found.`);
        }
  
        if (payment.status !== PaymentStatuses.APPROVED) {
            throw new Error(
            `Only payments with status 'approved' can be marked as 'paid'. Current status: ${payment.status}`
            );
        }
  
        payment.status = PaymentStatuses.PAID;
        payment.paidOn = new Date();
 
        await payment.save();
  
        return payment;
    }
  
}

module.exports = new PaymentService();
