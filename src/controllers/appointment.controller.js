import { appointmentCollections } from "../db/indexDB.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ObjectId } from "mongodb";

export const createAppointment = asyncHandler(async (req, res) => {
    const appointments = appointmentCollections();

    const {
        patientId,
        patientName,
        doctorId,
        doctorName,
        fee,
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
        patientName,
        doctorId,
        doctorName,
        fee,
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

export const getAppointmentByPatientId = asyncHandler(async (req, res) => {

    const appointments = appointmentCollections();
    const { patientEmail } = req.params;
    if (!patientEmail) {
        throw new ApiError (500, "Server can't find patient id")
    }
    const cursor = { patientId: patientEmail };
    const result = await appointments.find(cursor).toArray();

    return res
        .status(200)
        .json(new ApiResponse(200, {appointment: result}, "Successfully Fetched appointments by Patient Id"))

})

export const updatePaymentStatus = asyncHandler(async (req, res) => {
    const appointments = appointmentCollections();
    const { id } = req.params;
    
    // Convert string ID to MongoDB ObjectId
    const { ObjectId } = await import('mongodb');
    
    const result = await appointments.updateOne(
        { _id: new ObjectId(id) },
        { $set: { paymentStatus: "Paid" } }
    );
    
    if (result.modifiedCount === 0) {
        throw new ApiError(404, "Appointment not found or already paid");
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Payment status updated to Paid"));
});

export const getAppointmentByDoctorId = asyncHandler(async (req, res) => {
    const appointments = appointmentCollections();
    const { doctorId } = req.params;

    if (!doctorId) {
        throw new ApiError(400, "Server can't find doctor id");
    }

    const cursor = { doctorId: doctorId };
    const result = await appointments.find(cursor).toArray();

    return res
        .status(200)
        .json(new ApiResponse(200, { appointments: result }, "Successfully fetched appointments by Doctor Id"));
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const appointments = appointmentCollections();
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
        throw new ApiError(400, "Please provide an appointment status");
    }

    const result = await appointments.updateOne(
        { _id: new ObjectId(id) },
        { $set: { appointmentStatus: status } }
    );
    
    if (result.modifiedCount === 0) {
        throw new ApiError(404, "Appointment not found or status is already set to this value");
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, `Appointment status updated to ${status}`));
});
