import { Router } from "express";
import { createReview, getAllReviews } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const reviewRouter = Router();
reviewRouter.route("/all").get(getAllReviews);
reviewRouter.route("/create").post(verifyJWT, createReview);

export default reviewRouter;
