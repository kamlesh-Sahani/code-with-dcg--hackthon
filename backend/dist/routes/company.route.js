import express from "express";
import { companyProfile, loginCompnay, newCompany } from "../controllers/company.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.post("/new", newCompany);
router.post("/login", loginCompnay);
router.get("/me", authMiddleware, companyProfile);
export default router;
