const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

router.get('/orders', ctrl.getOrders);
router.get('/api/purchase-history', ctrl.getPurchaseHistory);
router.put('/orders/status', ctrl.updateOrderStatus);
router.get('/orders/:id', ctrl.getOrderById);
router.patch('/api/order/:orderId/status', ctrl.patchOrderStatus);
router.get('/api/order/:orderId/status', ctrl.getOrderStatus);
router.post('/purchase', ctrl.recordPurchaseToUser);

module.exports = router;


