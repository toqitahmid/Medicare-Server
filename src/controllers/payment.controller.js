import { paymentCollections } from "../db/indexDB.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPayment = asyncHandler(async (req, res) => {
    const payments = paymentCollections();

    const {
        appointmentId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        amount,
        transactionId,
        paymentDate
    } = req.body;

    if (!appointmentId || !patientId || !doctorId || !amount || !transactionId) {
        throw new ApiError(400, "Missing required fields for payment (appointmentId, patientId, doctorId, amount, transactionId)");
    }

    const newPayment = {
        appointmentId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        amount,
        transactionId,
        paymentDate: paymentDate || new Date(),
        createdAt: new Date(),
    };

    const result = await payments.insertOne(newPayment);

    if (!result.insertedId) {
        throw new ApiError(500, "Failed to record payment");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { payment: result }, "Payment recorded successfully"));
});

export const getPaymentByPatientId = asyncHandler(async (req, res) => {
    const payments = paymentCollections();
    const { patientId } = req.params;

    if (!patientId) {
        throw new ApiError(400, "Server can't find patient id");
    }

    const cursor = { patientId: patientId };
    const result = await payments.find(cursor).toArray();

    return res
        .status(200)
        .json(new ApiResponse(200, { payments: result }, "Successfully fetched payments by Patient Id"));
});

export const getPaymentByDoctorId = asyncHandler(async (req, res) => {
    const payments = paymentCollections();
    const { docId } = req.params;

    if (!docId) {
        throw new ApiError(400, "Server can't find doctor id");
    }

    const cursor = { doctorId: docId };
    const result = await payments.find(cursor).toArray();

    return res
        .status(200)
        .json(new ApiResponse(200, { payments: result }, "Successfully fetched payments by Doctor Id"));
});

export const getAllPayments = asyncHandler(async (req, res) => {
    const payments = paymentCollections();
    const result = await payments.find().toArray();
    
    return res
        .status(200)
        .json(new ApiResponse(200, { payments: result }, "Fetched all payments successfully"));
});
