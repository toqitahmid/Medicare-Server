import { Router } from "express";
import { getDoctorOverview } from "../controllers/doctorOverview.controller.js";

const doctorOverviewRouter = Router();

doctorOverviewRouter.route("/:docId/overview").get(getDoctorOverview);

export default doctorOverviewRouter;
