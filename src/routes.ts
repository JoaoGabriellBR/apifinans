import { Router } from "express";

import User from "./modules/User";
import Bill from "./modules/Bill";
import Expense from "./modules/Expense";
import Revenue from "./modules/Revenue";

import decodeUserToken from "./middlewares";

const routes = Router();

// USER

routes.post("/user/create", User.createUser);
routes.get("/user/get/:id", User.getUser);
routes.patch("/user/update/:id", User.updateUser);
routes.patch("/user/delete/:id", User.deleteUser);
routes.patch("/user/change-password", User.changePassword);
routes.post("/login", User.login);

// BILLS

routes.post("/bill/create", Bill.createBill);
// routes.get("/bill/get/:id", Bill.getBill);
routes.get("/bill/get", Bill.getAllBills);
routes.patch("/bill/update/:id", Bill.updateBill);
routes.patch("/bill/delete/:id", Bill.deleteBill);

// EXPENSES

routes.post("/expense/create", Expense.createExpense);
routes.patch("/pay-expense/:id", Expense.payExpense);
routes.get("/expense/get/:id", Expense.getExpense);
routes.get("/expense/get", Expense.getAllExpenses);
routes.patch("/expense/update/:id", Expense.updateExpense);
routes.patch("/expense/delete/:id", Expense.deleteExpense);

// REVENUES

routes.post("/revenue/create", Revenue.createRevenue);
routes.get("/revenue/get/:id", Revenue.getRevenue);
routes.get("/revenue/get", Revenue.getAllRevenues);
routes.patch("/revenue/update/:id", Revenue.updateRevenue);
routes.patch("/revenue/delete/:id", Revenue.deleteRevenue);

export default routes;

