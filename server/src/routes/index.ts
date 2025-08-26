import express from "express";
import user from "./route";

const app = express();


export default function registerRoutes(app: express.Application) {
    app.use('/api/user', user);
  }
  