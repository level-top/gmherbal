-- AlterTable
ALTER TABLE `product` ADD COLUMN `category` ENUM('GHEE', 'OIL') NULL,
    ADD COLUMN `extraction` ENUM('KOHLU_COLD_PRESS') NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `oilType` ENUM('MUSTARD', 'BLACK_SEED', 'COCONUT', 'OTHER') NULL,
    ADD COLUMN `priceCents` INTEGER NULL,
    ADD COLUMN `sizeLabel` VARCHAR(191) NULL,
    ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `variant` ENUM('PURIFIED', 'UNPURIFIED') NULL;

-- CreateTable
CREATE TABLE `Certification` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `authority` VARCHAR(191) NOT NULL,
    `refNo` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Certification_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Testimonial` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `videoUrl` VARCHAR(191) NULL,
    `rating` INTEGER NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Testimonial_productId_idx`(`productId`),
    INDEX `Testimonial_isApproved_idx`(`isApproved`),
    INDEX `Testimonial_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Product_category_idx` ON `Product`(`category`);

-- CreateIndex
CREATE INDEX `Product_isFeatured_idx` ON `Product`(`isFeatured`);

-- CreateIndex
CREATE INDEX `Product_sortOrder_idx` ON `Product`(`sortOrder`);

-- AddForeignKey
ALTER TABLE `Testimonial` ADD CONSTRAINT `Testimonial_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
