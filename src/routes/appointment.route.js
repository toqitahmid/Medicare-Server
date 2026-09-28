import { Router } from "express";
import { createAppointment, getAppointmentByPatientId, updatePaymentStatus, getAppointmentByDoctorId } from "../controllers/appointment.controller.js";

const appointmentRouter = Router();

appointmentRouter.route("/create").post(createAppointment);
appointmentRouter.route("/doctor/:doctorId").get(getAppointmentByDoctorId);
appointmentRouter.route("/:patientEmail").get(getAppointmentByPatientId);

appointmentRouter.route("/:id/pay").patch(updatePaymentStatus);

export default appointmentRouter;
