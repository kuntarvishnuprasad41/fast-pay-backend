const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Admin route
router.post(
    '/',
    authenticate,
    authorize(['ADMIN']),
    settlementController.settlePayouts
);

module.exports = router;