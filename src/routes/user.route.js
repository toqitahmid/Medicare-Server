import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();
userRouter.use(verifyJWT);
userRouter.route("/getUsers").get(getUsers);

export default userRouter;