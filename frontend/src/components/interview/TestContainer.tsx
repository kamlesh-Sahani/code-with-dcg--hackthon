"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function TestContainer() {
  const [selectedTest, setSelectedTest] = useState(null);
  const [tests, setTests] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    type: "MCQ",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    questions: [],
  });
  const fetchTests = async () => {
    try {
      const resp = await api.get("/test/get");
      setTests(resp.data.data);
    } catch (error) {
      console.error(
        "Error while fetching tests:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);
  const handleAddQuestion = async () => {
    if (!selectedTest) return;

    const updatedTest = {
      ...selectedTest,
      questions: [
        ...selectedTest.questions,
        { ...newQuestion, id: selectedTest.questions.length + 1 },
      ],
    };

    setSelectedTest(updatedTest);

    try {
      await api.post(`/test/new/${selectedTest._id}`, newQuestion);
      fetchTests();
    } catch (error) {
      console.error(
        "Error while updating test:",
        error.response?.data || error.message
      );
    }

    setNewQuestion({
      type: "MCQ",
      question: "",
      options: [],
      correctAnswer: "",
    });
  };

  const handleCreateTest = async () => {
    if (!newTest.title || !newTest.description) return;
    try {
      const resp = await api.post("/test/create", newTest);
      setTests([...tests, resp.data.data]);
      setNewTest({
        title: "",
        description: "",
        difficulty: "Easy",
        questions: [],
      });
    } catch (error) {
      console.error(
        "Error creating test:",
        error.response?.data || error.message
      );
    }
  };
  const handleDeleteTest = async (testId) => {
    try {
      await api.delete(`/test/delete/${testId}`);
      setTests((prevTests) => prevTests.filter((test) => test._id !== testId));
      setSelectedTest(null);
      console.log("Test deleted successfully");
    } catch (error) {
      console.error(
        "Error deleting test:",
        error.response?.data || error.message
      );
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!selectedTest) return;
    try {
      await api.delete(
        `/test/${selectedTest._id}/delete-question/${questionId}`
      );
      const updatedQuestions = selectedTest.questions.filter(
        (q) => q.id !== questionId
      );
      setSelectedTest({ ...selectedTest, questions: updatedQuestions });
    } catch (error) {
      console.error(
        "Error deleting question:",
        error.response?.data || error.message
      );
    }
  };
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };
  return (
    <div className="text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Let's Complete It</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Available Tests</h2>
          <ul className="space-y-4">
            {tests.map((test) => (
              <li
                key={test._id}
                className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer flex justify-between items-center"
                onClick={() => setSelectedTest(test)}
              >
                <div>
                  <h3 className="text-xl font-medium">{test.title}</h3>
                  <p className="text-sm text-gray-300">{test.description}</p>
                  <span className="text-xs text-purple-400">
                    {test.difficulty}
                  </span>
                </div>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTest(test._id);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Create New Test</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Test Title"
                value={newTest.title}
                onChange={(e) =>
                  setNewTest({ ...newTest, title: e.target.value })
                }
                className="w-full p-2 bg-gray-700 rounded-lg"
              />
              <textarea
                placeholder="Test Description"
                value={newTest.description}
                onChange={(e) =>
                  setNewTest({ ...newTest, description: e.target.value })
                }
                className="w-full p-2 bg-gray-700 rounded-lg"
              />
              <select
                value={newTest.difficulty}
                onChange={(e) =>
                  setNewTest({ ...newTest, difficulty: e.target.value })
                }
                className="w-full p-2 bg-gray-700 rounded-lg"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <button
                onClick={handleCreateTest}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Test Details</h2>
          {selectedTest ? (
            <div>
              <h3 className="text-xl font-medium">{selectedTest.title}</h3>
              <p className="text-sm text-gray-300 mt-2">
                {selectedTest.description}
              </p>
              <p className="text-xs text-purple-400 mt-2">
                Difficulty: {selectedTest.difficulty}
              </p>

              {/* Questions List */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Questions</h4>
                {selectedTest.questions.length > 0 ? (
                  <ul className="space-y-4">
                    {selectedTest.questions.map((q) => (
                      <li
                        key={q.id}
                        className="p-4 bg-gray-700 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{q.question}</p>
                            <p className="text-sm text-gray-300">
                              <span className="font-semibold">Type:</span>{" "}
                              {q.type}
                            </p>
                            <p className="text-sm text-green-400">
                              <span className="font-semibold">Answer:</span>{" "}
                              {q.correctAnswer}
                            </p>

                            {/* Show MCQ Options if type is MCQ */}
                            {q.type === "MCQ" && q.options && (
                              <div className="mt-2">
                                <p className="font-semibold">Options:</p>
                                <ul className="list-disc ml-6 space-y-1 text-gray-200">
                                  {q.options.map((opt, index) => (
                                    <li key={index}>{opt}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded h-fit"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No questions added yet.</p>
                )}
              </div>

              {/* Add New Question Section */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Add New Question</h4>
                <div className="space-y-4">
                  {/* Select Question Type */}
                  <select
                    value={newQuestion.type}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        type: e.target.value,
                        options:
                          e.target.value === "MCQ" ? ["", "", "", ""] : [],
                      })
                    }
                    className="w-full p-2 bg-gray-700 rounded-lg"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="FILL_IN_THE_BLANKS">
                      Fill in the Blanks
                    </option>
                    <option value="QUESTION_ANSWER">Question Answer</option>
                  </select>

                  {/* Question Text */}
                  <textarea
                    placeholder="Enter the question"
                    value={newQuestion.question}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        question: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-gray-700 rounded-lg"
                  />

                  {/* Conditionally Render MCQ Options */}
                  {newQuestion.type === "MCQ" && (
                    <div className="space-y-2">
                      <h5 className="font-semibold">Options</h5>
                      {newQuestion.options.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          className="w-full p-2 bg-gray-700 rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Correct Answer */}
                  <input
                    type="text"
                    placeholder="Correct Answer"
                    value={newQuestion.correctAnswer}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        correctAnswer: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-gray-700 rounded-lg"
                  />

                  {/* Add Question Button */}
                  <button
                    onClick={() => handleAddQuestion()}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Select a test to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
