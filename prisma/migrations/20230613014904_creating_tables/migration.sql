-- CreateTable
CREATE TABLE "tb_bill" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tb_bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_expenses" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "tb_billId" INTEGER,

    CONSTRAINT "tb_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_revenues" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "tb_billId" INTEGER,

    CONSTRAINT "tb_revenues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tb_bill" ADD CONSTRAINT "tb_bill_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "tb_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_expenses" ADD CONSTRAINT "tb_expenses_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "tb_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_expenses" ADD CONSTRAINT "tb_expenses_tb_billId_fkey" FOREIGN KEY ("tb_billId") REFERENCES "tb_bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_revenues" ADD CONSTRAINT "tb_revenues_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "tb_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_revenues" ADD CONSTRAINT "tb_revenues_tb_billId_fkey" FOREIGN KEY ("tb_billId") REFERENCES "tb_bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
