/*
  Warnings:

  - You are about to drop the column `value` on the `tb_bill` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `tb_expense` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `tb_revenue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tb_bill" DROP COLUMN "value",
ADD COLUMN     "balance" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tb_expense" DROP COLUMN "value",
ADD COLUMN     "balance" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tb_revenue" DROP COLUMN "value",
ADD COLUMN     "balance" DOUBLE PRECISION;
