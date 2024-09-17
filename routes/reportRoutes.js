const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Admin route
router.get(
    '/transactions',
    authenticate,
    authorize(['ADMIN']),
    reportController.generateTransactionReport
);

module.exports = router;