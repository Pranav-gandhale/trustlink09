-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "governmentId" TEXT,
    "businessLicense" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "latitude" REAL,
    "longitude" REAL,
    "totalHires" INTEGER NOT NULL DEFAULT 0,
    "repeatHireCount" INTEGER NOT NULL DEFAULT 0,
    "disputeResolutionRate" REAL NOT NULL DEFAULT 1.0,
    "averageRating" REAL NOT NULL DEFAULT 0.0,
    "responseTimeMinutes" INTEGER NOT NULL DEFAULT 60,
    "isBackgroundChecked" BOOLEAN NOT NULL DEFAULT false,
    "hasCertifications" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Provider" ("businessLicense", "experience", "governmentId", "id", "isVerified", "latitude", "longitude", "price", "serviceType", "status", "userId") SELECT "businessLicense", "experience", "governmentId", "id", "isVerified", "latitude", "longitude", "price", "serviceType", "status", "userId" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
