"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

interface submitAnserDataType {
  _id: string;
  answer: string;
}
export default function TestContainer() {
  const [role, setRole] = useState<string | null>(null);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [submitAnserData, setSubmitAnswerData] =
    useState<submitAnserDataType[]>();
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    questions: [],
  });
  const [newQuestion, setNewQuestion] = useState({
    type: "MCQ",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    fetchTests();
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = async () => {
    try {
      console.log(userAnswers,selectedTest,"user asn")
      const resp = await api.post("/test/submit-asnwer",{
        userAnswers,
        testId:selectedTest._id
      });
     if(resp.data.success){
      toast.success(resp?.data?.message || "successfully completed");
      fetchTests();
     }else{
      toast.error(resp?.data?.message || "something went worng");
     }
    } catch (error) {
      console.error(
        "Error while fetching tests:",
        error.response?.data || error.message
      );
    }
    setTestSubmitted(true);
  };
  const currentQuestion = selectedTest?.questions[currentQuestionIndex];

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer,
    });
  };

  async function handleDeleteTest(testId: string) {
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
  }

  const fetchTests = async () => {
    try {
      const resp = await api.post("/test/get", {
        interviewId: pathname.split("/").at(-1),
      });
      setTests(resp.data.data);
    } catch (error) {
      console.error(
        "Error while fetching tests:",
        error.response?.data || error.message
      );
    }
  };
  const submitAnserHandler = async () => {};

  const handleCreateTest = async () => {
    if (!newTest.title || !newTest.description) return;

    console.log(newTest, "test");
    try {
      const resp = await api.post("/test/create", {
        ...newTest,
        interviewId: pathname.split("/").at(-1),
      });

      console.log(resp.data, "postongm data");

      setTests([...tests, resp.data.data]);
      setNewTest({
        title: "",
        description: "",
        difficulty: "Easy",
        questions: [],
      });
      setShowAddTestModal(false);
    } catch (error) {
      console.error(
        "Error creating test:",
        error.response?.data || error.message
      );
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedTest) return;
    try {
      const { data } = await api.post(
        `/test/new/${selectedTest._id}`,
        newQuestion
      );
      console.log(data, "data");
      fetchTests(); // Refresh the test list
      setSelectedTest({
        ...selectedTest,
        questions: [...selectedTest.questions, newQuestion],
      });
      setNewQuestion({
        type: "MCQ",
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      });
      setShowAddQuestionModal(false);
    } catch (error) {
      console.error(
        "Error adding question:",
        error.response?.data || error.message
      );
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleStartTest = (test) => {
    setSelectedTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTestSubmitted(false);
    setScore(0);
  };

  console.log(selectedTest, "selected test");

  if (role === "company") {
    return (
      <div className="text-white p-8 w-full">
        <h1 className="text-4xl font-bold mb-8">Test Management Dashboard</h1>

        <div className="flex justify-between items-center mb-6 w-full ">
          <h2 className="text-2xl font-semibold">Available Tests</h2>
          <button
            onClick={() => setShowAddTestModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Create New Test
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <ul className="space-y-4">
              {tests.map((test, index) => (
                <li
                  key={index}
                  className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer flex justify-between items-center"
                  onClick={() => setSelectedTest(test)}
                >
                  <div>
                    <h3 className="text-xl font-medium">{test.title}</h3>
                    <p className="text-sm text-gray-300">{test.description}</p>
                    <span className="text-xs text-purple-400">
                      {test.difficulty} • {test.questions.length} questions
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
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            {selectedTest ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">
                    {selectedTest.title}
                  </h2>
                  <button
                    onClick={() => setShowAddQuestionModal(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Question
                  </button>
                </div>

                <p className="text-sm text-gray-300 mb-2">
                  {selectedTest.description}
                </p>
                <p className="text-xs text-purple-400 mb-4">
                  Difficulty: {selectedTest.difficulty}
                </p>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">
                    Questions ({selectedTest.questions.length})
                  </h4>
                  {selectedTest.questions.length > 0 ? (
                    <ul className="space-y-4">
                      {selectedTest.questions.map((q, index) => (
                        <li
                          key={q.id}
                          className="p-4 bg-gray-700 rounded-lg space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {index + 1}. {q.questionText}
                              </p>
                              <p className="text-sm text-gray-300">
                                <span className="font-semibold">Type:</span>{" "}
                                {q.type}
                              </p>
                              <p className="text-sm text-green-400">
                                <span className="font-semibold">Answer:</span>{" "}
                                {q.correctAnswer}
                              </p>

                              {q.type === "MCQ" && q.options && (
                                <div className="mt-2">
                                  <p className="font-semibold">Options:</p>
                                  <ul className="list-disc ml-6 space-y-1 text-gray-200">
                                    {q.options.map((opt, idx) => (
                                      <li key={idx}>{opt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No questions added yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Select a test to view details.</p>
            )}
          </div>
        </div>

        {/* Add Test Modal */}
        {showAddTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Create New Test</h2>

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
                  rows={3}
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

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddTestModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTest}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Question Modal */}
        {showAddQuestionModal && selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Add New Question</h2>

              <div className="space-y-4">
                <select
                  value={newQuestion.type}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      type: e.target.value,
                      options: e.target.value === "MCQ" ? ["", "", "", ""] : [],
                    })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg"
                >
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="FILL_IN_THE_BLANKS">Fill in the Blanks</option>
                </select>

                <textarea
                  placeholder="Question Text"
                  value={newQuestion.questionText}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      questionText: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg"
                  rows={3}
                />

                {newQuestion.type === "MCQ" && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Options</h4>
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

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddQuestionModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (role === "user") {
    return (
      <div className=" text-white p-4 md:p-8 w-full flex flex-col gap-5 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Available Tests
          </h1>
          <div className="grid gap-4 md:grid-cols-2">
            {tests.map((test) => (
              <div
                key={test._id}
                onClick={() => handleStartTest(test)}
                className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition"
              >
                <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
                <p className="text-gray-300 mb-3">{test.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-400">{test.difficulty}</span>
                  <span>{test.questions.length} questions</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedTest && (
          <div className="w-full lg:w-[70%] mx-auto">
            {/* Navigation Bar */}
            <div className="flex justify-between items-center mb-6 p-4 bg-gray-800 rounded-lg">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded ${
                  currentQuestionIndex === 0
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                Previous
              </button>

              <div className="text-center">
                <h1 className="text-xl font-semibold">{selectedTest.title}</h1>
                <p className="text-sm text-gray-400">
                  Question {currentQuestionIndex + 1} of{" "}
                  {selectedTest.questions.length}
                </p>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-medium mb-4">
                {currentQuestion?.questionText}
              </h2>

              {/* Answer Options */}
              {currentQuestion?.type === "MCQ" && (
                <div className="space-y-3">
                  {currentQuestion?.options?.map((option, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        handleAnswerChange(currentQuestion._id, option)
                      }
                      className={`p-3 rounded cursor-pointer transition ${
                        userAnswers[currentQuestion._id] === option
                          ? "bg-purple-600"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion?.type === "FILL_IN_THE_BLANKS" && (
                <input
                  type="text"
                  value={userAnswers[currentQuestion._id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion._id, e.target.value)
                  }
                  className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Type your answer..."
                />
              )}

              {currentQuestion?.type === "QUESTION_ANSWER" && (
                <textarea
                  value={userAnswers[currentQuestion._id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion._id, e.target.value)
                  }
                  className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Write your answer..."
                />
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded ${
                  currentQuestionIndex === 0
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                Previous Question
              </button>

              {currentQuestionIndex < selectedTest.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="text-white p-8 text-center">
      <h1 className="text-4xl font-bold mb-8">Test Portal</h1>
      <p className="text-xl">Please login to access the test portal</p>
    </div>
  );
}
