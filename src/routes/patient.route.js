import { Router } from "express";
import { getPatientOverview } from "../controllers/patient.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const patientRouter = Router();
patientRouter.use(verifyJWT);

patientRouter.route("/:email/overview").get(getPatientOverview);

export default patientRouter;
