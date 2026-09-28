import { Router } from "express";
import { createReview, getAllReviews } from "../controllers/review.controller.js";

const reviewRouter = Router();

reviewRouter.route("/all").get(getAllReviews);
reviewRouter.route("/create").post(createReview);

export default reviewRouter;
