/*
  Warnings:

  - You are about to drop the column `name` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the column `totalBeds` on the `RoomType` table. All the data in the column will be lost.
  - Added the required column `roomTypes` to the `RoomType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoomType" DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "totalBeds",
ADD COLUMN     "roomTypes" JSONB NOT NULL;
