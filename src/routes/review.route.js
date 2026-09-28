import { Router } from "express";
import { createReview } from "../controllers/review.controller.js";

const reviewRouter = Router();

reviewRouter.route("/create").post(createReview);

export default reviewRouter;
