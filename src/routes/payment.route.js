import { Router } from "express";
import { createPayment, getPaymentByPatientId } from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.route("/create").post(createPayment);
paymentRouter.route("/:patientId").get(getPaymentByPatientId);

export default paymentRouter;
