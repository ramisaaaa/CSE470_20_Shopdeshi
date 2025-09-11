const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tutorialController');

router.post('/addtutorial', ctrl.addTutorial);
router.get('/alltutorials', ctrl.getAllTutorials);
router.get('/tutorial/:id', ctrl.getTutorial);
router.post('/removetutorial', ctrl.removeTutorial);
router.get('/searchtutorials', ctrl.searchTutorials);

module.exports = router;


