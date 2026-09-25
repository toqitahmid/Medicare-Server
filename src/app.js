import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

import userRouter from "./routes/user.route.js"
import doctorRouter from "./routes/doctor.route.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/doctors", doctorRouter)

export default app;