import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CustomRequest extends Request {
  userData?: {
    id?: number;
  };
}

export = {
  async calculateTotalBalanceBill(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const notDeleted = {
        deleted_at: null,
      };

      const bills = await prisma.tb_bill.findMany({
        where: {
          id_author: userData?.id,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
        include: {
          expenses: { where: notDeleted },
          revenues: { where: notDeleted },
        },
      });

      const totalBalanceBill = bills.reduce((total, bill) => {
        const expensesBalance = bill.expenses.reduce((total, expense) => {
          if (expense.status) {
            return total + (expense.balance ?? 0);
          } else {
            return total;
          }
        }, 0);

        const revenuesBalance = bill.revenues.reduce((total, revenue) => {
          if (revenue.status) {
            return total + (revenue.balance ?? 0);
          } else {
            return total;
          }
        }, 0);

        const billTotal =
          (bill.balance ?? 0) + revenuesBalance - expensesBalance;
        return total + billTotal;
      }, 0);

      res
        .status(200)
        .send({ success: true, total_balance_bill: totalBalanceBill });
    } catch (error: any) {
      console.log(error.message);
      res.status(500).send({ error: "Ocorreu um erro ao carregar os dados." });
    }
  },

  async calculateTotalBalanceExpense(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;

      const expenses = await prisma.tb_expense.findMany({
        where: {
          id_author: userData?.id,
          deleted_at: null,
        },
      });

      const totalBalanceExpense = expenses.reduce(
        (total, expense) => total + (expense.balance ?? 0),
        0
      );

      res
        .status(200)
        .send({ success: true, total_balance_expense: totalBalanceExpense });
    } catch (error: any) {
      console.log(error.message);
      res.status(500).send({ error: "Ocorreu um erro ao carregar os dados." });
    }
  },

  async calculateTotalBalanceRevenue(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;

      const revenues = await prisma.tb_revenue.findMany({
        where: {
          id_author: userData?.id,
          deleted_at: null,
        },
      });

      const totalBalanceRevenue = revenues.reduce(
        (total, revenues) => total + (revenues.balance ?? 0),
        0
      );

      res
        .status(200)
        .send({ success: true, total_balance_revenue: totalBalanceRevenue });
    } catch (error: any) {
      console.log(error.message);
      res.status(500).send({ error: "Ocorreu um erro ao carregar os dados." });
    }
  },
};
