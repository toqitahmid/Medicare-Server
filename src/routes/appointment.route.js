import { Router } from "express";
import { createAppointment, getAppointmentByPatientId, updatePaymentStatus, getAppointmentByDoctorId, updateAppointmentStatus, getAllAppointments } from "../controllers/appointment.controller.js";

const appointmentRouter = Router();


appointmentRouter.route("/all").get(getAllAppointments);
appointmentRouter.route("/create").post(createAppointment);
appointmentRouter.route("/doctor/:doctorId").get(getAppointmentByDoctorId);
appointmentRouter.route("/:patientEmail").get(getAppointmentByPatientId);

appointmentRouter.route("/:id/pay").patch(updatePaymentStatus);
appointmentRouter.route("/:id/status").patch(updateAppointmentStatus);

export default appointmentRouter;
