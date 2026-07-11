-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
-- Preserve the existing revocation state while aligning the database column
-- with the new Prisma field name.
ALTER TABLE "refresh_tokens" RENAME COLUMN "is_revoked" TO "revoked";
ALTER TABLE "refresh_tokens" DROP COLUMN "is_used",
DROP COLUMN "replaced_by";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "is_active",
DROP COLUMN "name",
DROP COLUMN "password_hash",
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "otps" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otps_phone_idx" ON "otps"("phone");

-- CreateIndex
CREATE INDEX "otps_expires_at_idx" ON "otps"("expires_at");
