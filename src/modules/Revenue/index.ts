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

export = {
  async createRevenue(req: Request, res: Response) {
    try {
      const { userData } = req;
      const { value, description, status } = req.body;
      const id = String(req.headers?.id_bill); // id da conta;

      if (!value || !description) {
        return res
          .status(400)
          .send({ error: "Forneça todos os dados solicitados!" });
      }

      const response = await prisma.tb_revenue.create({
        data: {
          value,
          description,
          status: !!status,
          author: { connect: { id: userData.id } },
          tb_bill: { connect: { id: parseInt(id) } },
        },
        include: { author: { select: userWithoutPassword } },
      });

      res.status(201).send({ success: true, response });
    } catch (error: any) {
      console.log(error?.response?.status);
      res.status(500).send({ error: "Ocorreu um erro ao criar a receita." });
    }
  },

  async getRevenue(req: Request, res: Response) {
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

  async getAllRevenues(req: Request, res: Response) {
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

  async updateRevenue(req: Request, res: Response) {
    try {
      const { userData } = req;
      const { id } = req.params;
      const { value, description, status } = req.body;

      const revenueExists = await prisma.tb_revenue.findUnique({
        where: { id: parseInt(id) },
      });

      if (!revenueExists || revenueExists.deleted_at !== null) {
        return res.status(404).send({ error: "Receita não encontrada." });
      }

      const response = await prisma.tb_revenue.update({
        where: { id: parseInt(id) },
        data: {
          value,
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

  async deleteRevenue(req: Request, res: Response) {
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
  },
};
