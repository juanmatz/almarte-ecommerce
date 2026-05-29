-- AlterTable
ALTER TABLE `users` ADD COLUMN `document_id` VARCHAR(20) NULL,
    ADD COLUMN `is_guest` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `password_hash` VARCHAR(255) NULL;
