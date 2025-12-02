import { Router } from "express";
import {
  getFormations,
  getFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
  getUserFormations,
} from "../controllers/formations/formation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Routes publiques
router.get("/", getFormations);
router.get("/:id", getFormationById);

// Routes protégées par authentification
router.get("/mes-formations", authMiddleware, getUserFormations);
router.post("/", authMiddleware, createFormation);
router.put("/:id", authMiddleware, updateFormation);
router.delete("/:id", authMiddleware, deleteFormation);

export default router;
