import { Router } from "express";
import { createAppointment } from "../controllers/appointment.controller.js";

const appointmentRouter = Router();

appointmentRouter.route("/create").post(createAppointment);

export default appointmentRouter;
