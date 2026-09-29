import { Router } from "express";
import { getAllDoctors, getDoctorByEmail, postDoctors } from "../controllers/doctor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const doctorRouter = Router();

doctorRouter.route("/postDoctors").post(postDoctors);
doctorRouter.route("/all").get(getAllDoctors);
doctorRouter.route("/:doctorEmail").get(getDoctorByEmail);

export default doctorRouter;
