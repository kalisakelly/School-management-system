/*
  Warnings:

  - Added the required column `assignment` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "assignment" TEXT NOT NULL;
