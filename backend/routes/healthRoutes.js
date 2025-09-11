const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/healthController');

router.get('/health', ctrl.health);
router.get('/api/health', ctrl.apiHealth);

module.exports = router;


