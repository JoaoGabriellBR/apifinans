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

export = {
  async createExpense(req: Request, res: Response) {
    const { userData } = req;
    const { value, description, status } = req.body;
    const { id } = req.params; // id da conta;

    if (!value || !description)
      return res
        .status(400)
        .send({ error: "Forneça todos os dados solicitados!" });

    const response = await prisma.tb_expense.create({
      data: {
        value,
        description,
        status: !!status,
        author: { connect: { id: 1 } },
        // author: { connect: { id: userData.id } },
        tb_bill: { connect: { id: parseInt(id) } },
      },
      include: { author: { select: userWithoutPassword } },
    });

    res.status(201).send({ success: true, response });
  },

  async payExpense(req: Request, res: Response) {
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
  },

  async getExpense(req: Request, res: Response) {
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
        deleted_at: null,
      },
      include: {
        author: { select: userWithoutPassword },
      },
    });

    res.status(200).json({ success: true, response });
  },

  async getAllExpenses(req: Request, res: Response) {
    const { userData } = req;
    const { id } = req.params;

    const response = await prisma.tb_expense.findMany({
      where: {
        // id_author: userData?.id,
        id: parseInt(id),
        deleted_at: null,
      },
      orderBy: { created_at: "desc" },
      include: {
        author: { select: userWithoutPassword },
      },
    });

    res.status(200).send({ success: true, response });
  },

  async updateExpense(req: Request, res: Response) {
    const { userData } = req;
    const { id } = req.params;
    const { value, description, status } = req.body;

    const expenseExists = await prisma.tb_expense.findUnique({
      where: { id: parseInt(id) },
    });

    if (!expenseExists || expenseExists.deleted_at !== null) {
      return res.status(404).send({ error: "Despesa não encontrada." });
    }

    const response = await prisma.tb_expense.update({
      where: { id: expenseExists.id },
      data: {
        value,
        description,
        status: !!status,
        // author: { connect: { id: userData.id } },
        author: { connect: { id: 1 } }
      },
      include: {
        author: { select: userWithoutPassword },
      },
    });

    res.status(200).send({ success: true, response });
  },

  async deleteExpense(req: Request, res: Response) {
    const { userData } = req;
    const { id } = req.params;

    const expenseExists = await prisma.tb_expense.findUnique({
      where: { id: parseInt(id) },
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
  },
};