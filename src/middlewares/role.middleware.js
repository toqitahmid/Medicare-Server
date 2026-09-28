import { ApiError } from "../utils/apiError.js";

export const requireRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return next(new ApiError(401, "User or role not found"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, "Access denied. Insufficient permissions."));
        }

        next();
    };
};
