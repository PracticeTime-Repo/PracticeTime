import React, { useState, useEffect } from "react";
import "./Quiz.css";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import firebaseServices from "../firebase/firebaseSetup";
import practiceTime from "../../assets/practiceTime.jpg";
import parse from "html-react-parser";
import { MdCheck } from "react-icons/md";
import QuestionProgress from "./QuestionProgress";
import { MdHelpOutline } from "react-icons/md";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import cloud from "./cloud.png";
import exicted from "./exicted.png";
import emoji1 from "./emoji1.png";
import emoji2 from "./emoji2.png";
import emoji3 from "./emoji3.png";
import emoji4 from "./emoji4.png";
import emoji5 from "./emoji5.png";
import { FaCheck, FaTimes } from "react-icons/fa";
import { IoPlaySkipForward } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// import SignupImage from "./SignupImage.png";

const Quiz = () => {
  const { auth, provider, db, ref, set, get, child } = firebaseServices;

  // Get selectedQuizSet from localStorage instead of router state
  const [selectedQuizSet, setSelectedQuizSet] = useState(null);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentSet, setCurrentSet] = useState(null);
  const [userResponses, setUserResponses] = useState([]);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [shownAnswers, setShownAnswers] = useState({});
  const [explanations, setExplanations] = useState({});


  //gemini api key
  const GEMINI_API_KEY = "AIzaSyAhC4gJXrvbM7UOTPBiu_a3qHl7TG83MPU";

  // Get quiz set from localStorage on component mount
  useEffect(() => {
    const storedQuizSet = localStorage.getItem("selectedQuizSet");
    console.log("storedQuizSet", storedQuizSet)
    if (storedQuizSet) {
      setSelectedQuizSet(storedQuizSet);
    } else {
      setError("No quiz set selected");
    }
  }, []);

  useEffect(() => {
    // In your fetchQuizData function, modify it to get the order field:

    const fetchQuizData = async () => {
      try {
        if (!selectedQuizSet) {
          return; // Wait until selectedQuizSet is loaded
        }

        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setError("User not authenticated");
          return;
        }

        // Set the current quiz set
        setCurrentSet(selectedQuizSet);

        // Fetch question IDs for this specific set
        const setRef = ref(db, `attachedQuestionSets/${selectedQuizSet}`);
        const setSnapshot = await get(setRef);

        if (setSnapshot.exists()) {
          const setData = setSnapshot.val();
          // Extract question IDs from the set data
          const questionIds = Object.keys(setData);

          // Fetch each question with their order information
          const questionPromises = questionIds.map((id) =>
            get(ref(db, `questions/${id}`)).then((snap) => {
              // Get the order from the set data
              const order = setData[id]?.order || 0;

              return {
                snapshot: snap,
                order: order,
                id: id,
              };
            })
          );

          const questionResults = await Promise.all(questionPromises);

          // Filter out questions that don't exist and sort by order
          const loadedQuestions = questionResults
            .filter((result) => result.snapshot.exists())
            .map((result) => ({
              id: result.id,
              order: result.order,
              ...result.snapshot.val(),
            }))
            .sort((a, b) => a.order - b.order); // Sort by the order field
          console.log('loadedQuestions', loadedQuestions);

          setQuestions(loadedQuestions);

          // Initialize empty user responses array
          setUserResponses(new Array(loadedQuestions.length).fill(null));
        } else {
          setError(`No questions found in set: ${selectedQuizSet}`);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setError(`Error loading quiz: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [selectedQuizSet, db]);

  // Enhanced normalization function
  const normalizeAnswer = (answer) => {
    if (answer === null || answer === undefined) return "";

    // Convert to string, trim whitespace, and convert to lowercase
    let normalized = String(answer).trim().toLowerCase();

    // Remove extra spaces, punctuation and special characters
    normalized = normalized.replace(/\s+/g, " ");
    normalized = normalized.replace(/[.,;:!?'"()\[\]{}]/g, "");

    // Handle numeric values (e.g., "1" and 1 should match)
    if (!isNaN(normalized) && !isNaN(parseFloat(normalized))) {
      normalized = parseFloat(normalized).toString();
    }

    // Common word replacements for numbers
    const numberWords = {
      zero: "0",
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      ten: "10",
      eleven: "11",
      twelve: "12",
      thirteen: "13",
      fourteen: "14",
      fifteen: "15",
      sixteen: "16",
      seventeen: "17",
      eighteen: "18",
      nineteen: "19",
      twenty: "20",
    };

    // Check if the answer is a number word and replace it
    if (numberWords[normalized]) {
      normalized = numberWords[normalized];
    }

    return normalized;
  };

  // Enhanced fallback verification with better normalization
  const fallbackVerification = (userAnswer, correctAnswer) => {
    console.log("Using fallback verification method");

    // Normalize user answer
    const normalizedUserAnswer = normalizeAnswer(userAnswer);

    // Handle different ways correctAnswer might be stored
    if (typeof correctAnswer === "string") {
      return normalizedUserAnswer === normalizeAnswer(correctAnswer);
    } else if (Array.isArray(correctAnswer)) {
      // Check if any of the correct answers match
      return correctAnswer.some(
        (answer) => normalizedUserAnswer === normalizeAnswer(answer)
      );
    } else if (
      correctAnswer &&
      typeof correctAnswer === "object" &&
      correctAnswer.text
    ) {
      return normalizedUserAnswer === normalizeAnswer(correctAnswer.text);
    }

    return false;
  };

  // Enhanced verification function with better prompt engineering and fallback handling
  const verifyAnswerWithGemini = async (
    question,
    correctAnswer,
    userAnswer
  ) => {
    if (!GEMINI_API_KEY) {
      console.error("Gemini API key is missing");
      return { isCorrect: false, explanation: "API key missing" };
    }

    try {
      console.log("Verifying answer with Gemini:");
      console.log("Question:", question);
      console.log("Correct answer:", correctAnswer);
      console.log("User answer:", userAnswer);

      let formattedCorrectAnswer = correctAnswer;
      if (Array.isArray(correctAnswer)) {
        formattedCorrectAnswer = correctAnswer.join(" OR ");
      } else if (typeof correctAnswer === "object" && correctAnswer.text) {
        formattedCorrectAnswer = correctAnswer.text;
      }

      const prompt = `
You are a quiz evaluator.

Question: "${question}"
Correct answer: "${formattedCorrectAnswer}"
User's answer: "${userAnswer || "The user skipped the question."}"

Instructions:
1. Determine whether the user's answer is correct or incorrect based on meaning (not exact text).
2. Even if skipped, assume the user doesn't know and explain the correct answer anyway.
3. Provide a clear and **step-by-step explanation** for the correct answer.
4. Respond in the format:
Verdict: correct/incorrect
Explanation:
...
...
...
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        return {
          isCorrect: fallbackVerification(userAnswer, correctAnswer),
          explanation: "Failed to fetch explanation from Gemini.",
        };
      }

      const data = await response.json();
      const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        console.error("Empty Gemini response");
        return {
          isCorrect: fallbackVerification(userAnswer, correctAnswer),
          explanation: "No explanation received from Gemini.",
        };
      }

      console.log("Gemini response:\n", resultText);

      const verdictMatch = resultText.match(/Verdict:\s*(correct|incorrect)/i);
      const explanationMatch = resultText.match(/Explanation:\s*([\s\S]*)/i); // Match multiline explanation

      const verdict = verdictMatch ? verdictMatch[1].toLowerCase() : null;
      const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provided.";

      return {
        isCorrect: verdict === "correct",
        explanation,
      };

    } catch (error) {
      console.error("Error verifying with Gemini:", error);
      return {
        isCorrect: fallbackVerification(userAnswer, correctAnswer),
        explanation: "Error while contacting Gemini.",
      };
    }
  };


  // Legacy answer verification function (kept for backward compatibility)
  const isAnswerCorrect = (userAnswer, correctAnswer) => {
    return fallbackVerification(userAnswer, correctAnswer);
  };
  const [showAnswerError, setShowAnswerError] = useState(false);

  const handleNextClick = () => {
    if (
      !isTriviaQuestion &&
      (!selectedAnswers[currentQuestionIndex] ||
        selectedAnswers[currentQuestionIndex].trim() === "")
    ) {
      setShowAnswerError(true);
      return;
    }

    setShowAnswerError(false);
    // If it's the last question, confirm before proceeding
    // const isLastQuestion = currentQuestionIndex === questions.length - 1;

    // if (isLastQuestion) {
    // const confirmSubmit = window.confirm("Are you sure you want to complete the quiz?");
    // if (!confirmSubmit) return;
    // }
    handleNextQuestion();
  };

  const handleNextQuestion = async () => {
    setShowAnswerError(false);
    const currentAnswer = selectedAnswers[currentQuestionIndex];
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentAnswer && currentQuestion.type !== "TRIVIA") {
      return; // Prevent proceeding without an answer for non-trivia questions
    }

    // Set verifying state to show loading indicator
    setVerifying(true);

    try {
      // Check answer using Gemini for text answers
      let isCorrect = false;
      let explanation = "";
      // if (currentQuestion.type === "FILL_IN_THE_BLANKS" && currentAnswer) {
      //   console.log("Verifying fill-in-the-blanks answer");

      //   isCorrect = await verifyAnswerWithGemini(
      //     currentQuestion.question,
      //     currentQuestion.correctAnswer,
      //     currentAnswer
      //   );

      //   console.log(
      //     "Final verification result:",
      //     isCorrect ? "Correct" : "Incorrect"
      //   );
      // } 
      if (currentQuestion.type === "FILL_IN_THE_BLANKS" && currentAnswer) {
        console.log("Verifying fill-in-the-blanks answer");

        const result = await verifyAnswerWithGemini(
          currentQuestion.question,
          currentQuestion.correctAnswer,
          currentAnswer
        );

        isCorrect = result.isCorrect;
        explanation = result.explanation;

        console.log("Final verification result:", isCorrect ? "Correct" : "Incorrect");
        console.log("Explanation:", explanation);
      }

      else if (currentQuestion.type === "MCQ" && currentAnswer) {
        // For MCQ, use regular comparison
        isCorrect = isAnswerCorrect(
          currentAnswer,
          currentQuestion.correctAnswer
        );
      } else if (currentQuestion.type === "TRIVIA") {
        // Trivia questions are just for information, no correct/incorrect
        isCorrect = null;
      }

      // Save the current answer to user responses
      const updatedResponses = [...userResponses];
      updatedResponses[currentQuestionIndex] = {
        questionId: currentQuestion.id,
        userAnswer: currentAnswer || "(Skipped)",
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: isCorrect,
        type: currentQuestion.type,
        explanation: explanation,
      };

      setUserResponses(updatedResponses);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Handle quiz completion
        handleQuizComplete(updatedResponses);
      }
    } catch (error) {
      console.error("Error processing answer:", error);
      setError("There was a problem processing your answer. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSkipQuestion = () => {
    setShowAnswerError(false);
    const currentQuestion = questions[currentQuestionIndex];

    // Avoid duplicate entries in skippedQuestions
    if (!skippedQuestions.includes(currentQuestionIndex)) {
      setSkippedQuestions((prev) => [...prev, currentQuestionIndex]);
    }

    // Save the skipped question response
    const updatedResponses = [...userResponses];
    updatedResponses[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      userAnswer: "(Skipped)",
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: false,
      skipped: true,
      type: currentQuestion.type,
    };

    setUserResponses(updatedResponses);

    // Move to the next question or finish the quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleQuizComplete(updatedResponses); // Trigger end of quiz
    }
  };

  const calculateResults = (responses) => {
    // Filter out any null responses and trivia questions
    const validResponses = responses.filter(
      (response) => response !== null && response.type !== "TRIVIA"
    );

    // Count only non-trivia questions for scoring
    const totalQuestions = validResponses.length;
    const correctAnswers = validResponses.filter(
      (response) => response.isCorrect
    ).length;
    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    let performance;
    if (score >= 90) performance = "Excellent";
    else if (score >= 75) performance = "Good";
    else if (score >= 60) performance = "Satisfactory";
    else performance = "Needs Improvement";

    return {
      totalQuestions,
      correctAnswers,
      score,
      performance,
      responses: responses.filter((r) => r !== null), // Include all non-null responses including trivia
    };
  };

  const handleQuizComplete = async (responses) => {
    try {
      console.log("final responses", responses);

      // Calculate the results
      const results = calculateResults(responses);
      console.log("results", results);

      setQuizResults(results);
      setQuizCompleted(true);

      // Save the user's responses to Firebase
      const auth = getAuth();
      const user = auth.currentUser;

      if (user && currentSet) {
        // Reference to the user's quiz sets
        const userQuizSetsRef = ref(db, `users/${user.uid}/assignedSets`);

        // Ensure responses do not contain undefined values
        const filteredResponses = responses
          .filter((r) => r !== null) // Remove null responses
          .map((r) => ({
            ...r,
            correctAnswer: r.correctAnswer ?? null, // Replace undefined with null
            selectedAnswer: r.selectedAnswer ?? null, // Replace undefined with null
          }));

        // Save quiz results
        const resultsRef = ref(
          db,
          `users/${user.uid}/quizResults/${currentSet}`
        );
        await set(resultsRef, {
          completedAt: new Date().toISOString(),
          score: results.score,
          correctAnswers: results.correctAnswers,
          totalQuestions: results.totalQuestions,
          selectedSet: currentSet,
          responses: filteredResponses,
        });

        // Remove the completed quiz set from user's available sets
        const availableSetsSnapshot = await get(userQuizSetsRef);
        if (availableSetsSnapshot.exists()) {
          const availableSets = availableSetsSnapshot.val();

          // Remove the current set from available sets
          delete availableSets[currentSet];

          // Update the available sets
          await set(userQuizSetsRef, availableSets);
        }

        console.log("Quiz completed, results saved, and set removed!", results);
      }
    } catch (error) {
      console.error("Error saving quiz results and removing set:", error);
    }
  };

  const handleAnswerSelect = (option) => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.type === "MCQ") {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestionIndex]: option,
      });
    }
  };

  const handleTextAnswer = (event) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: event.target.value,
    });
  };

  const handleBackToHome = () => {
    // Use global navigate function from window object
    if (window.appNavigate) {
      window.appNavigate("start");
    }
  };
  const isHTML = (str) => {
    return /<[^>]+>/.test(str);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="quizContainer">
          <div className="loaderContainer">
            <div className="loader"></div>
            <p>Loading quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="quizContainer">
          <div className="errorContainer">
            <p className="errorMessage1">{error}</p>
            <button onClick={handleBackToHome} className="filledButton1">
              Hurray, Practice for today is Completed
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container">
        <div className="quizContainer">
          <p className="noQuestionsMessage">
            No questions found for this quiz set.
          </p>
          <button onClick={handleBackToHome} className="retryButton">
            Hurray, Practice for today is Completed
          </button>
        </div>
      </div>
    );
  }
  const getScoreDetails = (score) => {
    if (score === 100) {
      return {
        emojiImg: emoji5, // Adjust path based on your project structure
        color: "#f4b400",
        title: "Perfect! You’re A Quiz Master!",
      };
    } else if (score >= 85) {
      return {
        emojiImg: emoji4,
        color: "#4285f4",
        title: "Awesome! You’re Doing Great!",
      };
    } else if (score >= 61) {
      return {
        emojiImg: emoji3,
        color: "#34a853",
        title: "Fantastic! You Are Pushing The Limits",
      };
    } else if (score >= 36) {
      return {
        emojiImg: emoji2,
        color: "#fb8c00",
        title: "Nice! You’re Learning Fast.",
      };
    } else {
      return {
        emojiImg: emoji1,
        color: "#ea4335",
        title: "It’s Okay! Let’s Try Again.",
      };
    }
  };
  // const toggleAnswer = (index) => {
  //   setShownAnswers((prev) => ({
  //     ...prev,
  //     [index]: !prev[index],
  //   }));
  // };
  const toggleAnswer = (index) => {
    setShownAnswers(prev => ({
      ...prev,
      [index]: !prev[index],
    }));

    const response = userResponses[index];
    const question = questions[index];

    if (!shownAnswers[index] && !explanations[index]) {
      // Only fetch if explanation isn't already fetched
      fetchExplanation(question, response.correctAnswer, response.userAnswer, index);
    }
  };

  const fetchExplanation = async (question, correctAnswer, userAnswer, index) => {
    try {
      const result = await verifyAnswerWithGemini(
        question.question,
        correctAnswer,
        userAnswer === "(Skipped)" ? "No answer provided by the user." : userAnswer
      );

      setExplanations(prev => ({
        ...prev,
        [index]: result.explanation || "No explanation provided."
      }));
    } catch (error) {
      console.error("Failed to fetch explanation:", error);
      setExplanations(prev => ({
        ...prev,
        [index]: "Error fetching explanation."
      }));
    }
  };


  if (quizCompleted && quizResults) {
    return (
      <div className="container">
        <div className="quizContainer resultsContainer">
          <h1 className="resultsTitle">Quiz Results</h1>

          <div className="scoreCard">
            <div className="progressRingWrapper">
              <svg className="progressRing" width="100" height="100">
                <circle
                  className="progressBackground"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  className="progressCircle"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="282.6"
                  strokeDashoffset={282.6 - (282.6 * quizResults.score) / 100}
                  style={{ stroke: getScoreDetails(quizResults.score).color }}
                />
              </svg>

              {/* This is the center circle with the emoji */}
              <div className="emojiCenterCircle">
                <img
                  src={getScoreDetails(quizResults.score).emojiImg}
                  alt="Emoji"
                  className="emojiImage"
                />
              </div>
            </div>

            <div className="scoreDetails">
              <div
                className="scoreValue"
                style={{ color: getScoreDetails(quizResults.score).color }}
              >
                {quizResults.score}%
              </div>
              <h2 className="performanceText">
                {getScoreDetails(quizResults.score).title}
              </h2>
              <p className="scoreText">
                You answered {quizResults.correctAnswers} out of{" "}
                {quizResults.totalQuestions} questions correctly.
              </p>
            </div>
          </div>

          <div className="questionReview">
            <h2>Question Review</h2>
            {quizResults.responses
              .filter((response) => response.type !== "TRIVIA") // ⚠️ Exclude TRIVIA from total count
              .map((_, index) => (
                <></> // just mapping to calculate total count
              ))}


            {quizResults.responses.map((response, index) => {
              console.log("Question response", response);
              const question =
                questions.find((q) => q.id === response.questionId) ||
                questions[index];

              const isCorrect = response.isCorrect;
              const isSkipped = response.skipped;
              const isTrivia = response.type === "TRIVIA";
              const visibleIndex = quizResults.responses
                .filter((r, i) => i <= index && r.type !== "TRIVIA").length;


              return (
                <div
                  key={index}
                  className={`question-container ${isCorrect ? "correct" : isSkipped ? "skipped" : "incorrect"
                    }`}
                >
                  <div className="question-header">
                    <div>
                      {/* <span className="question-number">
                        Question {index + 1} of {quizResults.totalQuestions}
                      </span> */}
                      {!isTrivia && (
                        <span className="question-number">
                          Question {visibleIndex} of {
                            quizResults.responses.filter(r => r.type !== "TRIVIA").length
                          }
                        </span>
                      )}
                      <div className="category-name">
                        {question?.type === "TRIVIA" ? "Trivia" : "Category Name"}
                      </div>
                    </div>
                    {!isTrivia && (
                    <div
                      className={`answer-status ${isCorrect
                        ? "correct"
                        : isSkipped
                          ? "skipped"
                          : "incorrect"
                        }`}
                    >
                      <span
                        className={`status-icon ${isCorrect
                          ? "correct"
                          : isSkipped
                            ? "skipped"
                            : "incorrect"
                          }`}
                      >
                        {isCorrect ? (
                          <FaCheck />
                        ) : isSkipped ? (
                          <IoPlaySkipForward />
                        ) : (
                          <FaTimes />
                        )}
                      </span>
                      {isCorrect
                        ? "Correct Answer"
                        : isSkipped
                          ? "Skipped"
                          : "Incorrect Answer"}
                    </div>
                    )}
                  </div>
                  <div className="question-body">
                    <div className="question-content">
                      {/* <p>{question?.question}</p> */}
                      <p
                        dangerouslySetInnerHTML={{ __html: question?.question }}
                      ></p>
                    </div>
                     {!isTrivia && (
                    <div className="quiz-line"></div>
                    )}
                     {!isTrivia && (
                    <div className="answer-section">
                      <p>
                        <strong>Your Answer:</strong>{" "}
                        <span className="user-answer">
                          {response.userAnswer || "—"}
                        </span>
                      </p>
                    </div>
                     )}

                    {/* Conditionally show correct answer */}
                     {!isTrivia && (
                     
                    <div className="correct-answer-row">
                      <p className="correct-answer-box1">
                        <strong className="label">Correct Answer:</strong>
                        <span className="answer-text">
                          {Array.isArray(response.correctAnswer)
                            ? response.correctAnswer.join(", ")
                            : typeof response.correctAnswer === "object" && response.correctAnswer.text
                              ? response.correctAnswer.text
                              : response.correctAnswer}
                        </span>
                      </p>

                      <button
                        className={`show-answer-button ${shownAnswers[index] ? 'active' : ''}`}
                        onClick={() => toggleAnswer(index)}
                      >
                        {shownAnswers[index] ? (
                          <>
                            <FaEyeSlash size={20} style={{ marginRight: "5px" }} />
                            Hide Explanation?
                          </>
                        ) : (
                          <>
                            <FaEye size={20} style={{ marginRight: "5px" }} />
                            Show Explanation?
                          </>
                        )}
                      </button>
                    </div>
 )}
                    {shownAnswers[index] && (
                      <div className="explanation">
                        <p className="explanation-text">
                          {/* <p>🧮 Step-by-Step Solution:</p> */}
                          {!explanations[index] ? (
                            <p>⏳ Loading explanation...</p>
                          ) : (
                            explanations[index]
                              .split('\n')
                              .filter(Boolean)
                              .map((line, idx) => (
                                <p key={idx}>{line}</p>
                              ))
                          )}
                        </p>
                        {question?.type !== "TRIVIA" && (
                          <p className="final-answer">
                            ✅ <strong>Final Answer:</strong>{" "}
                            {Array.isArray(response.correctAnswer)
                              ? response.correctAnswer.join(", ")
                              : typeof response.correctAnswer === "object" &&
                                response.correctAnswer.text
                                ? response.correctAnswer.text
                                : response.correctAnswer}
                          </p>
                        )}
                      </div>
                    )}


                  </div>
                </div>
              );
            })}
          </div>
          {/* <p className="correct-answer-box">
                        <strong className="label">Correct Answer:</strong>
                        <span className="answer-text">
                          {Array.isArray(response.correctAnswer)
                            ? response.correctAnswer.join(", ")
                            : typeof response.correctAnswer === "object" &&
                              response.correctAnswer.text
                            ? response.correctAnswer.text
                            : response.correctAnswer}
                        </span>
                      </p>  */}
          {/* Show/Hide Answer Button */}
          {/* Hurray, Practice for today is Completed */}

          {/* <div className="actionButtons">
            <button onClick={handleBackToHome} className="homeButton">
              Submit
            </button>
          </div> */}
        </div>
      </div>
    );
  }
  const handlePreviousQuestion = () => {
    setShowAnswerError(false);
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      // Optionally remove from skipped list when going back
      setSkippedQuestions((prev) =>
        prev.filter((index) => index !== prevIndex)
      );
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasSelectedAnswer = selectedAnswers[currentQuestionIndex] !== undefined;
  const displayQuestionIndex =
    questions
      .slice(0, currentQuestionIndex + 1)
      .filter((q) => q.type !== "TRIVIA").length - 1;
  const isTriviaQuestion = currentQuestion.type === "TRIVIA";

  // Calculate progress percentage
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container">
      <div className="quizContainer">
        <div className="quizHeader1">
          <div className="quizIntro">
            <h1>
              Daily Quiz{" "}
              <img
                src={cloud}
                alt="quiz icon"
                style={{ width: 32, height: 32, verticalAlign: "middle" }}
                className="quiz-icon"
              />
            </h1>
            <p>
              Time to test your skills! Let’s Go!{" "}
              <img
                src={exicted}
                alt="excited icon"
                style={{ width: 20, height: 20, verticalAlign: "middle" }}
                className="excited-icon"
              />
            </p>
          </div>

          <QuestionProgress
            currentQuestionIndex={currentQuestionIndex}
            questions={questions}
            skippedQuestions={skippedQuestions}
          />
        </div>

        <div className="progressBarContainer">
          <div
            className="progressBar"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Display question image if available */}
        {currentQuestion.questionImage ? (
          <img
            src={currentQuestion.questionImage}
            alt="Question"
            className="questionImage"
          />
        ) : null}

        <div className="questionContainer">
          {/* <div className="questionNumberStyled">
            <MdHelpOutline size={24} className="questionIcon" />
            <span>Question No: {currentQuestionIndex + 1}</span>
          </div> */}
          {!isTriviaQuestion && (
            <div className="questionNumberStyled">
              <MdHelpOutline size={24} className="questionIcon" />
              <span>Question No: {displayQuestionIndex + 1}</span>
            </div>
          )}
          <h2 className="questionText">
            {isTriviaQuestion && <span className="triviaTag">Trivia</span>}
            <br />
            {isHTML(currentQuestion.question)
              ? parse(currentQuestion.question)
              : currentQuestion.question}
          </h2>


          {currentQuestion.type === "FILL_IN_THE_BLANKS" ? (
            <div className="fillBlankContainer">
              <input
                type="text"
                placeholder="Type your answer here"
                value={selectedAnswers[currentQuestionIndex] || ""}
                onChange={handleTextAnswer}
                className="fillBlankInput"
              />
            </div>
          ) : currentQuestion.type === "MCQ" ? (
            <ul className="optionsList">
              {/* Only display options that exist */}
              {currentQuestion.options &&
                currentQuestion.options
                  .filter((option) => option && option.text) // Only include valid options
                  .map((option, index) => (
                    <li
                      key={index}
                      className={`optionItem ${selectedAnswers[currentQuestionIndex] === option.text
                        ? "selected"
                        : ""
                        }`}
                      onClick={() => handleAnswerSelect(option.text)}
                    >
                      {option.image && (
                        <img
                          src={option.image}
                          alt={`Option ${index + 1}`}
                          className="optionImage"
                        />
                      )}
                      <span className="optionText">{option.text}</span>
                    </li>
                  ))}
            </ul>
          ) : (
            // Trivia display - just show the information
            <div className="triviaContainer">
              {currentQuestion.content && (
                <div className="triviaContent">
                  {isHTML(currentQuestion.content)
                    ? parse(currentQuestion.content)
                    : currentQuestion.content}
                </div>
              )}
            </div>
          )}
        </div>
        {showAnswerError && (
          <div className="errorTooltip">Please choose or fill the answer</div>
        )}
        <div className="buttonContainer">
          {/* Left side - Previous Button */}
          <div className="leftButtons">
            {currentQuestionIndex !== 0 && (
              <button
                onClick={handlePreviousQuestion}
                className="previousButton"
              >
                <MdArrowBack size={18} style={{ marginRight: 8 }} />
                Previous
              </button>
            )}
          </div>

          {/* Right side - Skip and Next Buttons */}
          <div className="rightButtons">
            {!isTriviaQuestion && (
              <button
                onClick={handleSkipQuestion}
                className="skipButton1"
                disabled={verifying}
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNextClick}
              // disabled={!isTriviaQuestion && !hasSelectedAnswer && verifying}
              disabled={!isTriviaQuestion && verifying}
              className={`filledButton ${verifying ? "verifying" : ""}`}
            >
              {verifying ? (
                "Verifying..."
              ) : isLastQuestion ? (
                <>
                  Completed{" "}
                  <MdArrowForward size={18} style={{ marginLeft: 8 }} />
                </>
              ) : (
                <>
                  Next <MdArrowForward size={18} style={{ marginLeft: 8 }} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
