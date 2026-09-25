import { Router } from "express";
import { postDoctors } from "../controllers/doctor.controller.js";

const doctorRouter = Router();
doctorRouter.route("/postDoctors").post(postDoctors)

export default doctorRouter;