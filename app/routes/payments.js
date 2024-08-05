const pr = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require('cors');
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const prisma = new PrismaClient();
pr.use(bodyParser.json());
pr.use(cors())

pr.get("/", (req, res) => {
  res.status(200).send("Hello");
});

pr.get("/payments", async (req, res) => {
  try {
    const payments = await prisma.payments.findMany();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});


const upload = multer({ storage: storage });


pr.post("/payments", upload.single("file"), async (req, res) => {
  try {
    const { accountNumber, amount, bankName, ifscCode, upiId, userName } =
      req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const payment = await prisma.payments.create({
      data: {
        accountNumber,
        amount,
        bankName,
        ifscCode,
        upiId,
        userName,
        fileUrl,  // Include the file URL in the payment data
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment" });
  }
});


module.exports = pr;
