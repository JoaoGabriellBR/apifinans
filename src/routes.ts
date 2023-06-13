import express from "express";
import { Router } from "express";
import User from "./modules/User";

const routes = Router();

routes.post("/user", User.createUser);
routes.get("/user/:id", User.getUser);
routes.patch("/user/:id", User.updateUser);
routes.patch("/user/delete/:id", User.deleteUser);
routes.patch("/user/change-password", User.changePassword);

export default routes;

