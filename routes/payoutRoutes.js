// routes/payoutRoutes.js
const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Merchant routes
router.post(
    '/',
    authenticate,
    authorize(['MERCHANT']),
    payoutController.requestPayout
);

router.get(
    '/merchant',
    authenticate,
    authorize(['MERCHANT']),
    payoutController.getPayouts
);

// Admin routes
router.get(
    '/',
    authenticate,
    authorize(['ADMIN']),
    payoutController.getAllPayouts
);

module.exports = router;
