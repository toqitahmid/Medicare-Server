import { Router } from "express";
import { createPrescription, getPrescriptionsByPatientId } from "../controllers/prescription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const prescriptionRouter = Router();
prescriptionRouter.use(verifyJWT);

prescriptionRouter.route("/create").post(createPrescription);
prescriptionRouter.route("/patient/:patientId").get(getPrescriptionsByPatientId);

export default prescriptionRouter;
