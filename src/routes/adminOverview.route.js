import { Router } from "express";
import { getAdminOverview } from "../controllers/adminOverview.controller.js";

const adminOverviewRouter = Router();

adminOverviewRouter.route("/overview").get(getAdminOverview);

export default adminOverviewRouter;
