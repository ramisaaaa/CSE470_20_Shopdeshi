const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');

router.post('/users/upsert', ctrl.upsertUser);
router.get('/users/all', ctrl.listUsers);
router.get('/users/by-email', ctrl.findByEmail);
router.get('/users/by-id', ctrl.findByClerkId);

module.exports = router;


