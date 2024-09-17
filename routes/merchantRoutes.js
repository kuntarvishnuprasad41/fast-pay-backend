// routes/merchantRoutes.js
const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Admin routes
router.post(
    '/',
    authenticate,
    authorize(['ADMIN']),
    merchantController.createMerchant
);

router.get(
    '/',
    authenticate,
    authorize(['ADMIN']),
    merchantController.getMerchants
);

router.get(
    '/:id',
    authenticate,
    authorize(['ADMIN']),
    merchantController.getMerchantById
);

router.put(
    '/:id',
    authenticate,
    authorize(['ADMIN']),
    merchantController.updateMerchant
);

router.patch(
    '/:id/freeze',
    authenticate,
    authorize(['ADMIN']),
    merchantController.freezeMerchant
);

router.delete(
    '/:id',
    authenticate,
    authorize(['ADMIN']),
    merchantController.deleteMerchant
);

module.exports = router;
