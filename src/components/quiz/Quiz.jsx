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
        const setRef = ref(db, `attachedQuestionSets/${selectedQuizSet}`);
        const setSnapshot = await get(setRef);
        if (setSnapshot.exists()) {
          const setData = setSnapshot.val();
          console.log("setData", setData);
          const questionIds = Object.keys(setData);
          console.log("questionIds", questionIds);
          const fetchQuestions = questionIds.map(async (id) => {
            const order = setData[id]?.order || 0;
            const [singleSnap, multiSnap] = await Promise.all([
              get(ref(db, `questions/${id}`)),
              get(ref(db, `multiQuestions/${id}`)),
            ]);
            if (singleSnap.exists()) {
              return {
                id,
                order,
                ...singleSnap.val(),
              };
            } else if (multiSnap.exists()) {
              return {
                id,
                order,
                ...multiSnap.val(),
              };
            } else {
              return null;
            }
          });
          const questionResults = await Promise.all(fetchQuestions);
          // Filter out nulls and sort by order
          const loadedQuestions = questionResults
            .filter((q) => q !== null)
            .sort((a, b) => a.order - b.order);
          console.log("loadedQuestions", loadedQuestions);
          setQuestions(loadedQuestions);
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
      console.log("Gemini response:", resultText);
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
  // const isAnswerCorrect = (userAnswer, correctAnswer) => {
  //   return fallbackVerification(userAnswer, correctAnswer);
  // };

  const isAnswerCorrect = (userAnswer, correctAnswer, options) => {
  if (!options || !Array.isArray(options)) {
    return fallbackVerification(userAnswer, correctAnswer);
  }
  const labelToValue = {};
  options.forEach((option, index) => {
    const label = String.fromCharCode(65 + index);
    labelToValue[label] = typeof option === 'string' ? option : option.text;
  });
  const correctLabel = correctAnswer?.toString().trim().toUpperCase();
  const expectedValue = labelToValue[correctLabel];
  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  const normalizedExpectedValue = normalizeAnswer(expectedValue);
  return normalizedUserAnswer === normalizedExpectedValue;
};
  const [showAnswerError, setShowAnswerError] = useState(false);
  const handleNextClick = () => {
    const currentAnswer = selectedAnswers[currentQuestionIndex];
    const isEmptyAnswer =
      !isTriviaQuestion &&
      (
        currentAnswer === undefined ||
        currentAnswer === null ||
        (typeof currentAnswer === "string" && currentAnswer.trim() === "") ||
        (Array.isArray(currentAnswer) && currentAnswer.every(ans => typeof ans !== "string" || ans.trim() === ""))
      );
    if (isEmptyAnswer) {
      setShowAnswerError(true);
      return;
    }
    setShowAnswerError(false);
    handleNextQuestion();
  };

  const handleNextQuestion = async () => {
    setShowAnswerError(false);
    const currentAnswer = selectedAnswers[currentQuestionIndex];
    const currentQuestion = questions[currentQuestionIndex];
    console.log("Current Question Index:", currentQuestionIndex);
    console.log("Current Question:", currentQuestion);
    console.log("Current Answer:", currentAnswer);
    if (!currentAnswer && currentQuestion.type !== "TRIVIA") return;
    setVerifying(true);
    try {
      let isCorrect = false;
      let explanation = "";
      let updatedResponses = [...userResponses];
      if (currentQuestion.mainQuestion && Array.isArray(currentQuestion.subQuestions)) {
        console.log("Handling sub-questions...");
        // Check if all sub-question answers are filled
        const allAnswered = currentQuestion.subQuestions.every((sub, i) => {
          const userAns = currentAnswer?.[i];
          return userAns !== undefined && userAns !== null && userAns !== "";
        });
        if (!allAnswered) {
          setShowAnswerError(true);
          setVerifying(false);
          return;
        }
        const subResults = await Promise.all(
          currentQuestion.subQuestions.map(async (sub, i) => {
            const userAns = currentAnswer?.[i];
            const correctAns = sub.correctAnswer;
            console.log(`Sub-question ${i + 1}:`, sub);
            console.log(`User Answer:`, userAns);
            console.log(`Correct Answer:`, correctAns);
            if (sub.type === "FILL_IN_THE_BLANKS") {
              const result = await verifyAnswerWithGemini(
                sub.question,
                correctAns,
                userAns
              );
              console.log(`Verification Result for FILL_IN_THE_BLANKS [${sub.id}]:`, result);
              return {
                questionId: sub.id,
                userAnswer: userAns,
                correctAnswer: correctAns,
                isCorrect: result.isCorrect,
                explanation: result.explanation,
                type: sub.type,
              };
            } else if (sub.type === "MCQ") {
              // const isCorrectMCQ = isAnswerCorrect(userAns, correctAns);
              const isCorrectMCQ = isAnswerCorrect(
    userAns,
    sub.correctAnswer,
    sub.options
  );
              console.log(`Verification Result for MCQ [${sub.id}]:`, {
                isCorrect: isCorrectMCQ
              });
              return {
                questionId: sub.id,
                userAnswer: userAns,
                correctAnswer: correctAns,
                isCorrect: isCorrectMCQ,
                explanation: "",
                type: sub.type,
              };
            }
          })
        );
        console.log("Sub-question Results:", subResults);
        updatedResponses[currentQuestionIndex] = subResults;
        setUserResponses(updatedResponses);
      } else {
        console.log("Handling main question...");
        if (currentQuestion.type === "FILL_IN_THE_BLANKS" && currentAnswer) {
          const result = await verifyAnswerWithGemini(
            currentQuestion.question,
            currentQuestion.correctAnswer,
            currentAnswer
          );
          console.log("Verification Result for FILL_IN_THE_BLANKS:", result);
          isCorrect = result.isCorrect;
          explanation = result.explanation;
        } else if (currentQuestion.type === "MCQ" && currentAnswer) {
          // isCorrect = isAnswerCorrect(currentAnswer, currentQuestion.correctAnswer);
          isCorrect = isAnswerCorrect(
    currentAnswer,
    currentQuestion.correctAnswer,
    currentQuestion.options
  );
          console.log("MCQ Answer Check:", {
            userAnswer: currentAnswer,
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect,
          });
        } else if (currentQuestion.type === "TRIVIA") {
          isCorrect = null;
          console.log("Trivia question, skipping answer check.");
        }
        updatedResponses[currentQuestionIndex] = {
          questionId: currentQuestion.id,
          userAnswer: currentAnswer || "(Skipped)",
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect,
          type: currentQuestion.type,
          explanation,
        };
        console.log("Updated User Response for main question:", updatedResponses[currentQuestionIndex]);
        setUserResponses(updatedResponses);
      }
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        console.log("Moving to next question index:", currentQuestionIndex + 1);
      } else {
        const finalResponses = [...updatedResponses];
        console.log("Quiz complete. Final user responses:", finalResponses);
        handleQuizComplete(finalResponses);  // ✅ Pass latest updated responses
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
    const validResponses = responses.flat().filter(
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

const handleQuizComplete = async (responses) => { // 'responses' is the array of user response objects
  try {
    console.log("Final responses received in handleQuizComplete", responses);

    // 1. Calculate results using the processed responses
    const results = calculateResults(responses);
    console.log("Calculated results", results);

    // 2. Update state for UI
    setQuizResults(results);
    setQuizCompleted(true);

    // 3. Save results to Firebase
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && currentSet) {
      // Reference to the user's quiz sets (for removal)
      const userQuizSetsRef = ref(db, `users/${user.uid}/assignedSets`);

      // 4. Sanitize responses for saving to Firebase
      //    - Flatten potential multi-question arrays
      //    - Filter out null/invalid items
      //    - Ensure no undefined values are passed to Firebase
      const filteredResponses = responses
        .flatMap((r) => (Array.isArray(r) ? r : [r])) // Flatten if nested arrays exist (multi-questions)
        .filter((r) => r !== null && typeof r === "object" && r.questionId) // Filter valid objects with ID
        .map((r) => {
          // Create a new object, explicitly defining fields and providing fallbacks for undefined
          return {
            questionId: r.questionId ?? null,
            correctAnswer: r.correctAnswer ?? null, // Ensure correctAnswer is not undefined
            userAnswer: r.userAnswer ?? null,       // Ensure userAnswer is not undefined
            type: r.type ?? null,
            question: r.question ?? null,           // Include if available
            options: Array.isArray(r.options) ? r.options : [], // Ensure array
            isCorrect: r.isCorrect ?? false,        // Ensure boolean
            skipped: r.skipped ?? false,            // Ensure boolean if used
            explanation: r.explanation ?? "",       // Ensure string if used
            // Add any other expected keys from 'r' with appropriate fallbacks
            // Example: subQuestions: Array.isArray(r.subQuestions) ? r.subQuestions : [],
          };
        });

      console.log("Sanitized filteredResponses ready for saving:", filteredResponses);

      // 5. Save quiz results to Firebase
      const resultsRef = ref(db, `users/${user.uid}/quizResults/${currentSet}`);
      await set(resultsRef, {
        completedAt: new Date().toISOString(),
        score: results.score,
        correctAnswers: results.correctAnswers,
        totalQuestions: results.totalQuestions,
        selectedSet: currentSet,
        responses: filteredResponses, // Save the sanitized responses
      });

      // 6. Remove the completed quiz set from user's available sets
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
    // Optionally, show an error message to the user
    setError("Failed to save quiz results. Please try again.");
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

  const toggleAnswer = (index, subIndex = null) => {
    setShownAnswers(prev => {
      const currentShown = { ...prev };
      if (subIndex !== null) {
        const subShown = currentShown[index]?.[subIndex] ?? false;
        return {
          ...prev,
          [index]: {
            ...(prev[index] || {}),
            [subIndex]: !subShown
          }
        };
      } else {
        return {
          ...prev,
          [index]: !prev[index]
        };
      }
    });
    const response = userResponses[index];
    const question = questions[index];
    if (subIndex !== null) {
      if (!shownAnswers?.[index]?.[subIndex] && !explanations?.[index]?.[subIndex]) {
        const subQuestionText = question.subQuestions[subIndex].question;
        const correctAnswer = question.subQuestions[subIndex].correctAnswer;
        const userAnswer = Array.isArray(response.userAnswer)
          ? response.userAnswer[subIndex] ?? "(Skipped)"
          : "(Skipped)";
        const fullQuestion = `${question.mainQuestion || question.question} - ${subQuestionText}`;
        fetchExplanation(fullQuestion, correctAnswer, userAnswer, index, subIndex);
      }
    } else {
      if (!shownAnswers?.[index] && !explanations?.[index]) {
        fetchExplanation(
          question.question,
          response.correctAnswer,
          response.userAnswer === "(Skipped)" ? "No answer provided by the user." : response.userAnswer,
          index
        );
      }
    }
  };
  

  const fetchExplanation = async (question, correctAnswer, userAnswer, index, subIndex = null) => {
    try {
      const result = await verifyAnswerWithGemini(
        question,
        correctAnswer,
        userAnswer === "(Skipped)" ? "No answer provided by the user." : userAnswer
      );
      setExplanations(prev => {
        const newState = { ...prev };
        if (subIndex !== null) {
          newState[index] = newState[index] || {};
          newState[index][subIndex] = result.explanation || "No explanation provided.";
        } else {
          newState[index] = result.explanation || "No explanation provided.";
        }
        return newState;
      });
    } catch (error) {
      console.error("Failed to fetch explanation:", error);
      setExplanations(prev => {
        const newState = { ...prev };
        if (subIndex !== null) {
          newState[index] = newState[index] || {};
          newState[index][subIndex] = "Error fetching explanation.";
        } else {
          newState[index] = "Error fetching explanation.";
        }
        return newState;
      });
    }
  };

  if (quizCompleted && quizResults) {
    // --- START OF CORRECTED SECTION ---
    const renderQuestionReview = () => {
        const nonTriviaResponses = quizResults.responses.filter(r => r.type !== "TRIVIA");
        const totalNonTrivia = nonTriviaResponses.length;

        return quizResults.responses.map((response, index) => {
            // Use response.questionId as the key if available, otherwise fallback to index
            const key = response.questionId || `response-${index}`;
            
            const question = questions.find((q) => q.id === response.questionId) || questions[index];
            
            let isCorrect = false;
            let isSkipped = false;
            
            if (Array.isArray(response)) {
                const allCorrect = response.every(r => r.isCorrect);
                const allSkipped = response.every(r => r.skipped);
                const anyIncorrect = response.some(r => !r.isCorrect && !r.skipped);
                if (allCorrect) {
                    isCorrect = true;
                } else if (allSkipped) {
                    isSkipped = true;
                } else if (anyIncorrect) {
                    isCorrect = false;
                    isSkipped = false;
                }
            } else {
                isCorrect = response.isCorrect;
                isSkipped = response.skipped;
            }
            
            const isTrivia = response.type === "TRIVIA";
            
            // Calculate the visible index for non-trivia questions
            const visibleIndex = quizResults.responses
                .slice(0, index + 1)
                .filter(r => r.type !== "TRIVIA").length;

            const hasSubQuestions = question?.subQuestions && question.subQuestions.length > 0;

            return (
                <div
                    key={key} // --- KEY ADDED HERE ---
                    className={`question-container ${isCorrect ? "correct" : isSkipped ? "skipped" : "incorrect"}`}
                >
                    {/* Header */}
                    <div className="question-header">
                        <div>
                            {!isTrivia && (
                                <span className="question-number">
                                    Question {visibleIndex} of {totalNonTrivia}
                                </span>
                            )}
                            <div className="category-name">
                                {question?.type === "TRIVIA" ? "Trivia" : "Category Name"}
                            </div>
                        </div>
                        {!isTrivia && (
                            <div className={`answer-status ${isCorrect ? "correct" : isSkipped ? "skipped" : "incorrect"}`}>
                                <span className={`status-icon ${isCorrect ? "correct" : isSkipped ? "skipped" : "incorrect"}`}>
                                    {isCorrect ? <FaCheck /> : isSkipped ? <IoPlaySkipForward /> : <FaTimes />}
                                </span>
                                {isCorrect ? "Correct Answer" : isSkipped ? "Skipped" : "Incorrect Answer"}
                            </div>
                        )}
                    </div>
                    {/* Main Question Text */}
                    <div className="question-body">
                        {question?.mainQuestion && (
                            <div className="main-question">
                                <p dangerouslySetInnerHTML={{ __html: question.mainQuestion }}></p>
                            </div>
                        )}
                        {/* Sub-Questions Rendering */}
                        {hasSubQuestions ? (
                            question.subQuestions.map((subQ, subIndex) => {
                                const userAns = response?.[subIndex]?.userAnswer || "(Skipped)";
                                const explanation = explanations[index]?.[subIndex] || "";
                                const show = shownAnswers?.[index]?.[subIndex] || false;
                                return (
                                    <div key={subIndex} className="sub-question">
                                        <div className="quiz-line"></div>
                                        <p dangerouslySetInnerHTML={{ __html: subQ.question }}></p>
                                        <div className="answer-section">
                                            <p>
                                                <strong>Your Answer:</strong>{" "}
                                                <span className="user-answer">{userAns}</span>
                                            </p>
                                        </div>
                                        <div className="correct-answer-row">
                                            <p className="correct-answer-box1">
                                                <strong className="label">Correct Answer:</strong>{" "}
                                                <span className="answer-text">
                                                    {Array.isArray(subQ.correctAnswer)
                                                        ? subQ.correctAnswer.join(", ")
                                                        : subQ.correctAnswer}
                                                </span>
                                            </p>
                                            <button
                                                className={`show-answer-button ${show ? 'active' : ''}`}
                                                onClick={() => toggleAnswer(index, subIndex)}
                                            >
                                                {show ? (
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
                                        {show && (
                                            <div className="explanation">
                                                {!explanation ? (
                                                    <p>⏳ Loading explanation...</p>
                                                ) : (
                                                    explanation.split('\n').filter(Boolean).map((line, idx) => (
                                                        <p key={idx}>{line}</p>
                                                    ))
                                                )}
                                                <p className="final-answer">
                                                    ✅ <strong>Final Answer:</strong>{" "}
                                                    {Array.isArray(subQ.correctAnswer)
                                                        ? subQ.correctAnswer.join(", ")
                                                        : subQ.correctAnswer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            // Single Question Block
                            <>
                                <div className="question-content">
                                    <p dangerouslySetInnerHTML={{ __html: question?.question }}></p>
                                </div>
                                {!isTrivia && (
                                    <>
                                        <div className="quiz-line"></div>
                                        <div className="answer-section">
                                            <p>
                                                <strong>Your Answer:</strong>{" "}
                                                <span className="user-answer">
                                                    {response.userAnswer || "—"}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="correct-answer-row">
                                            <p className="correct-answer-box1">
                                                <strong className="label">Correct Answer:</strong>{" "}
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
                                        {shownAnswers[index] && (
                                            <div className="explanation">
                                                {!explanations[index] ? (
                                                    <p>⏳ Loading explanation...</p>
                                                ) : (
                                                    explanations[index].split('\n').filter(Boolean).map((line, idx) => (
                                                        <p key={idx}>{line}</p>
                                                    ))
                                                )}
                                                <p className="final-answer">
                                                    ✅ <strong>Final Answer:</strong>{" "}
                                                    {Array.isArray(response.correctAnswer)
                                                        ? response.correctAnswer.join(", ")
                                                        : typeof response.correctAnswer === "object" && response.correctAnswer.text
                                                            ? response.correctAnswer.text
                                                            : response.correctAnswer}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        });
    };
    // --- END OF CORRECTED SECTION ---

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
            {/* Render the question review items */}
            {renderQuestionReview()}
          </div>
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

  // Called when answering a sub-question
  const handleSubQuestionAnswerSelect = (option, subIndex) => {
    const newAnswers = [...(selectedAnswers[currentQuestionIndex] || [])];
    newAnswers[subIndex] = option;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: newAnswers,
    });
  };

  const handleSubQuestionTextAnswer = (e, subIndex) => {
    const value = e.target.value;
    const updatedAnswers = [...(selectedAnswers[currentQuestionIndex] || [])];
    updatedAnswers[subIndex] = value;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: updatedAnswers,
    });
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
          {!isTriviaQuestion && (
            <div className="questionNumberStyled">
              <MdHelpOutline size={24} className="questionIcon" />
              <span>Question No: {displayQuestionIndex + 1}</span>
            </div>
          )}
          {currentQuestion.mainQuestion ? (
            <div className="multiQuestionContainer">
              <h2 className="questionText">
                {isHTML(currentQuestion.mainQuestion)
                  ? parse(currentQuestion.mainQuestion)
                  : currentQuestion.mainQuestion}
              </h2>
              {currentQuestion.subQuestions?.map((sub, index) => (
                <div key={index} className="subQuestionBlock">
                  <div className="subQuestionText">
                    {isHTML(sub.question) ? parse(sub.question) : sub.question}
                  </div>
                  {sub.type === "MCQ" && Array.isArray(sub.options) && (
                    <ul className="optionsList">
                      {sub.options.map((opt, optIndex) => {
                        const isSelected =
                          selectedAnswers[currentQuestionIndex]?.[index] === opt;
                        return (
                          <li
                            key={optIndex}
                            className={`optionItem ${isSelected ? "selected" : ""}`}
                            onClick={() => handleSubQuestionAnswerSelect(opt, index)}
                          >
                            <span className="optionText">{opt}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {sub.type === "FILL_IN_THE_BLANKS" && (
                    <div className="fillBlankContainer">
                      <input
                        type="text"
                        placeholder="Type your answer here"
                        value={selectedAnswers[currentQuestionIndex]?.[index] || ""}
                        onChange={(e) => handleSubQuestionTextAnswer(e, index)}
                        className="fillBlankInput"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <h2 className="questionText">
              {isTriviaQuestion && <span className="triviaTag">Trivia</span>}
              <br />
              {isHTML(currentQuestion.question)
                ? parse(currentQuestion.question)
                : currentQuestion.question}
            </h2>
          )}
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