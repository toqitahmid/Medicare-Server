import { appointmentCollections, paymentCollections, doctorCollections } from "../db/indexDB.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getPatientOverview = asyncHandler(async (req, res) => {
    const { email } = req.params;

    if (!email) {
        throw new ApiError(400, "Patient email is required");
    }

    // 1. Fetch all appointments for the patient
    const appointmentsCursor = { patientId: email };
    const appointments = await appointmentCollections().find(appointmentsCursor).toArray();

    // 2. Fetch all payments for the patient
    const paymentsCursor = { patientId: email };
    const payments = await paymentCollections().find(paymentsCursor).toArray();

    // Calculate total spent
    const totalPaymentsAmount = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    // 3. Fetch top reviewed doctors (fetching a few doctors to show in the favourite/top doctors section)
    // You could later sort by ratings if rating data exists
    const topDoctors = await doctorCollections().find({}).limit(4).toArray();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    appointments,
                    payments,
                    totalPaymentsAmount,
                    topDoctors,
                },
                "Successfully fetched patient overview"
            )
        );
});
