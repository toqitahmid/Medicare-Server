import { jwtVerify, createRemoteJWKSet } from "jose";
import { ApiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const jwksUrl = new URL(`${process.env.FRONTEND_URL || "http://localhost:3000"}/api/auth/jwks`);
const JWKS = createRemoteJWKSet(jwksUrl);

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token");
        }

        const { payload } = await jwtVerify(token, JWKS);
        
        req.user = payload;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
