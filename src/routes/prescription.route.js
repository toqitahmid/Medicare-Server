import { Router } from "express";
import { createPrescription, getPrescriptionsByPatientId } from "../controllers/prescription.controller.js";

const prescriptionRouter = Router();

prescriptionRouter.route("/create").post(createPrescription);
prescriptionRouter.route("/patient/:patientId").get(getPrescriptionsByPatientId);

export default prescriptionRouter;
