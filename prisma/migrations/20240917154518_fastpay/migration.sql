/*
  Warnings:

  - The values [SuperAdmin,Admin,Verification,Merchant,MerchantUser] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Merchant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountHolder` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `ifscCode` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `qrCode` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `upiId` on the `Merchant` table. All the data in the column will be lost.
  - The primary key for the `Payout` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `initiatedById` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `payinsTotal` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `payoutAmount` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `payoutDate` on the `Payout` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentProof` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Settlement` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactNumber` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Payout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Payout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('ACTIVE', 'FROZEN');

-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('MANUAL', 'AUTO');

-- CreateEnum
CREATE TYPE "Method" AS ENUM ('UPI', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('SUCCESS', 'FAILED', 'REJECTED', 'PENDING');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('REQUESTED', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CrDr" AS ENUM ('CR', 'DR');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'DATA_ENTRY', 'SUPPORT', 'MERCHANT');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentProof" DROP CONSTRAINT "PaymentProof_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_initiatedById_fkey";

-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "Settlement" DROP CONSTRAINT "Settlement_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_merchantId_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Merchant" DROP CONSTRAINT "Merchant_pkey",
DROP COLUMN "accountHolder",
DROP COLUMN "accountNumber",
DROP COLUMN "bankName",
DROP COLUMN "ifscCode",
DROP COLUMN "level",
DROP COLUMN "qrCode",
DROP COLUMN "upiId",
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "status" "MerchantStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Merchant_id_seq";

-- AlterTable
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_pkey",
DROP COLUMN "initiatedById",
DROP COLUMN "payinsTotal",
DROP COLUMN "payoutAmount",
DROP COLUMN "payoutDate",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "PayoutStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "merchantId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Payout_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Payout_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "username",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "merchantId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "PaymentProof";

-- DropTable
DROP TABLE "Settlement";

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateTable
CREATE TABLE "BankDetail" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "upiId" TEXT,
    "qrCodeUrl" TEXT,
    "minLimit" DOUBLE PRECISION NOT NULL,
    "maxLimit" DOUBLE PRECISION NOT NULL,
    "turnover" DOUBLE PRECISION NOT NULL,
    "creditLimit" DOUBLE PRECISION NOT NULL,
    "debitLimit" DOUBLE PRECISION NOT NULL,
    "mode" "Mode" NOT NULL,
    "method" "Method" NOT NULL,
    "level" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "txnId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "utr" TEXT NOT NULL,
    "isGetPay" BOOLEAN NOT NULL,
    "method" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "txnDate" TIMESTAMP(3) NOT NULL,
    "crDr" "CrDr" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantTransaction" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "bankTransactionId" TEXT,
    "utr" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SupportStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankTransaction_txnId_key" ON "BankTransaction"("txnId");

-- CreateIndex
CREATE UNIQUE INDEX "BankTransaction_utr_key" ON "BankTransaction"("utr");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetail" ADD CONSTRAINT "BankDetail_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantTransaction" ADD CONSTRAINT "MerchantTransaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantTransaction" ADD CONSTRAINT "MerchantTransaction_bankTransactionId_fkey" FOREIGN KEY ("bankTransactionId") REFERENCES "BankTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
