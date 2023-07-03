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

      if (!balance) {
        return res.status(400).send({ error: "Forneça um valor inicial." });
      }

      if (!description) {
        return res.status(400).send({ error: "Forneça uma descrição." });
      }

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

      if (!balance) {
        return res.status(400).send({ error: "Forneça um valor inicial." });
      }

      if (!description) {
        return res.status(400).send({ error: "Forneça uma descrição." });
      }

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
      console.log(error?.response);
      res.status(500).send({ error: "Ocorreu um erro ao atualizar a conta." });
    }
  },

  async deleteBill(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;

      const notDeleted = {
        deleted_at: null,
      };

      const billExists = await prisma.tb_bill.findFirst({
        where: { id: parseInt(id), id_author: userData?.id },
        include: {
          expenses: { where: notDeleted },
          revenues: { where: notDeleted },
        },
      });

      if (!billExists || billExists.deleted_at !== null) {
        return res.status(404).send({ error: "Conta não encontrada." });
      }

      await prisma.tb_expense.updateMany({
        where: { id_bill: billExists?.id },
        data: {
          deleted_at: new Date(),
        },
      });

      await prisma.tb_revenue.updateMany({
        where: { id_bill: billExists?.id },
        data: {
          deleted_at: new Date(),
        },
      });

      await prisma.tb_bill.update({
        where: { id: billExists?.id },
        data: {
          deleted_at: new Date(),
        },
      });

      res
        .status(200)
        .send({ success: true, message: "A conta foi excluída com sucesso." });
    } catch (error: any) {
      console.log(error);
      res.status(500).send({ error: "Ocorreu um erro ao excluir a conta." });
    }
  },

  async getAllBills(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;

      const notDeleted = {
        deleted_at: null,
      };

      const response = await prisma.tb_bill.findMany({
        where: {
          id_author: userData?.id,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
        include: {
          author: { select: userWithoutPassword },
          expenses: { where: notDeleted },
          revenues: { where: notDeleted },
        },
      });

      res.status(200).send({ success: true, response });
    } catch (error: any) {
      console.log(error);
      res.status(500).send({ error: "Ocorreu um erro ao carregar as contas." });
    }
  },
};
