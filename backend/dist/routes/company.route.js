import express from "express";
import { companyProfile, loginCompnay, newCompany } from "../controllers/company.controller.js";
const router = express.Router();
router.post("/new", newCompany);
router.post("/login", loginCompnay);
router.get("/profile", companyProfile);
export default router;
