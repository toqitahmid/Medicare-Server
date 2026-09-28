import { reviewCollections } from "../db/indexDB.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res) => {
    const reviews = reviewCollections();

    const {
        patientId,
        doctorId,
        rating,
        comment,
        doctorName,
        patientName
    } = req.body;

    if (!patientId || !doctorId || !rating || !comment) {
        throw new ApiError(400, "Missing required fields for review");
    }

    const newReview = {
        patientId,
        doctorId,
        doctorName: doctorName || "Doctor",
        patientName: patientName || "Patient",
        rating: Number(rating),
        comment,
        createdAt: new Date(),
    };

    const result = await reviews.insertOne(newReview);

    if (!result.insertedId) {
        throw new ApiError(500, "Failed to create review");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { review: result }, "Review created successfully"));
});
