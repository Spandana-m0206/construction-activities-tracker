const express = require('express');
const PurchaseController = require('./purchase.controller');

const router = express.Router();

router.post('/create-purchases', PurchaseController.createPurchase.bind(PurchaseController));
router.get('/balance-amount/:purchaseId',PurchaseController.getRemainingAmount.bind(PurchaseController));//to get the balance amount
router.get('/purchase-with-balanceAmount/:vendorId',PurchaseController.getAllPurchasesWithBalance.bind(PurchaseController))

// Base routes from BaseController
router.post('/', PurchaseController.create.bind(PurchaseController)); // Create purchase
router.get('/', PurchaseController.find.bind(PurchaseController)); // Get all purchases
router.get('/:id', PurchaseController.findOne.bind(PurchaseController)); // Get purchase by ID
router.put('/:id', PurchaseController.update.bind(PurchaseController)); // Update purchase
router.delete('/:id', PurchaseController.delete.bind(PurchaseController)); // Delete purchase

// Custom route: Get purchases by vendor
router.get('/vendor/:vendorId', PurchaseController.getPurchasesByVendor.bind(PurchaseController)); // Find purchases by vendor

module.exports = router;
