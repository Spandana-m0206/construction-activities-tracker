const BaseController = require('../base/BaseController');
const PurchaseService = require('./purchase.service');

class PurchaseController extends BaseController {
    constructor() {
        super(PurchaseService); // Pass the PurchaseService to the BaseController
    }

    // Example custom controller method: Get purchases by vendor
    async getPurchasesByVendor(req, res, next) {
        try {
            const purchases = await this.service.findPurchasesByVendor({vendor:req.params.vendorId, org:req.user.org});
            res.status(200).json({ success: true, data: purchases });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 2) Create a Purchase for the specified Purchase Requests
     *    - Accepts purchaseRequestIds, vendor, purchasedBy, amount, attachment, org
     *    - Creates MaterialListItems, Purchase, and PurchaseRequestFulfillments
     */
    async createPurchase(req, res, next) {
        try {
            const {
                purchaseRequests,
                purchaseRequestIds,
                vendor,
                amount,
                attachment,
            } = req.body;

            if (!purchaseRequestIds || !purchaseRequestIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'purchaseRequestIds array is required',
                });
            }

            const newPurchase = await this.service.createPurchase({
                purchaseRequestIds,
                materialsList:purchaseRequests,
                vendor,
                purchasedBy:req.user.userId,
                amount,
                attachment,
                org: req.user.org,
            });

            return res.status(201).json({ success: true, data: newPurchase });
        } catch (error) {
            next(error);
        }
    }
    async getRemainingAmount(req,res){

        try {
            const {purchaseId}=req.params
            const purchaseData=await PurchaseService.findById(purchaseId)
            if(!purchaseData){
                return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND,"Purchase Details Not Found","Purchase Details Not Found"))
            }
            const approvedPaymentList=await PaymentService.find({'paymentAllocation.purchaseId':purchaseId,status:PaymentStatuses.APPROVED})

            if(approvedPaymentList.length===0){
               return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,{remainingAmount:purchaseData.amount},"No Payment Records Found For This Purchase"))
            }
            const remainingAmount=await PurchaseService.getRemainingAmount(approvedPaymentList,purchaseData)
            return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,remainingAmount,"Remaining Amount To Be Paid On This Purchase"))
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))
        }

    }
    async getAllPurchasesWithBalance(req,res){
       try {
         const {vendorId}=req.params

         const purchaseList=await PurchaseService.getPurchasesWithBalanceAmount(vendorId)
         if(purchaseList.length===0){
            return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND,"Purchase Details Not Found","Purchase Details Not Found"))
         }
         return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,purchaseList,"Purchases With Remaining Amount"))

       } catch (error) {

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))
       }

    }
}

module.exports = new PurchaseController();
