/*
  Warnings:

  - You are about to drop the column `roomTypeId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `RoomType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roomTypes` to the `Hostel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ac` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bathrooms` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomType` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_roomTypeId_fkey";

-- DropForeignKey
ALTER TABLE "RoomType" DROP CONSTRAINT "RoomType_hostelId_fkey";

-- AlterTable
ALTER TABLE "Hostel" ADD COLUMN     "roomTypes" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "roomTypeId",
ADD COLUMN     "ac" BOOLEAN NOT NULL,
ADD COLUMN     "bathrooms" INTEGER NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "roomType" INTEGER NOT NULL;

-- DropTable
DROP TABLE "RoomType";
