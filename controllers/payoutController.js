// controllers/payoutController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.requestPayout = async (req, res, next) => {
    try {
        const merchantId = req.user.userId;
        const { amount } = req.body;

        // Calculate available balance
        const totalTransactions = await prisma.merchantTransaction.aggregate({
            _sum: { amount: true },
            where: {
                merchantId,
                status: 'SUCCESS',
            },
        });

        const totalPayouts = await prisma.payout.aggregate({
            _sum: { amount: true },
            where: {
                merchantId,
                status: 'PAID',
            },
        });

        const availableBalance =
            (totalTransactions._sum.amount || 0) - (totalPayouts._sum.amount || 0);

        if (amount > availableBalance) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create payout request
        const payout = await prisma.payout.create({
            data: {
                merchantId,
                amount,
                status: 'REQUESTED',
            },
        });

        res.status(201).json({ message: 'Payout requested successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getPayouts = async (req, res, next) => {
    try {
        const merchantId = req.user.userId;

        const payouts = await prisma.payout.findMany({
            where: { merchantId },
        });

        res.json(payouts);
    } catch (error) {
        next(error);
    }
};

exports.getAllPayouts = async (req, res, next) => {
    try {
        const payouts = await prisma.payout.findMany();
        res.json(payouts);
    } catch (error) {
        next(error);
    }
};
