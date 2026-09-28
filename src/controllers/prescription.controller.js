import { prescriptionCollections } from "../db/indexDB.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPrescription = asyncHandler(async (req, res) => {
    const prescriptions = prescriptionCollections();

    const {
        doctorId,
        patientId,
        doctorName,
        patientName,
        appointmentId,
        diagnosis,
        medications,
        notes
    } = req.body;

    if (!doctorId || !patientId || !appointmentId || !diagnosis || !medications) {
        throw new ApiError(400, "Missing required fields for prescription");
    }

    const newPrescription = {
        doctorId,
        patientId,
        doctorName,
        patientName,
        appointmentId,
        diagnosis,
        medications,
        notes: notes || "",
        createdAt: new Date(),
    };

    const result = await prescriptions.insertOne(newPrescription);

    if (!result.insertedId) {
        throw new ApiError(500, "Failed to create prescription");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { prescription: result }, "Prescription created successfully"));
});

export const getPrescriptionsByPatientId = asyncHandler(async (req, res) => {
    const prescriptions = prescriptionCollections();
    const { patientId } = req.params;

    console.log(`[API] Fetching prescriptions for patientId:`, patientId);

    if (!patientId) {
        throw new ApiError(400, "Patient ID is required");
    }

    const patientPrescriptions = await prescriptions.find({ patientId }).toArray();

    console.log(`[API] Found ${patientPrescriptions.length} prescriptions for ${patientId}`);

    return res
        .status(200)
        .json(new ApiResponse(200, { prescriptions: patientPrescriptions }, "Prescriptions retrieved successfully"));
});
