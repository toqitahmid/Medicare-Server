import { appointmentCollections, paymentCollections, reviewCollections, doctorCollections } from "../db/indexDB.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDoctorOverview = asyncHandler(async (req, res) => {
    const { docId } = req.params;

    if (!docId) {
        throw new ApiError(400, "Doctor ID/Email is required");
    }

    // Determine the actual doctor ID to search for
    let searchDoctorId = docId;
    if (docId.includes('@')) {
        const doctor = await doctorCollections().findOne({ email: docId });
        if (doctor) {
            searchDoctorId = doctor._id.toString();
        }
    }

    // Fetch all appointments for the doctor
    const appointmentsCursor = { doctorId: searchDoctorId };
    const appointments = await appointmentCollections().find(appointmentsCursor).toArray();

    // Fetch all payments for the doctor
    const paymentsCursor = { doctorId: searchDoctorId };
    const payments = await paymentCollections().find(paymentsCursor).toArray();
    
    // Fetch reviews for the doctor (for performance/satisfaction metric)
    const reviewsCursor = { doctorId: searchDoctorId };
    const reviews = await reviewCollections().find(reviewsCursor).toArray();

    // 1. Total Patients (Unique patients from appointments)
    const uniquePatients = new Set(appointments.map(app => app.patientId));
    const totalPatients = uniquePatients.size;

    // 2. Revenue for the current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const revenueMonth = payments.reduce((sum, payment) => {
        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
        if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
            return sum + (Number(payment.amount) || 0);
        }
        return sum;
    }, 0);
    
    // Calculate total revenue as well just in case
    const totalRevenue = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    
    // Calculate average rating from reviews if any
    let averageRating = 0;
    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, rev) => sum + (Number(rev.rating) || 0), 0);
        averageRating = totalRating / reviews.length;
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    appointments,
                    payments,
                    reviews,
                    totalPatients,
                    revenueMonth,
                    totalRevenue,
                    averageRating
                },
                "Successfully fetched doctor overview"
            )
        );
});
