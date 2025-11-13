import { Router } from "express";
import {
  deleteUser,
  getUser,
  updateUser,
} from "../controllers/users/creat/user";

const userRoute = Router();

userRoute.get("/:id", getUser);
userRoute.put("/:id", updateUser);
userRoute.delete("/:id", deleteUser);

export default userRoute;
