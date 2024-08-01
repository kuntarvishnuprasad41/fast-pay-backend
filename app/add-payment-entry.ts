import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.payments.create({
    data: {
      accountNumber: "512312312312",
      amount: 100,
      bankName: "UBI",
      ifscCode: "ased8123",
      upiId: "12@asda",
      userName: "Vishnu",
    },
  });

  console.log(await prisma.payments.findMany());
}

main()
  .then(async () => {
    console.log("Done with Query");

    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
