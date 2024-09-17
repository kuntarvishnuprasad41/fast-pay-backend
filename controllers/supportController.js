// controllers/supportController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createSupportTicket = async (req, res, next) => {
    try {
        const merchantId = req.user.userId;
        const { subject, description } = req.body;

        const ticket = await prisma.supportTicket.create({
            data: {
                merchantId,
                subject,
                description,
                status: 'OPEN',
            },
        });

        res.status(201).json({ message: 'Support ticket created', ticket });
    } catch (error) {
        next(error);
    }
};

exports.getSupportTickets = async (req, res, next) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { merchantId: req.user.userId },
        });

        res.json(tickets);
    } catch (error) {
        next(error);
    }
};

exports.updateSupportTicketStatus = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;

        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status },
        });

        res.json({ message: 'Support ticket status updated', ticket });
    } catch (error) {
        next(error);
    }
};
