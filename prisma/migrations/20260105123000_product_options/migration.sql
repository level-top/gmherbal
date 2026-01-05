-- CreateTable
CREATE TABLE `ProductCategoryOption` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductCategoryOption_code_key`(`code`),
    INDEX `ProductCategoryOption_isActive_idx`(`isActive`),
    INDEX `ProductCategoryOption_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OilTypeOption` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OilTypeOption_code_key`(`code`),
    INDEX `OilTypeOption_isActive_idx`(`isActive`),
    INDEX `OilTypeOption_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariantOption` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductVariantOption_code_key`(`code`),
    INDEX `ProductVariantOption_isActive_idx`(`isActive`),
    INDEX `ProductVariantOption_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExtractionMethodOption` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ExtractionMethodOption_code_key`(`code`),
    INDEX `ExtractionMethodOption_isActive_idx`(`isActive`),
    INDEX `ExtractionMethodOption_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Product`
    ADD COLUMN `categoryId` VARCHAR(191) NULL,
    ADD COLUMN `oilTypeId` VARCHAR(191) NULL,
    ADD COLUMN `variantId` VARCHAR(191) NULL,
    ADD COLUMN `extractionId` VARCHAR(191) NULL;

-- Seed defaults (stable IDs)
INSERT INTO `ProductCategoryOption` (`id`, `code`, `name`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
  ('cat_ghee', 'GHEE', 'Ghee', 10, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('cat_oil',  'OIL',  'Oil',  20, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `OilTypeOption` (`id`, `code`, `name`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
  ('oil_mustard',    'MUSTARD',    'Mustard',    10, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('oil_black_seed', 'BLACK_SEED', 'Black Seed', 20, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('oil_coconut',    'COCONUT',    'Coconut',    30, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('oil_other',      'OTHER',      'Other',      40, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `ProductVariantOption` (`id`, `code`, `name`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
  ('var_purified',   'PURIFIED',   'Purified',   10, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('var_unpurified', 'UNPURIFIED', 'Unpurified', 20, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `ExtractionMethodOption` (`id`, `code`, `name`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
  ('ext_kohlu_cold_press', 'KOHLU_COLD_PRESS', 'Kohlu Cold-Press', 10, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Backfill existing enum columns (if they still exist) into the new FK columns
UPDATE `Product` p
  SET p.`categoryId` = (SELECT c.`id` FROM `ProductCategoryOption` c WHERE c.`code` = p.`category`)
  WHERE p.`category` IS NOT NULL;

UPDATE `Product` p
  SET p.`oilTypeId` = (SELECT o.`id` FROM `OilTypeOption` o WHERE o.`code` = p.`oilType`)
  WHERE p.`oilType` IS NOT NULL;

UPDATE `Product` p
  SET p.`variantId` = (SELECT v.`id` FROM `ProductVariantOption` v WHERE v.`code` = p.`variant`)
  WHERE p.`variant` IS NOT NULL;

UPDATE `Product` p
  SET p.`extractionId` = (SELECT e.`id` FROM `ExtractionMethodOption` e WHERE e.`code` = p.`extraction`)
  WHERE p.`extraction` IS NOT NULL;

-- Drop old indexes/columns (Prisma will recreate indexes on the new FK fields)
DROP INDEX `Product_category_idx` ON `Product`;

ALTER TABLE `Product`
  DROP COLUMN `category`,
  DROP COLUMN `oilType`,
  DROP COLUMN `variant`,
  DROP COLUMN `extraction`;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ProductCategoryOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Product` ADD CONSTRAINT `Product_oilTypeId_fkey` FOREIGN KEY (`oilTypeId`) REFERENCES `OilTypeOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Product` ADD CONSTRAINT `Product_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariantOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Product` ADD CONSTRAINT `Product_extractionId_fkey` FOREIGN KEY (`extractionId`) REFERENCES `ExtractionMethodOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `Product_categoryId_idx` ON `Product`(`categoryId`);
CREATE INDEX `Product_oilTypeId_idx` ON `Product`(`oilTypeId`);
CREATE INDEX `Product_variantId_idx` ON `Product`(`variantId`);
CREATE INDEX `Product_extractionId_idx` ON `Product`(`extractionId`);
