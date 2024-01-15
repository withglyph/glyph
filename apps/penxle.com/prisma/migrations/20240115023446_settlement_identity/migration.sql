-- CreateTable
CREATE TABLE "user_settlement_identities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resident_registration_number_hash" TEXT NOT NULL,
    "encrypted_resident_registration_number" TEXT NOT NULL,
    "encrypted_resident_registration_number_nonce" TEXT NOT NULL,
    "bank_code" TEXT NOT NULL,
    "bank_account_number" TEXT NOT NULL,

    CONSTRAINT "user_settlement_identities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settlement_identities_user_id_key" ON "user_settlement_identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_settlement_identities_resident_registration_number_has_key" ON "user_settlement_identities"("resident_registration_number_hash");

-- AddForeignKey
ALTER TABLE "user_settlement_identities" ADD CONSTRAINT "user_settlement_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
