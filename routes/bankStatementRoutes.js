const express = require('express');
const router = express.Router();
const bankStatementController = require('../controllers/bankStatementController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Admin route
router.get(
    '/',
    authenticate,
    authorize(['ADMIN']),
    bankStatementController.getBankStatements
);

module.exports = router;