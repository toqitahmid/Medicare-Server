import { Router } from "express";
import { getDoctorOverview } from "../controllers/doctorOverview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const doctorOverviewRouter = Router();
doctorOverviewRouter.route("/:docId/overview").get(getDoctorOverview);

export default doctorOverviewRouter;
