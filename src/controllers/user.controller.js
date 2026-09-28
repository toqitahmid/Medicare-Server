import asyncHandler from "../utils/asyncHandler.js"

export const getUsers = asyncHandler(async (req, res) => {
    return res.json("we are from controller")
})