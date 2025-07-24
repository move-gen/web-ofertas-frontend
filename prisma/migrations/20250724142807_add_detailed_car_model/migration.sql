/*
  Warnings:

  - You are about to drop the column `brand` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Car` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `Car` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `regularPrice` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Car_name_key";

-- AlterTable
ALTER TABLE "Car" DROP COLUMN "brand",
DROP COLUMN "model",
DROP COLUMN "price",
DROP COLUMN "year",
ADD COLUMN     "currency" TEXT DEFAULT 'EUR',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "regularPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "stock" INTEGER DEFAULT 1,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'visible';

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "carId" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attribute" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "carId" INTEGER NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Car_sku_key" ON "Car"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_slug_key" ON "Offer"("slug");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
