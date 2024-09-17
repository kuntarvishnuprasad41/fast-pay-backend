// controllers/reconciliationController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.reconcileTransactions = async (req, res, next) => {
    try {
        // Fetch all pending merchant transactions
        const pendingTransactions = await prisma.merchantTransaction.findMany({
            where: { status: 'PENDING' },
        });

        for (const transaction of pendingTransactions) {
            // Try to find a matching bank transaction based on UTR
            const bankTransaction = await prisma.bankTransaction.findUnique({
                where: { utr: transaction.utr },
            });

            if (bankTransaction) {
                // Update merchant transaction status to SUCCESS
                await prisma.merchantTransaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'SUCCESS',
                        bankTransactionId: bankTransaction.id,
                    },
                });
            } else {
                // Check if transaction is expired
                const timeDifference = new Date() - transaction.createdAt;
                const timeLimit = 24 * 60 * 60 * 1000; // 24 hours

                if (timeDifference > timeLimit) {
                    // Update status to FAILED
                    await prisma.merchantTransaction.update({
                        where: { id: transaction.id },
                        data: { status: 'FAILED' },
                    });
                }
            }
        }

        res.json({ message: 'Reconciliation completed' });
    } catch (error) {
        next(error);
    }
};
