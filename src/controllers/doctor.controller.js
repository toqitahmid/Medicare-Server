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

    const query = { email: newDoctor.email };
    const updateDoc = {
        $set: newDoctor
    }

    const options = { upsert: true };

    const createNewDoctor = await doctors.updateOne(query,updateDoc,options);

    return res
        .status(201)
        .json(new ApiResponse(201, { createNewDoctor },
        "new doctor created successfully"
        ))
})

export const getDoctorByEmail = asyncHandler(async (req, res) => {
    const doctors = doctorCollections();
    const { doctorEmail } = req.params;
    if (!doctorEmail) {
        throw new ApiError(400, "Server can't find any doctor email")
    }
    const cursor = { email: doctorEmail };
    const result = await doctors.findOne(cursor);

    if (!result) {
        throw new ApiError(404, "Doctor not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { doctor: result },
        "Found the doctor"
        ))

})

export const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = doctorCollections();
    const result = await doctors.find().toArray();

    return res
        .status(200)
        .json(new ApiResponse(200, { doctors: result }, "Fetched all doctors successfully"));
})