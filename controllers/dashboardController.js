// controllers/dashboardController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAdminDashboardData = async (req, res, next) => {
    try {
        // Fetch total revenue
        const totalRevenueResult = await prisma.merchantTransaction.aggregate({
            _sum: { amount: true },
            where: { status: 'SUCCESS' },
        });
        const totalRevenue = totalRevenueResult._sum.amount || 0;

        // Fetch total payouts
        const totalPayoutResult = await prisma.payout.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID' },
        });
        const totalPayout = totalPayoutResult._sum.amount || 0;

        // Calculate total payout balance
        const totalPayoutBalance = totalRevenue - totalPayout;

        // Fetch transaction summary
        const transactionSummary = await prisma.merchantTransaction.groupBy({
            by: ['status'],
            _sum: { amount: true },
        });

        // Prepare response data
        const responseData = {
            totalRevenue,
            totalPayout,
            totalPayoutBalance,
            transactionSummary,
        };

        res.json(responseData);
    } catch (error) {
        next(error);
    }
};

exports.getMerchantDashboardData = async (req, res, next) => {
    try {
        const merchantId = req.user.userId;

        // Fetch merchant's total revenue
        const totalRevenueResult = await prisma.merchantTransaction.aggregate({
            _sum: { amount: true },
            where: {
                merchantId,
                status: 'SUCCESS',
            },
        });
        const totalRevenue = totalRevenueResult._sum.amount || 0;

        // Fetch merchant's total payouts
        const totalPayoutResult = await prisma.payout.aggregate({
            _sum: { amount: true },
            where: {
                merchantId,
                status: 'PAID',
            },
        });
        const totalPayout = totalPayoutResult._sum.amount || 0;

        // Calculate total payout balance
        const totalPayoutBalance = totalRevenue - totalPayout;

        // Fetch transaction summary
        const transactionSummary = await prisma.merchantTransaction.groupBy({
            by: ['status'],
            where: { merchantId },
            _sum: { amount: true },
        });

        // Prepare response data
        const responseData = {
            totalRevenue,
            totalPayout,
            totalPayoutBalance,
            transactionSummary,
        };

        res.json(responseData);
    } catch (error) {
        next(error);
    }
};
