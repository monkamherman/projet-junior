import express from "express";
import auth from "./auth.routes";
import userRoute from "./user.routes";

export default function registerRoutes(app: express.Application) {
  app.use("/api/auth", auth);
  app.use("/api/user", userRoute);
}
