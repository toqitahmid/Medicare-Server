import { appointmentCollections } from "../db/indexDB.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createAppointment = asyncHandler(async (req, res) => {
    const appointments = appointmentCollections();

    const {
        patientId,
        doctorId,
        appointmentDate,
        appointmentTime,
        appointmentStatus,
        symptoms,
        paymentStatus
    } = req.body;

    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
        throw new ApiError(400, "Missing required fields for appointment (patientId, doctorId, appointmentDate, appointmentTime)");
    }

    const newAppointment = {
        patientId,
        doctorId,
        appointmentDate,
        appointmentTime,
        appointmentStatus: appointmentStatus || "Pending",
        symptoms: symptoms || "",
        paymentStatus: paymentStatus || "Unpaid",
        createdAt: new Date(),
    };

    const result = await appointments.insertOne(newAppointment);

    if (!result.insertedId) {
        throw new ApiError(500, "Failed to create appointment");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { appointment: result }, "Appointment created successfully"));
});
