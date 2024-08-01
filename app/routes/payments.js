const pr = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require('cors');

const prisma = new PrismaClient();
pr.use(bodyParser.json());
pr.use(cors())

pr.get("/payments", (req, res) => {
  res.status(200).send("Hello");
});

pr.get("/", async (req, res) => {
  try {
    const payments = await prisma.payments.findMany();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

pr.post("/", async (req, res) => {
  try {
    const { accountNumber, amount, bankName, ifscCode, upiId, userName } =
      req.body;

    const payment = await prisma.payments.create({
      data: {
        accountNumber,
        amount,
        bankName,
        ifscCode,
        upiId,
        userName,
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment" });
  }
});

module.exports = pr;
