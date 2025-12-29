-- CreateTable
CREATE TABLE IF NOT EXISTS "admin_config" (
    "id" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_config_pkey" PRIMARY KEY ("id")
);

-- Insert default admin config if it doesn't exist (will be updated on first password change)
-- Note: This uses a placeholder hash - the actual password should be set via the API

