-- AlterTable
ALTER TABLE `Partner`
  ADD COLUMN `payoutMethod` VARCHAR(191) NULL,
  ADD COLUMN `payoutAccountName` VARCHAR(191) NULL,
  ADD COLUMN `payoutAccountNumber` VARCHAR(191) NULL,
  ADD COLUMN `payoutBankName` VARCHAR(191) NULL,
  ADD COLUMN `payoutIban` VARCHAR(191) NULL,
  ADD COLUMN `payoutPhone` VARCHAR(191) NULL,
  ADD COLUMN `payoutNotes` TEXT NULL;
