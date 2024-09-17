// controllers/merchantTransactionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addMerchantTransaction = async (req, res, next) => {
    try {
        const { amount, utr } = req.body;
        const merchantId = req.user.userId;

        // Check if transaction with same UTR exists
        const existingTransaction = await prisma.merchantTransaction.findFirst({
            where: {
                merchantId,
                utr,
            },
        });

        if (existingTransaction) {
            return res.status(400).json({ message: 'Transaction already exists' });
        }

        // Create merchant transaction with PENDING status
        const merchantTransaction = await prisma.merchantTransaction.create({
            data: {
                merchantId,
                amount,
                utr,
                status: 'PENDING',
            },
        });

        res.status(201).json(merchantTransaction);
    } catch (error) {
        next(error);
    }
};

exports.getMerchantTransactions = async (req, res, next) => {
    try {
        const merchantId = req.user.userId;

        const transactions = await prisma.merchantTransaction.findMany({
            where: { merchantId },
        });

        res.json(transactions);
    } catch (error) {
        next(error);
    }
};
