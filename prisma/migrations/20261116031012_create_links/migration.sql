-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "links_code_key" ON "links"("code");

-- Runtime role: DML only on application data, never on migration metadata.
GRANT SELECT, INSERT, UPDATE ON TABLE "links" TO "gtech_app";
DO $$
BEGIN
    IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
        EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE "_prisma_migrations" FROM "gtech_app"';
    END IF;
END
$$;
