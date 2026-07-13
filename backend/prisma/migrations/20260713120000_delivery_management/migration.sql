-- Delivery Management System. The enum replacement safely maps the legacy
-- fulfilment names to the delivery workflow names before changing the column.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DELIVERY_PARTNER';

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "delivery_partner_id" INTEGER,
  ADD COLUMN IF NOT EXISTS "accepted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "packed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "ready_for_pickup_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "picked_up_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "out_for_delivery_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3);

CREATE TYPE "OrderStatus_new" AS ENUM (
  'PENDING', 'ACCEPTED', 'PACKING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY',
  'DELIVERED', 'CANCELLED', 'FAILED', 'RETURNED'
);

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new"
  USING (CASE "status"::text
    WHEN 'PLACED' THEN 'PENDING'
    WHEN 'CONFIRMED' THEN 'ACCEPTED'
    WHEN 'PREPARING' THEN 'PACKING'
    WHEN 'PACKED' THEN 'PACKING'
    WHEN 'READY' THEN 'READY_FOR_PICKUP'
    ELSE "status"::text
  END)::"OrderStatus_new";
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_legacy";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_legacy";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE TABLE "delivery_partners" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "phone" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "vehicle_type" TEXT NOT NULL,
  "vehicle_number" TEXT NOT NULL,
  "profile_image" TEXT,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "is_online" BOOLEAN NOT NULL DEFAULT false,
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  "current_latitude" DOUBLE PRECISION,
  "current_longitude" DOUBLE PRECISION,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "delivery_partners_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "delivery_partners_user_id_key" ON "delivery_partners"("user_id");
CREATE UNIQUE INDEX "delivery_partners_phone_key" ON "delivery_partners"("phone");
CREATE INDEX "delivery_partners_is_online_is_available_idx" ON "delivery_partners"("is_online", "is_available");
CREATE INDEX "orders_delivery_partner_id_status_idx" ON "orders"("delivery_partner_id", "status");
CREATE INDEX "orders_status_idx" ON "orders"("status");

ALTER TABLE "delivery_partners" ADD CONSTRAINT "delivery_partners_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_partner_id_fkey"
  FOREIGN KEY ("delivery_partner_id") REFERENCES "delivery_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
