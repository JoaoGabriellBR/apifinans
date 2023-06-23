import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

const prisma = new PrismaClient();

const secret = process.env.AUTH_SECRET;

const userWithoutPasssword = {
  id: true,
  name: true,
  email: true,
  password: false,
};

interface CustomRequest extends Request {
  userData: any;
}

export = {
  async createUser(req: Request, res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .send({ error: "Envie todos os dados solicitados!" });

    const emailExists = await prisma.tb_user.findFirst({
      where: { email: email },
    });

    if (emailExists)
      return res
        .status(400)
        .send({ error: "O e-mail fornecido já está cadastrado!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const response = await prisma.tb_user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: userWithoutPasssword,
    });

    res.status(201).json(response);
  },

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email } = req.body;

    const userExists = await prisma.tb_user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!userExists)
      return res.status(404).send({ error: "Usuário não encontrado!" });

    const response = await prisma.tb_user.update({
      where: { id: userExists.id },
      data: {
        name,
        email,
      },
      select: userWithoutPasssword,
    });

    res.status(200).json(response);
  },

  async getUser(req: Request, res: Response) {
    const { id } = req.params;

    const userExists = await prisma.tb_user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!userExists || userExists.deleted_at !== null)
      return res.status(404).send({ error: "Usuário não encontrado!" });

    const response = await prisma.tb_user.findUnique({
      where: { id: userExists.id },
      select: userWithoutPasssword,
    });

    res.status(200).json(response);
  },

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;

    const userExists = await prisma.tb_user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!userExists)
      return res.status(404).send({ error: "Usuário não encontrado!" });
    if (userExists.deleted_at !== null)
      return res.status(400).send({ error: "Este usuário já foi excluído!" });

    await prisma.tb_user.update({
      where: { id: userExists.id },
      data: {
        deleted_at: new Date(),
      },
    });

    res.status(200).send({ success: "Usuário excluído com sucesso!" });
  },

  async changePassword(req: Request, res: Response) {
    const { userData } = req as CustomRequest;
    const { oldPassword, newPassword } = req.body;

    const userExists = await prisma.tb_user.findUnique({
      where: { id: userData?.id },
    });

    if (!userExists || userExists.deleted_at !== null)
      return res.status(404).send({ error: "Usuário não encontrado!" });

    if (!(await bcrypt.compare(oldPassword, userExists.password)))
      return res.status(400).send({ error: "Senha incorreta!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.tb_user.update({
      where: { id: userExists.id },
      data: {
        password: hashedPassword,
      },
      select: {
        password: false,
      },
    });

    res.status(200).send({ success: "Senha atualizada com sucesso!" });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if(!email || !password){
      return res.status(400).send({ error: "Preencha todos os campos vazios." })
    }

    const user = await prisma.tb_user.findFirst({
      where: { email },
    });

    if (!user || user.deleted_at !== null)
      return res.status(401).send({ error: "Usuário não encontrado!" });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).send({ error: "Senha incorreta!" });

    const userWithoutPasssword = await prisma.tb_user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        password: false,
      },
    });

    const token = jwt.sign({ ...user }, secret as Secret);
    res.status(200).send({ token, user: userWithoutPasssword });
  },
};
