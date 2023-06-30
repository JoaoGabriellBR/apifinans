import { Router } from "express";

import User from "./modules/User";
import Bill from "./modules/Bill";
import Expense from "./modules/Expense";
import Revenue from "./modules/Revenue";

import decodeUserToken from "./middlewares";

const routes = Router();

// USER
routes.post("/user/create", User.createUser);
routes.get("/user/me", decodeUserToken, User.getMe);
routes.patch("/user/update/:id", decodeUserToken, User.updateUser);
routes.patch("/user/delete/:id", decodeUserToken, User.deleteUser);
routes.patch("/user/change-password", decodeUserToken, User.changePassword);
routes.post("/login", User.login);

// BILLS

routes.post("/bill/create", decodeUserToken, Bill.createBill);
// routes.get("/bill/get/:id", Bill.getBill);
routes.get("/bill/get", decodeUserToken, Bill.getAllBills);
routes.patch("/bill/update/:id", decodeUserToken, Bill.updateBill);
routes.patch("/bill/delete/:id", decodeUserToken, Bill.deleteBill);

// EXPENSES

routes.post("/expense/create", decodeUserToken, Expense.createExpense);
routes.patch("/pay-expense/:id", decodeUserToken, Expense.payExpense);
routes.get("/expense/get/:id", decodeUserToken, Expense.getExpense);
routes.get("/expense/get", decodeUserToken, Expense.getAllExpenses);
routes.patch("/expense/update/:id", decodeUserToken, Expense.updateExpense);
routes.patch("/expense/delete/:id", decodeUserToken, Expense.deleteExpense);

// REVENUES

routes.post("/revenue/create", decodeUserToken, Revenue.createRevenue);
routes.patch("/receive-revenue/:id", decodeUserToken, Revenue.ReceiveRevenue);
routes.get("/revenue/get/:id", decodeUserToken, Revenue.getRevenue);
routes.get("/revenue/get", decodeUserToken, Revenue.getAllRevenues);
routes.patch("/revenue/update/:id", decodeUserToken, Revenue.updateRevenue);
routes.patch("/revenue/delete/:id", decodeUserToken, Revenue.deleteRevenue);

export default routes;

