import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
  async createRevenue(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id_bill, balance, description, status } = req.body;

      if (!balance) {
        return res.status(400).send({ error: "Forneça um valor inicial." });
      }

      if (!description) {
        return res.status(400).send({ error: "Forneça uma descrição." });
      }

      if (!id_bill) {
        return res
          .status(400)
          .send({ error: "Você precisa selecionar uma conta." });
      }

      const response = await prisma.tb_revenue.create({
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
      console.log(error?.response?.status);
      res.status(500).send({ error: "Ocorreu um erro ao criar a receita." });
    }
  },

  async ReceiveRevenue(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;

      const revenueExists = await prisma.tb_revenue.findUnique({
        where: { id: parseInt(id) },
      });

      if (!revenueExists || revenueExists.deleted_at !== null) {
        return res.status(404).send({ error: "Receita não encontrada." });
      }

      await prisma.tb_revenue.update({
        where: { id: parseInt(id) },
        data: { status: true },
      });

      res
        .status(200)
        .send({ success: true, message: "Receita recebida com sucesso." });
    } catch (error: any) {
      console.log(error?.response?.data);
      res.status(500).send({
        error: "Ocorreu um erro ao confirmar o recebimento da despesa.",
      });
    }
  },

  async getRevenue(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;

      const revenueExists = await prisma.tb_revenue.findUnique({
        where: { id: parseInt(id) },
      });

      if (!revenueExists || revenueExists.deleted_at !== null) {
        return res.status(404).send({ error: "Receita não encontrada." });
      }

      const response = await prisma.tb_revenue.findFirst({
        where: {
          id: revenueExists.id,
          id_author: userData?.id,
          deleted_at: null,
        },
        include: {
          author: { select: userWithoutPassword },
        },
      });

      res.status(200).send({ success: true, response });
    } catch (error: any) {
      console.log(error?.response?.data);
      res.status(500).send({ error: "Ocorreu um erro ao carregar a receita." });
    }
  },

  async getAllRevenues(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;

      const response = await prisma.tb_revenue.findMany({
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
        .send({ error: "Ocorreu um erro ao carregar as receitas." });
    }
  },

  async updateRevenue(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;
      const { balance, description, status } = req.body;

      const revenueExists = await prisma.tb_revenue.findUnique({
        where: { id: parseInt(id) },
      });

      if (!revenueExists || revenueExists.deleted_at !== null) {
        return res.status(404).send({ error: "Receita não encontrada." });
      }

      const response = await prisma.tb_revenue.update({
        where: { id: parseInt(id) },
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

      res.status(200).send({ error: response });
    } catch (error: any) {
      console.log(error?.response?.data);
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao atualizar a receita." });
    }
  },

  async deleteRevenue(req: CustomRequest, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;

      const revenueExists = await prisma.tb_revenue.findFirst({
        where: { id: parseInt(id), id_author: userData?.id },
      });

      if (!revenueExists || revenueExists.deleted_at !== null) {
        return res.status(404).send({ error: "Receita não encontrada." });
      }

      await prisma.tb_revenue.update({
        where: { id: revenueExists.id },
        data: {
          deleted_at: new Date(),
        },
      });

      res
        .status(200)
        .send({ success: true, message: "Receita excluída com sucesso." });
    } catch (error: any) {
      console.log(error.message);
      res.status(500).send({ error: "Ocorreu um erro ao excluir a receita." });
    }
  },
};
