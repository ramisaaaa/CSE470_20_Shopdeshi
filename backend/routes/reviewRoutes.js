const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');

router.post('/api/review', ctrl.createReview);
router.patch('/api/review/:id', ctrl.updateReview);
router.delete('/api/review/:id', ctrl.deleteReview);
router.get('/api/reviews/:productId', ctrl.getReviewsForProduct);

module.exports = router;


