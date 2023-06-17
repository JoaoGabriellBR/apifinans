import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// No momento que a pessoa adicionar um Nova Despesa. Averiguar se ela possui uma CONTA. Caso não possua. Ao criar a despesa criar automaticamente uma conta Carteira!

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

    const response = await prisma.tb_expenses.create({
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
};