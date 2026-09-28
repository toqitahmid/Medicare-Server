import { Router } from "express";
import { getPatientOverview } from "../controllers/patient.controller.js";

const patientRouter = Router();

patientRouter.route("/:email/overview").get(getPatientOverview);

export default patientRouter;
