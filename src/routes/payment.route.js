import { Router } from "express";
import { createPayment, getPaymentByPatientId, getPaymentByDoctorId } from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.route("/create").post(createPayment);
paymentRouter.route("/doctor/:docId").get(getPaymentByDoctorId);
paymentRouter.route("/:patientId").get(getPaymentByPatientId);

export default paymentRouter;
