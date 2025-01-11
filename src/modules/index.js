const express = require("express");
const orgRoutes = require("./org");
const userRoutes = require("./user");
const siteRoutes = require("./site");
const vendorRoutes = require("./vendor");
const inventoryRoutes = require("./inventory");
const materialMetadataRoutes = require("./materialMetadata");
const stockRoutes = require("./stock");
const taskRoutes = require("./task");
const paymentRoutes = require("./payment");
const orderRoutes = require("./order");
const approvalRoutes = require("./approval");
const usageRoutes = require("./usage");
const messageRoutes = require("./message");
const fileRoutes = require("./file");
const authRoute = require("./auth")
const purchaseRequestFulfillmentRoutes = require("./purchaseRequestFulfillment");
const materialListItemRoutes = require("./materialListItem");
const purchaseRequestRoutes = require("./purchaseRequest");
const penaltyRoutes = require("./penalty");
const requestFulfillmentRoutes = require("./requestFulfillment");
const paymentRequestRoutes = require("./paymentRequest");
const purchaseRoutes = require("./purchase");
const floorDetailsRoutes = require('./floorDetails')
const { authMiddleware } = require("../middlewares/auth.middleware");
const reactionRoutes=require('./messageReaction')

const router = express.Router();

router.use('/v1/auth', authRoute);

router.use(authMiddleware)
router.use('/v1/users', userRoutes);
router.use('/v1/orgs', orgRoutes);
router.use('/v1/sites', siteRoutes);
router.use('/v1/vendors', vendorRoutes);
router.use('/v1/inventories', inventoryRoutes);
router.use('/v1/materials', materialMetadataRoutes);
router.use('/v1/stocks', stockRoutes);
router.use('/v1/tasks', taskRoutes);
router.use('/v1/payments', paymentRoutes);
router.use('/v1/orders', orderRoutes);
router.use('/v1/approvals', approvalRoutes);
router.use('/v1/usages', usageRoutes);
router.use('/v1/messages', messageRoutes);
router.use('/v1/files', fileRoutes);
router.use('/v1/purchase-request-fulfillments', purchaseRequestFulfillmentRoutes);
router.use('/v1/material-list-items', materialListItemRoutes);
router.use('/v1/purchase-requests', purchaseRequestRoutes);
router.use('/v1/penalties', penaltyRoutes);
router.use('/v1/request-fulfillments', requestFulfillmentRoutes);
router.use('/v1/payment-requests', paymentRequestRoutes);
router.use('/v1/floor-details', floorDetailsRoutes);
router.use('/v1/purchases', purchaseRoutes);
router.use('/v1/reaction',reactionRoutes)

module.exports = router;
