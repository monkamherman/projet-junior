import express from "express";
import user from "./route";
import auth from "./auth.routes";
import participants from "./participants.routes";
import formations from "./formations.routes";
import formateurs from "./formateurs.routes";
import dispenses from "./dispenses.routes";
import inscriptions from "./inscriptions.routes";
import parlements from "./parlements.routes";

const app = express();


export default function registerRoutes(app: express.Application) {
    app.use('/api/user', user);
    app.use('/api/auth', auth);
    app.use('/api/participants', participants);
    app.use('/api/formations', formations);
    app.use('/api/formateurs', formateurs);
    app.use('/api/dispenses', dispenses);
    app.use('/api/inscriptions', inscriptions);
    app.use('/api/parlements', parlements);
  }
  