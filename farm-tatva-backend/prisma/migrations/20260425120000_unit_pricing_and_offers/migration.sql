ALTER TABLE `Product`
  ADD COLUMN `inventoryUnit` VARCHAR(191) NOT NULL DEFAULT 'kg',
  MODIFY `stock` DECIMAL(10, 3) NOT NULL DEFAULT 0,
  MODIFY `maxStock` DECIMAL(10, 3) NOT NULL DEFAULT 0;

CREATE TABLE `ProductPricingOption` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `unit` VARCHAR(191) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `quantityStep` DECIMAL(10, 3) NOT NULL DEFAULT 1,
  `minQuantity` DECIMAL(10, 3) NOT NULL DEFAULT 1,
  `maxQuantity` DECIMAL(10, 3) NULL,
  `inventoryFactor` DECIMAL(10, 3) NOT NULL DEFAULT 1,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isDefault` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `ProductPricingOption_productId_sortOrder_idx`(`productId`, `sortOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProductOfferRule` (
  `id` VARCHAR(191) NOT NULL,
  `pricingOptionId` VARCHAR(191) NOT NULL,
  `minQuantity` DECIMAL(10, 3) NOT NULL,
  `discountType` ENUM('PERCENTAGE', 'FLAT') NOT NULL,
  `discountValue` DECIMAL(10, 2) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `startsAt` DATETIME(3) NULL,
  `endsAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `ProductOfferRule_pricingOptionId_isActive_minQuantity_idx`(`pricingOptionId`, `isActive`, `minQuantity`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CartItem`
  ADD COLUMN `pricingOptionId` VARCHAR(191) NULL,
  MODIFY `quantity` DECIMAL(10, 3) NOT NULL DEFAULT 1;

CREATE INDEX `CartItem_productId_idx` ON `CartItem`(`productId`);

CREATE TABLE `new_CartItem` (
  `id` VARCHAR(191) NOT NULL,
  `cartId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `pricingOptionId` VARCHAR(191) NOT NULL,
  `quantity` DECIMAL(10, 3) NOT NULL DEFAULT 1,

  UNIQUE INDEX `CartItem_cartId_pricingOptionId_key`(`cartId`, `pricingOptionId`),
  INDEX `CartItem_productId_idx`(`productId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `ProductPricingOption` (
  `id`,
  `productId`,
  `label`,
  `unit`,
  `price`,
  `quantityStep`,
  `minQuantity`,
  `inventoryFactor`,
  `sortOrder`,
  `isDefault`,
  `createdAt`
)
SELECT
  UUID(),
  `id`,
  CONCAT('Per ', `inventoryUnit`),
  `inventoryUnit`,
  `price`,
  1,
  1,
  1,
  0,
  true,
  CURRENT_TIMESTAMP(3)
FROM `Product`;

UPDATE `CartItem` ci
INNER JOIN `ProductPricingOption` ppo
  ON ppo.productId = ci.productId AND ppo.isDefault = true
SET ci.pricingOptionId = ppo.id;

INSERT INTO `new_CartItem` (`id`, `cartId`, `productId`, `pricingOptionId`, `quantity`)
SELECT `id`, `cartId`, `productId`, `pricingOptionId`, `quantity`
FROM `CartItem`;

DROP TABLE `CartItem`;
RENAME TABLE `new_CartItem` TO `CartItem`;

ALTER TABLE `Order`
  ADD COLUMN `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  MODIFY `total` DECIMAL(10, 2) NOT NULL;

ALTER TABLE `OrderItem`
  ADD COLUMN `pricingOptionId` VARCHAR(191) NULL,
  ADD COLUMN `unit` VARCHAR(191) NOT NULL DEFAULT 'unit',
  ADD COLUMN `optionLabel` VARCHAR(191) NOT NULL DEFAULT 'Per unit',
  ADD COLUMN `unitPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN `total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  MODIFY `quantity` DECIMAL(10, 3) NOT NULL,
  DROP COLUMN `price`;

UPDATE `OrderItem` oi
INNER JOIN `ProductPricingOption` ppo
  ON ppo.productId = oi.productId AND ppo.isDefault = true
SET
  oi.pricingOptionId = ppo.id,
  oi.unit = ppo.unit,
  oi.optionLabel = ppo.label,
  oi.unitPrice = ppo.price,
  oi.subtotal = ppo.price * oi.quantity,
  oi.total = ppo.price * oi.quantity;

UPDATE `Order` o
INNER JOIN (
  SELECT
    `orderId`,
    SUM(`subtotal`) AS subtotal,
    SUM(`discount`) AS discount,
    SUM(`total`) AS total
  FROM `OrderItem`
  GROUP BY `orderId`
) t ON t.orderId = o.id
SET
  o.subtotal = t.subtotal,
  o.discount = t.discount,
  o.total = t.total;

ALTER TABLE `ProductPricingOption`
  ADD CONSTRAINT `ProductPricingOption_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProductOfferRule`
  ADD CONSTRAINT `ProductOfferRule_pricingOptionId_fkey`
  FOREIGN KEY (`pricingOptionId`) REFERENCES `ProductPricingOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CartItem`
  ADD CONSTRAINT `CartItem_cartId_fkey`
  FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CartItem_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `CartItem_pricingOptionId_fkey`
  FOREIGN KEY (`pricingOptionId`) REFERENCES `ProductPricingOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_pricingOptionId_fkey`
  FOREIGN KEY (`pricingOptionId`) REFERENCES `ProductPricingOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
