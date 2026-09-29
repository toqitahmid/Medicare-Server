import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";

const userRouter = Router();
userRouter.route("/getUsers").get(getUsers);

export default userRouter;