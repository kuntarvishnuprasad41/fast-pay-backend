// controllers/debitBankController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.debitBankAccount = async (req, res, next) => {
    try {
        const { bankDetailId, amount } = req.body;

        // Fetch bank detail
        const bankDetail = await prisma.bankDetail.findUnique({
            where: { id: bankDetailId },
        });

        if (!bankDetail) {
            return res.status(404).json({ message: 'Bank detail not found' });
        }

        // Update debit limit
        const updatedBankDetail = await prisma.bankDetail.update({
            where: { id: bankDetailId },
            data: {
                debitLimit: bankDetail.debitLimit - amount,
            },
        });

        res.json({ message: 'Bank account debited successfully', updatedBankDetail });
    } catch (error) {
        next(error);
    }
};
