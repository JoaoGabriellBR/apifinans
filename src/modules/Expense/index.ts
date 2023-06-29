import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// No momento que a pessoa adicionar um Nova Despesa. Averiguar se ela possui uma CONTA. Caso não possua. Ao criar a despesa criar automaticamente uma conta Carteira!
// Adicionar blocos Try catch a todas as funções.

const prisma = new PrismaClient();

const userWithoutPassword = {
  id: true,
  name: true,
  email: true,
  password: false,
  created_at: true,
  updated_at: true,
  deleted_at: true,
};

interface CustomRequest extends Request {
  userData?: {
    id?: number;
  };
}

export = {
  async createExpense(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id_bill, balance, description, status } = req.body;
      // const id = String(req.headers?.id_bill); // id da conta;

      if (!balance || !description)
        return res
          .status(400)
          .send({ error: "Forneça todos os dados solicitados!" });

      const response = await prisma.tb_expense.create({
        data: {
          balance,
          description,
          status: !!status,
          author: { connect: { id: userData?.id } },
          tb_bill: { connect: { id: parseInt(id_bill) } },
        },
        include: { author: { select: userWithoutPassword } },
      });

      res.status(201).send({ success: true, response });
    } catch (error: any) {
      console.log(error?.response?.data);
      res.status(500).send({ error: "Ocorreu um erro ao criar a despesa." });
    }
  },

  async payExpense(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;

      const expenseExists = await prisma.tb_expense.findUnique({
        where: { id: parseInt(id) },
      });

      if (!expenseExists || expenseExists.deleted_at !== null) {
        return res.status(404).send({ error: "Despesa não encontrada." });
      }

      await prisma.tb_expense.update({
        where: { id: parseInt(id) },
        data: { status: true },
      });

      res
        .status(200)
        .send({ success: true, message: "Despesa paga com sucesso." });
    } catch (error: any) {
      console.log(error?.response?.data);
      res.status(500).send({
        error: "Ocorreu um erro ao confirmar o pagamento da despesa.",
      });
    }
  },

  async getExpense(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;

      const expenseExists = await prisma.tb_expense.findUnique({
        where: { id: parseInt(id) },
      });

      if (!expenseExists || expenseExists.deleted_at !== null) {
        return res.status(404).send({ error: "Despesa não encontrada." });
      }

      const response = await prisma.tb_expense.findFirst({
        where: {
          id: expenseExists.id,
          id_author: userData?.id,
          deleted_at: null,
        },
        include: {
          author: { select: userWithoutPassword },
        },
      });

      res.status(200).json({ success: true, response });
    } catch (error: any) {
      console.log(error?.response?.data);
      res.status(500).send({ error: "Ocorreu um erro ao carregar a despesa." });
    }
  },

  async getAllExpenses(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;

      const response = await prisma.tb_expense.findMany({
        where: {
          id_author: userData?.id,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
        include: {
          author: { select: userWithoutPassword },
        },
      });

      res.status(200).send({ success: true, response });
    } catch (error: any) {
      console.log(error?.response?.data);
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao carregar as despesas." });
    }
  },

  async updateExpense(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;
      const { balance, description, status } = req.body;

      const expenseExists = await prisma.tb_expense.findUnique({
        where: { id: parseInt(id) },
      });

      if (!expenseExists || expenseExists.deleted_at !== null) {
        return res.status(404).send({ error: "Despesa não encontrada." });
      }

      const response = await prisma.tb_expense.update({
        where: { id: expenseExists.id },
        data: {
          balance,
          description,
          status: !!status,
          author: { connect: { id: userData?.id } },
        },
        include: {
          author: { select: userWithoutPassword },
        },
      });

      res.status(200).send({ success: true, response });
    } catch (error: any) {
      console.log(error?.response?.data);
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao atualizar a despesa." });
    }
  },

  async deleteExpense(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;

      const expenseExists = await prisma.tb_expense.findFirst({
        where: { id: parseInt(id), id_author: userData?.id },
      });

      if (!expenseExists || expenseExists.deleted_at !== null) {
        return res.status(404).send({ error: "Despesa não encontrada." });
      }

      await prisma.tb_expense.update({
        where: { id: expenseExists.id },
        data: {
          deleted_at: new Date(),
        },
      });

      res
        .status(200)
        .send({ success: true, message: "Despesa excluída com sucesso." });
    } catch (error: any) {
      console.log(error?.response?.data);
      res.status(500).send({ error: "Ocorreu um erro ao excluír a despesa." });
    }
  },
};
