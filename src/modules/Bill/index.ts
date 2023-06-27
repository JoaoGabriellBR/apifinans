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

interface CustomRequest extends Request {
  userData?: {
    id?: number;
  };
}

export = {
  async createBill(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { balance, description } = req.body;

      if (!balance || !description)
        res.status(400).send({ error: "Forneça todos os dados solicitados!" });

      const response = await prisma.tb_bill.create({
        data: {
          balance,
          description,
          author: { connect: { id: userData?.id } },
        },
        include: {
          author: { select: userWithoutPassword },
          expenses: true,
          revenues: true,
        },
      });

      res.status(201).send({ success: true, response });
    } catch (error: any) {
      console.log(error);
      res.status(500).send({ error: "Ocorreu um erro ao criar a conta." });
    }
  },

  async updateBill(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;
      const { balance, description } = req.body;

      const billExists = await prisma.tb_bill.findFirst({
        where: { id: parseInt(id), deleted_at: null },
      });

      if (!billExists || billExists.deleted_at !== null) {
        return res.status(404).send({ error: "Conta não encontrada." });
      }

      const response = await prisma.tb_bill.update({
        where: { id: parseInt(id) },
        data: {
          balance,
          description,
          author: { connect: { id: userData?.id } },
        },
        include: {
          author: { select: userWithoutPassword },
          expenses: true,
          revenues: true,
        },
      });

      res.status(200).send({ success: true, response });
    } catch (error: any) {
      console.log(error?.response?.data);
      res.status(500).send({ error: "Ocorreu um erro ao atualizar a conta." });
    }
  },

  async deleteBill(req: CustomRequest, res: Response) {
    const { userData } = req;
    const { id } = req.params;

    const billExists = await prisma.tb_bill.findFirst({
      where: { id: parseInt(id), id_author: userData?.id },
    });

    if (!billExists || billExists.deleted_at !== null) {
      return res.status(404).send({ error: "Conta não encontrada." });
    }

    // SE TIVER RECEITAS OU DESPESAS, FALAR AO USUÁRIO QUE TODAS AS DESPESAS E RECEITAS DO MESMO SERÃO DELETADAS

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

  async getAllBills(req: CustomRequest, res: Response) {
    const { userData } = req;

    const response = await prisma.tb_bill.findMany({
      where: {
        id_author: userData?.id,
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
