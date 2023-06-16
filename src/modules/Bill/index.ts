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

  async getAllBills(req: Request, res: Response) {
    const { userData } = req;
    const { id } = req.params;

    const response = await prisma.tb_bill.findMany({
      where: {
        // author_id: userData?.id,
        author_id: parseInt(id),
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
