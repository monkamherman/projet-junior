import express from "express";
import auth from "./auth.routes";
import userRoute from "./user.routes";

export default function registerRoutes(app: express.Application) {
  app.use("/auth", auth);
  app.use("/user", userRoute);
}
