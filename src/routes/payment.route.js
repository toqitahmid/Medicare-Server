import { Router } from "express";
import { createPayment } from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.route("/create").post(createPayment);

export default paymentRouter;
