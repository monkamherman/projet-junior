import express from "express";
import auth from "./auth.routes";
import userRoute from "./user.routes";
import dashboardRoutes from "./dashboard";

export default function registerRoutes(app: express.Application) {
  app.use("/api/auth", auth);
  app.use("/api/user", userRoute);
  app.use("/api/dashboard", dashboardRoutes);
}
