-- CreateEnum
CREATE TYPE "Purpose" AS ENUM ('BUSINESS', 'PRIVATE');

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "street" TEXT,
    "zip" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "purpose" "Purpose" NOT NULL,
    "project" TEXT,
    "startKm" INTEGER NOT NULL,
    "endKm" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,
    "notes" TEXT,
    "startAddressId" TEXT NOT NULL,
    "destAddressId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" "Purpose" NOT NULL,
    "project" TEXT,
    "notesHint" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "startAddressId" TEXT NOT NULL,
    "destAddressId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trip_date_idx" ON "Trip"("date");

-- CreateIndex
CREATE INDEX "Trip_startAddressId_idx" ON "Trip"("startAddressId");

-- CreateIndex
CREATE INDEX "Trip_destAddressId_idx" ON "Trip"("destAddressId");

-- CreateIndex
CREATE INDEX "Template_favorite_idx" ON "Template"("favorite");

-- CreateIndex
CREATE INDEX "Template_name_idx" ON "Template"("name");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_startAddressId_fkey" FOREIGN KEY ("startAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_destAddressId_fkey" FOREIGN KEY ("destAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_startAddressId_fkey" FOREIGN KEY ("startAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_destAddressId_fkey" FOREIGN KEY ("destAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
