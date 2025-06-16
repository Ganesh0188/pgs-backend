/*
  Warnings:

  - Changed the type of `residentId` on the `Resident` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Resident_residentId_key";

-- AlterTable
ALTER TABLE "Resident" DROP COLUMN "residentId",
ADD COLUMN     "residentId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNumberPrimary" TEXT NOT NULL,
    "mobileNumberSecondary" TEXT,
    "address" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "identityDocImage" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
