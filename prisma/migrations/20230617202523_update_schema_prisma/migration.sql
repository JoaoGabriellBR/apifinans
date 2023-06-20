/*
  Warnings:

  - You are about to drop the column `authorId` on the `tb_bill` table. All the data in the column will be lost.
  - You are about to drop the `tb_expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_revenues` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_author` to the `tb_bill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tb_bill" DROP CONSTRAINT "tb_bill_authorId_fkey";

-- DropForeignKey
ALTER TABLE "tb_expenses" DROP CONSTRAINT "tb_expenses_authorId_fkey";

-- DropForeignKey
ALTER TABLE "tb_expenses" DROP CONSTRAINT "tb_expenses_tb_billId_fkey";

-- DropForeignKey
ALTER TABLE "tb_revenues" DROP CONSTRAINT "tb_revenues_authorId_fkey";

-- DropForeignKey
ALTER TABLE "tb_revenues" DROP CONSTRAINT "tb_revenues_tb_billId_fkey";

-- AlterTable
ALTER TABLE "tb_bill" DROP COLUMN "authorId",
ADD COLUMN     "id_author" INTEGER NOT NULL;

-- DropTable
DROP TABLE "tb_expenses";

-- DropTable
DROP TABLE "tb_revenues";

-- CreateTable
CREATE TABLE "tb_expense" (
    "id" SERIAL NOT NULL,
    "id_author" INTEGER NOT NULL,
    "id_bill" INTEGER,
    "value" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tb_expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_revenue" (
    "id" SERIAL NOT NULL,
    "id_author" INTEGER NOT NULL,
    "id_bill" INTEGER,
    "value" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tb_revenue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tb_bill" ADD CONSTRAINT "tb_bill_id_author_fkey" FOREIGN KEY ("id_author") REFERENCES "tb_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_expense" ADD CONSTRAINT "tb_expense_id_author_fkey" FOREIGN KEY ("id_author") REFERENCES "tb_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_expense" ADD CONSTRAINT "tb_expense_id_bill_fkey" FOREIGN KEY ("id_bill") REFERENCES "tb_bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_revenue" ADD CONSTRAINT "tb_revenue_id_author_fkey" FOREIGN KEY ("id_author") REFERENCES "tb_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_revenue" ADD CONSTRAINT "tb_revenue_id_bill_fkey" FOREIGN KEY ("id_bill") REFERENCES "tb_bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
