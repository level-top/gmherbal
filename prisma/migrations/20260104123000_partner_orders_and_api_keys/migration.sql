-- AlterTable
ALTER TABLE `ApiKey` ADD COLUMN `encryptedKey` TEXT NULL;

-- AlterTable
ALTER TABLE `Order`
  ADD COLUMN `source` ENUM('PUBLIC', 'PARTNER') NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN `partnerId` VARCHAR(191) NULL,
  ADD COLUMN `totalBaseAmount` INTEGER NULL,
  ADD COLUMN `totalPartnerAmount` INTEGER NULL,
  ADD COLUMN `partnerProfit` INTEGER NULL,
  ADD COLUMN `partnerPayoutStatus` ENUM('PENDING', 'PAID') NULL,
  ADD COLUMN `partnerPayoutPaidAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `OrderItem` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NULL,
  `productName` VARCHAR(191) NOT NULL,
  `quantity` INTEGER NOT NULL,
  `baseUnitPrice` INTEGER NOT NULL,
  `partnerUnitPrice` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `OrderItem_orderId_idx`(`orderId`),
  INDEX `OrderItem_productId_idx`(`productId`),
  INDEX `OrderItem_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddIndex
CREATE INDEX `Order_source_idx` ON `Order`(`source`);

-- AddIndex
CREATE INDEX `Order_partnerId_idx` ON `Order`(`partnerId`);

-- AddForeignKey
ALTER TABLE `Order`
  ADD CONSTRAINT `Order_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
