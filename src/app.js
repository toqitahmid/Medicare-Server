import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

import userRouter from "./routes/user.route.js";
import doctorRouter from "./routes/doctor.route.js";
import appointmentRouter from "./routes/appointment.route.js";
import paymentRouter from "./routes/payment.route.js";
import prescriptionRouter from "./routes/prescription.route.js";
import reviewRouter from "./routes/review.route.js";
import patientRouter from "./routes/patient.route.js";
import doctorOverviewRouter from "./routes/doctorOverview.route.js";
import adminOverviewRouter from "./routes/adminOverview.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/appointments", appointmentRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/prescriptions", prescriptionRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/patient", patientRouter);
app.use("/api/v1/doctor-overview", doctorOverviewRouter);
app.use("/api/v1/admin-overview", adminOverviewRouter);

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error", error: err });
});

export default app;
