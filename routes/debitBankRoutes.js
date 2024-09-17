// routes/debitBankRoutes.js
const express = require('express');
const router = express.Router();
const debitBankController = require('../controllers/debitBankController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Admin route
router.post(
    '/',
    authenticate,
    authorize(['ADMIN']),
    debitBankController.debitBankAccount
);

module.exports = router;