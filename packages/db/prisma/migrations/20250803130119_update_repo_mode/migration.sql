/*
  Warnings:

  - Added the required column `repoFullName` to the `Repo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repoURL` to the `Repo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repo" ADD COLUMN     "repoFullName" TEXT NOT NULL,
ADD COLUMN     "repoURL" TEXT NOT NULL;
