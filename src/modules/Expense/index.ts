import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export = {
    // async createExpense(req: Request, res: Response){
    //     const { userData } = req;
    //     const { value, description, status } = req.body;

    //     if (!value || !description)
    //       return res
    //         .status(400)
    //         .send({ error: "Forneça todos os dados necessários" });

    //     const response = await prisma.tb_expenses.create({
    //         data: {
    //             value,
    //             description,
    //             status: status ? false,
    //             tb_user: { connect: { id: userData.id } },
    //         },
    //         include: {
    //             tb_user: true,
    //         }
    //     });

    //     response.author = response.tb_user;

    //     res.status(201).send({ success: true, response })
    // },
}