import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import generateSecretKey from "../../utils/secretKey";

const prisma = new PrismaClient();

const secretKey = generateSecretKey(32);

const userWithoutPasssword = {
  id: true,
  name: true,
  email: true,
  password: false,
};

interface CustomRequest extends Request {
  userData?: {
    id?: number;
  };
}

export = {
  async createUser(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name) {
        return res.status(400).send({ error: "Preencha o campo de nome." });
      }

      if (!email) {
        return res.status(400).send({ error: "Preencha o campo de e-mail." });
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return res.status(400).send({ error: "Digite um e-mail válido." });
      }

      if (!password) {
        return res.status(400).send({ error: "Preencha o campo de senha." });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .send({ error: "A senha deve conter no mínimo 8 caracteres." });
      }

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
          email: email.toLowerCase(),
          password: hashedPassword,
        },
        select: userWithoutPasssword,
      });

      res.status(201).json(response);
    } catch (error: any) {
      res.status(500).send({ error: "Não foi possível criar o seu usuário." });
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return res.status(400).send({ error: "Digite um e-mail válido." });
      }

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
    } catch (error: any) {
      res
        .status(500)
        .send({ error: "Não foi possível atualizar o seu usuário." });
    }
  },

  async getMe(req: CustomRequest, res: Response) {
    const { userData } = req;

    const userExists = await prisma.tb_user.findUnique({
      where: { id: userData?.id },
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
    try {
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
    } catch (error: any) {
      res.status(500).send({ error: "Não foi possível excluir o usuário." });
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const { userData } = req as CustomRequest;
      const { oldPassword, newPassword } = req.body;

      const userExists = await prisma.tb_user.findUnique({
        where: { id: userData?.id },
      });

      if (!userExists || userExists.deleted_at !== null)
        return res.status(404).send({ error: "Usuário não encontrado!" });

      if (newPassword.length < 8) {
        return res
          .status(400)
          .send({ error: "A nova senha deve conter no mínimo 8 caracteres." });
      }

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
    } catch (error: any) {
      res.status(500).send({ error: "Não foi possível alterar a senha." });
    }
  },

  async login({ body: { email, password } }: Request, res: Response) {
    const statusError = (status: any, error: any) => {
      res.status(status).send({ error: error });
    };
    try {
      if (!email || !password)
        return statusError(400, "Preencha os campos de e-mail e senha.");

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email))
        return statusError(400, "Digite um e-mail válido.");

      const user = await prisma.tb_user.findFirst({ where: { email } });
      if (!user) return statusError(401, "Usuário não encontrado.");

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) return statusError(401, "Senha incorreta.");

      const response = await prisma.tb_user.findFirst({
        where: { email, deleted_at: null },
        select: userWithoutPasssword,
      });

      const token = jwt.sign({ ...user }, secretKey as Secret);
      res.status(200).send({ token, user: response });
    } catch (error: any) {
      return statusError(500, "Não foi possível realizar o login.");
    }
  },
};
