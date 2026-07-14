ALTER TABLE "offers" ADD COLUMN "code" TEXT;
CREATE UNIQUE INDEX "offers_code_key" ON "offers"("code");
ALTER TABLE "orders" ADD COLUMN "rating" INTEGER;
ALTER TABLE "orders" ADD COLUMN "review" TEXT;
