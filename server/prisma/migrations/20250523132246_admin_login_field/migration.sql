/*
  Warnings:

  - You are about to drop the column `email` on the `Admin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[login]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `login` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Admin_email_key";

-- AlterTable
CREATE SEQUENCE admin_id_seq;
ALTER TABLE "Admin" DROP COLUMN "email",
ADD COLUMN     "login" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('admin_id_seq');
ALTER SEQUENCE admin_id_seq OWNED BY "Admin"."id";

-- CreateIndex
CREATE UNIQUE INDEX "Admin_login_key" ON "Admin"("login");
