const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

router.post('/addproduct', ctrl.addProduct);
router.post('/addreview', ctrl.addReviewToEmbedded);
router.get('/reviews/:productId', ctrl.getEmbeddedReviews);
router.get('/admin/reviews', ctrl.getAllEmbeddedReviews);
router.delete('/admin/reviews/delete', ctrl.deleteEmbeddedReview);
router.put('/admin/reviews/approve', ctrl.approveEmbeddedReview);
router.post('/product/purchase', ctrl.addPurchaseToProduct);
router.get('/user/order-history', ctrl.getUserOrderHistoryFromProducts);
router.post('/removeproduct', ctrl.removeProduct);
router.get('/allproducts', ctrl.getAllProducts);

module.exports = router;


