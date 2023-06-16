import { Router } from "express";
import User from "./modules/User";
import Bill from "./modules/Bill";
import decodeUserToken from "./middlewares";

const routes = Router();

// USER

routes.post("/user/create", User.createUser);
routes.get("/user/get/:id", User.getUser);
routes.patch("/user/update/:id", User.updateUser);
routes.patch("/user/delete/:id", User.deleteUser);
routes.patch("/user/change-password", User.changePassword);

// BILLS

routes.post("/bill/create", Bill.createBill);
// routes.get("/bill/get/:id", Bill.getBill);
routes.get("/bill/get/:id", Bill.getAllBills);
// routes.patch("/bill/update/:id", User.updateBill);
// routes.patch("/bill/delete/:id", User.deleteBill);

// EXPENSES

// routes.post("/expense/create", Expense.createExpense);
// routes.post("/pay-expense/:id", Expense.payExpense);
// routes.get("/expense/get/:id", Expense.getExpense);
// routes.get("/expense/get", Revenue.getAllExpenses)
// routes.patch("/expense/update/:id", Expense.updateExpense);
// routes.patch("/expense/delete/:id", Expense.deleteExpense);

// REVENUES

// routes.post("/revenue/create", Revenue.createBill);
// routes.get("/revenue/get/:id", Revenue.getRevenue);
// routes.get("/revenue/get", Revenue.getAllRevenues)
// routes.patch("/revenue/update/:id", Revenue.updateRevenue);
// routes.patch("/revenue/delete/:id", Revenue.deleteRevenue);

export default routes;

