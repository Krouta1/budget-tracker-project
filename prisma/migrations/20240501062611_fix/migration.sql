/*
  Warnings:

  - You are about to drop the column `curency` on the `UserSettings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSettings" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserSettings" ("createdAt", "updatedAt", "userId") SELECT "createdAt", "updatedAt", "userId" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
