import QuestionSetModel from "../models/test.model.js";
export const createQuestionSet = async (req, res) => {
    try {
        const { title, description, difficulty } = req.body;
        console.log("New Data", title, description, difficulty);
        if (!title || !description || !difficulty) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, description, difficulty.",
            });
        }
        const newQuestionSet = await QuestionSetModel.create({
            title,
            description,
            difficulty,
        });
        return res.status(201).json({
            success: true,
            message: "Question set created successfully!",
            data: newQuestionSet,
        });
    }
    catch (error) {
        console.error("Error creating question set:", error);
        return res.status(500).json({
            success: false,
            message: error.message ||
                "Something went wrong while creating the question set.",
        });
    }
};
export const addQuestionToSet = async (req, res) => {
    try {
        const { id } = req.params; // Test (question set) ID
        const { type, question, questionText, options, correctAnswer } = req.body;
        // Check if the ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test ID is required",
            });
        }
        // Validate question type
        const allowedTypes = ["MCQ", "FILL_IN_THE_BLANKS", "QUESTION_ANSWER"];
        if (!type || !allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid or missing question type. Allowed types are: ${allowedTypes.join(", ")}`,
            });
        }
        // Validate question text
        const finalQuestionText = questionText || question;
        if (!finalQuestionText) {
            return res.status(400).json({
                success: false,
                message: "Question text is required",
            });
        }
        // Find the test (question set)
        const existingSet = await QuestionSetModel.findById(id);
        if (!existingSet) {
            return res.status(404).json({
                success: false,
                message: "Test (Question Set) not found",
            });
        }
        // Create a new question object
        const newQuestion = {
            type,
            questionText: finalQuestionText,
            options: options || [],
            correctAnswer: correctAnswer ?? (type === "FILL_IN_THE_BLANKS" ? [] : ""),
        };
        // Push new question into existing test
        existingSet.questions.push(newQuestion);
        await existingSet.save();
        return res.status(200).json({
            success: true,
            message: "New question added to the test",
            data: existingSet,
        });
    }
    catch (error) {
        console.error("Error in addQuestionToSet:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
export const getAllQuestionSets = async (req, res) => {
    try {
        const questionSets = await QuestionSetModel.find({ isDeleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: "Question sets fetched successfully!",
            data: questionSets,
        });
    }
    catch (error) {
        console.error("Error fetching question sets:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong while fetching question sets.",
        });
    }
};
export const deleteQuestionSet = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Question set ID is required",
            });
        }
        const questionSet = await QuestionSetModel.findOne({
            _id: id,
            isDeleted: false,
        });
        if (!questionSet) {
            return res.status(404).json({
                success: false,
                message: "Question set not found or already deleted",
            });
        }
        questionSet.isDeleted = true;
        await questionSet.save();
        return res.status(200).json({
            success: true,
            message: "Question set deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting question set:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
export const deleteQuestionFromSet = async (req, res) => {
    try {
        const { testId, questionId } = req.params;
        console.log("Data id", testId, questionId);
        if (!testId) {
            return res.status(400).json({
                success: false,
                message: "Test ID and Question ID are required",
            });
        }
        const questionSet = await QuestionSetModel.findById(testId);
        if (!questionSet) {
            return res.status(404).json({
                success: false,
                message: "Test (Question Set) not found",
            });
        }
        const questionIndex = questionSet.questions.findIndex((q) => q._id.toString() === questionId);
        if (questionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Question not found in this test",
            });
        }
        // Remove the question
        questionSet.questions.splice(questionIndex, 1);
        await questionSet.save();
        return res.status(200).json({
            success: true,
            message: "Question deleted successfully",
            data: questionSet,
        });
    }
    catch (error) {
        console.error("Error deleting question:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
