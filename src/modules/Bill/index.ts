import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

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
  async createBill(req: Request, res: Response) {
    const { userData } = req;
    const { value, description } = req.body;

    if (!value || !description)
      res.status(400).send({ error: "Forneça todos os dados solicitados!" });

    const response = await prisma.tb_bill.create({
      data: {
        value,
        description,
        author: { connect: { id: 1 } },
        // author: { connect: { id: userData?.id } },
      },
      include: {
        author: { select: userWithoutPassword },
        expenses: true,
        revenues: true,
      },
    });

    res.status(201).send({ success: true, response });
  },

  async updateBill(req: Request, res: Response) {
    const { userData } = req;
    const { id } = req.params;
    const { value, description } = req.body;

    const billExists = await prisma.tb_bill.findFirst({
      where: { id: parseInt(id), deleted_at: null },
    });

    if (!billExists || billExists.deleted_at !== null) {
      return res.status(404).send({ error: "Conta não encontrada." });
    }

    const response = await prisma.tb_bill.update({
      where: { id: parseInt(id) },
      data: {
        value,
        description,
        author: { connect: { id: 1 } },
        // author: { connect: { id: userData?.id } },
      },
      include: {
        author: { select: userWithoutPassword },
        expenses: true,
        revenues: true,
      },
    });

    res.status(200).send({ success: true, response });
  },

  async deleteBill(req: Request, res: Response) {
    const { userData } = req;
    const { id } = req.params;

    const billExists = await prisma.tb_bill.findFirst({
      where: { id: parseInt(id) },
    });

    if (!billExists || billExists.deleted_at !== null) {
      return res.status(404).send({ error: "Conta não encontrada." });
    }

    // SE TIVER RECEITAS OU DESPESAS, FALAR AO USUÁRIO QUE TODAS AS DESPESAS E RECEITAS DO MESMO SERÃO DELETADOS

    await prisma.tb_bill.update({
      where: { id: parseInt(id) },
      data: {
        deleted_at: new Date(),
      },
    });

    res
      .status(200)
      .send({ success: true, message: "A conta foi excluída com sucesso." });
  },

  async getAllBills(req: Request, res: Response) {
    const { userData } = req;
    const { id } = req.params;

    const response = await prisma.tb_bill.findMany({
      where: {
        // id_author: userData?.id,
        id_author: parseInt(id),
        deleted_at: null,
      },
      orderBy: { created_at: "desc" },
      include: {
        author: { select: userWithoutPassword },
        expenses: true,
        revenues: true,
      },
    });

    res.status(200).send({ success: true, response });
  },
};
