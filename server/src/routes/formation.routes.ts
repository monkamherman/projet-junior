import { Router } from "express";
import {
  getFormations,
  getFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
} from "../controllers/formations/formation";

const router = Router();

router.get("/", getFormations);
router.get("/:id", getFormationById);
router.post("/", createFormation);
router.put("/:id", updateFormation);
router.delete("/:id", deleteFormation);

export default router;
