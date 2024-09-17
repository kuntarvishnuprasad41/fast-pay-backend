// routes/reconciliationRoutes.js
const express = require('express');
const router = express.Router();
const reconciliationController = require('../controllers/reconciliationController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Admin route
router.post(
    '/',
    authenticate,
    authorize(['ADMIN']),
    reconciliationController.reconcileTransactions
);

module.exports = router;