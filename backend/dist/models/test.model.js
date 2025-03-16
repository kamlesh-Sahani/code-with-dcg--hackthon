import mongoose, { Schema } from "mongoose";
import { nanoid } from "nanoid";
const QuestionSetSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    questions: [
        {
            id: { type: String, required: true, default: () => nanoid() },
            type: {
                type: String,
                required: true,
                enum: ["MCQ", "FILL_IN_THE_BLANKS", "QUESTION_ANSWER"],
            },
            questionText: { type: String, required: true },
            options: { type: [String], default: undefined },
            correctAnswer: { type: Schema.Types.Mixed, default: undefined },
        },
    ],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const QuestionSetModel = mongoose.models.QuestionSet ||
    mongoose.model("QuestionSet", QuestionSetSchema);
export default QuestionSetModel;
