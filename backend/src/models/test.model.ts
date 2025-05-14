import mongoose, { Schema, model, Document } from "mongoose";
import { nanoid } from "nanoid";

export interface IQuestion {
  id: string;
  type: "MCQ" | "FILL_IN_THE_BLANKS" | "QUESTION_ANSWER";
  questionText: string;
  options?: string[];
  correctAnswer?: string | string[];
}

export interface IQuestionSet extends Document {
  title: string;
  description: string;
  difficulty: string;
  questions: IQuestion[];
  isDeleted?: boolean;
  interviewId:string;
  createdAt?: Date;
  updatedAt?: Date;
  score:number;
  isCompleted:boolean;
}

const QuestionSetSchema = new Schema<IQuestionSet>(
  {
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
        correctAnswer: { type: Schema.Types.Mixed, default: undefined ,select:false},
      },
    
    ],
    score:Number,
    interviewId:{
      type:String,
    },
    isCompleted:{
      type:Boolean,
      default:false
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const QuestionSetModel =
  mongoose.models.QuestionSet ||
  mongoose.model<IQuestionSet>("QuestionSet", QuestionSetSchema);

export default QuestionSetModel;
