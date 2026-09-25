import { doctorCollections } from "../db/indexDB.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const postDoctors = asyncHandler(async (req, res) => {
    const doctors = doctorCollections();

    const newDoctor = req.body;
    console.log("newDoctor: ", newDoctor);
    if (!newDoctor || Object.keys(newDoctor).length === 0) {
        throw new ApiError(400, "Server can't find any new doctor")
    }

    const createNewDoctor = await doctors.insertOne(newDoctor);

    return res
        .status(201)
        .json(new ApiResponse(201, { createNewDoctor },
        "new doctor created successfully"
        ))
})