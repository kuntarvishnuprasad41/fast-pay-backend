// routes/bankTransactionRoutes.js
const express = require('express');
const router = express.Router();
const bankTransactionController = require('../controllers/bankTransactionController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Data Entry User routes
router.post(
    '/',
    authenticate,
    authorize(['DATA_ENTRY']),
    bankTransactionController.addBankTransaction
);

// Admin routes
router.get(
    '/',
    authenticate,
    authorize(['ADMIN']),
    bankTransactionController.getBankTransactions
);

module.exports = router;
