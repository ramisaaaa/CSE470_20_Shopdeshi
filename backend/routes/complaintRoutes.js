const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/complaintController');

router.post('/complaints', ctrl.submitComplaint);
router.post('/complaints/:id/reply', ctrl.replyComplaint);
router.get('/complaints', ctrl.getAllComplaints);
router.patch('/complaints/:id/status', ctrl.updateComplaintStatus);

router.post('/api/complaint', ctrl.createOrAppendComplaint);
router.get('/api/complaints', ctrl.getComplaintsForAdmin);
router.patch('/api/complaint/:id/status', ctrl.patchComplaintStatus);

module.exports = router;


