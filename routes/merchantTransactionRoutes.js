// routes/merchantTransactionRoutes.js
const express = require('express');
const router = express.Router();
const merchantTransactionController = require('../controllers/merchantTransactionController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Merchant routes
router.post(
    '/',
    authenticate,
    authorize(['MERCHANT']),
    merchantTransactionController.addMerchantTransaction
);

router.get(
    '/',
    authenticate,
    authorize(['MERCHANT']),
    merchantTransactionController.getMerchantTransactions
);

module.exports = router;
