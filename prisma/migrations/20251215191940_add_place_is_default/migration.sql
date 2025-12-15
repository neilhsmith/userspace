-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "moderatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Place_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Place" ("createdAt", "id", "moderatorId", "name", "slug", "updatedAt") SELECT "createdAt", "id", "moderatorId", "name", "slug", "updatedAt" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
CREATE UNIQUE INDEX "Place_name_key" ON "Place"("name");
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
