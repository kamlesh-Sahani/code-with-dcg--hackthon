import express from "express";
import { createQuestionSet, addQuestionToSet, getAllQuestionSets, deleteQuestionSet, deleteQuestionFromSet } from "../controllers/test.controller.js";
const router = express.Router();
router.post("/create", createQuestionSet);
router.post("/new/:id", addQuestionToSet);
router.get("/get", getAllQuestionSets);
router.delete("/delete/:id", deleteQuestionSet);
router.delete("/:testId/delete-question/:questionId", deleteQuestionFromSet);
export default router;
