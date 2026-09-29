import { Router } from "express";
import { getAdminOverview } from "../controllers/adminOverview.controller.js";
import { requireRoles } from "../middlewares/role.middleware.js";

const adminOverviewRouter = Router();

adminOverviewRouter.route("/overview").get(
    requireRoles(["admin"]),
    getAdminOverview
);

export default adminOverviewRouter;
