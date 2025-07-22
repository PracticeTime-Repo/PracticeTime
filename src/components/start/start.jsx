import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseServices from "../firebase/firebaseSetup";
import "./start.css";
// import practiceTime from "../../assets/practiceTime.jpg";
import startImage from "./startImage.png";
import question from "./question.png";
import topic from "./topic.png";
import star from "./star.png";
import brain from "./brain.png";
import exicted from "./exicted.png";
import { MdKeyboardArrowRight } from "react-icons/md";

const start = ({ onNavigate }) => {
  const { db, ref, get } = firebaseServices;
  // const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [dailyQuizSet, setDailyQuizSet] = useState("");
  // const [hasQuizzes, setHasQuizzes] = useState(false);
  const [user, setUser] = useState(null);
  // const [totalStars, setTotalStars] = useState(0);
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [dailyQuizSet, setDailyQuizSet] = useState(null);
  const [hasQuizzes, setHasQuizzes] = useState(false);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(true); // Reset loading when auth state changes
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAssignedQuizzes = async () => {
      try {
        if (!user) {
          setHasQuizzes(false);
          return;
        }

        const userId = user.uid;
        console.log("Fetching quizzes for user:", userId);

        const userRef = ref(db, `users/${userId}/assignedSets`);
        const snapshot = await get(userRef);

        let quizzes = [];

        if (snapshot.exists()) {
          const assignedSetsData = snapshot.val();
          console.log("Assigned sets data:", assignedSetsData);

          if (typeof assignedSetsData === "object") {
            quizzes = Object.entries(assignedSetsData)
              .map(([quizId, quizData]) => ({
                id: quizId,
                attachedAt: quizData.attachedAt || "",
              }))
              .sort((a, b) => new Date(a.attachedAt) - new Date(b.attachedAt))
              .map((item) => item.id);
          }

          console.log("Sorted quizzes by attachedAt:", quizzes);

          if (quizzes.length > 0) {
            setAssignedQuizzes(quizzes);
            setDailyQuizSet(quizzes[0]);
            setHasQuizzes(true);
          } else {
            setAssignedQuizzes([]);
            setHasQuizzes(false);
          }
        } else {
          console.log("No assigned sets found");
          setAssignedQuizzes([]);
          setHasQuizzes(true); // ✅ YOU WANT THIS TO BE TRUE
        }

        const quizResultsRef = ref(db, `users/${userId}/quizResults`);
        const quizResultsSnapshot = await get(quizResultsRef);

        if (quizResultsSnapshot.exists()) {
          const quizResults = quizResultsSnapshot.val();
          const stars = calculateTotalStars(quizResults);
          setTotalStars(stars);
          console.log("Total stars:", stars);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setHasQuizzes(false);
      } finally {
        setLoading(false);
        console.log("hasQuizzes (async state may not reflect latest):", hasQuizzes);
      }
    };

    fetchAssignedQuizzes();
  }, [user, db]);

  // Calculate total stars from quiz results
  const calculateTotalStars = (quizResults) => {
    if (!quizResults) return 0;

    return Object.values(quizResults).filter((quiz) => {
      const total = parseInt(quiz.totalQuestions) || 0;
      const correct = parseInt(quiz.correctAnswers) || 0;
      return total > 0 && (correct / total) * 100 >= 50;
    }).length;
  };

  // Function to determine the daily quiz set based on the date
  // const getDailyQuizSet = (quizzes) => {
  //   if (!quizzes || quizzes.length === 0) return "";

  //   // Use the day of the year to cycle through the quiz sets
  //   const today = new Date();
  //   const dayOfYear = Math.floor(
  //     (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  //   );

  //   // Use modulo to ensure we get a valid index in the array
  //   const dailyIndex = dayOfYear % quizzes.length;

  //   return quizzes[dailyIndex];
  // };

  const navigateToQuiz = () => {
    // Store the selected quiz set in localStorage instead of router state
    localStorage.setItem("selectedQuizSet", dailyQuizSet);

    // Use the parent component's navigation function
    if (window.appNavigate) {
      window.appNavigate("practice");
    }
  };
  const navigateToChat = () => {
    // Use the parent component's navigation function
    if (window.appNavigate) {
      window.appNavigate("chat");
    }
  };
  const navigateToTopic = () => {
    // Use the parent component's navigation function
    if (window.appNavigate) {
      window.appNavigate("PracticeTopics");
    }
  };
  if (loading) {
    return (
      <div className="container">
        <div className="quizContainer">
          <div className="loaderContainer">
            <div className="loader"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render stars with max visible stars, rows and overflow indicator
  // const StarDisplay = ({ totalStars, maxVisibleStars = 10, maxRows = 2 }) => {
  //   const starsPerRow = Math.ceil(maxVisibleStars / maxRows);
  //   const visibleStars = Math.min(totalStars, maxVisibleStars);
  //   const hiddenStars = totalStars - visibleStars;

  //   // Create rows of stars
  //   const rows = [];
  //   for (
  //     let i = 0;
  //     i < Math.min(maxRows, Math.ceil(visibleStars / starsPerRow));
  //     i++
  //   ) {
  //     const rowStars = Math.min(starsPerRow, visibleStars - i * starsPerRow);

  //     rows.push(
  //       <div key={`row-${i}`} className="stars-row">
  //         {Array.from({ length: rowStars }).map((_, index) => (
  //           <span
  //             key={index}
  //             role="img"
  //             aria-label="star"
  //             className="star-item"
  //           >
  //             ⭐
  //           </span>
  //         ))}
  //       </div>
  //     );
  //   }

  //   return (

  //     <div className="stars-container">
  //       {rows}
  //       {hiddenStars > 0 && (
  //         <div className="more-stars">+{hiddenStars} more</div>
  //       )}
  //     </div>
  //   );
  // };

  return (
    // <div className="container">
    //   <div className="quizHomeContainer">
    //     <div className="textWithArrow">
    //       <h1 className="motivationalText">
    //         <p className="motivationalLine1">
    //           the more you <span className="highlightBlue">practice!</span>
    //         </p>
    //         <p className="motivationalLine">
    //           the better you <span className="highlightBlue">become!</span>
    //         </p>
    //       </h1>

    //       <img src={arrowImage} alt="arrow" className="motivationalArrow" />
    //     </div>

    //     <img
    //       src={startImage}
    //       // onClick={() => window.appNavigate?.('home')}
    //       alt="Practice Time"
    //       className="practiceImage"
    //     />

    //     {/* Achievement Note */}
    //     <p className="starNote">
    //       <img src={star} alt="star" className="inline-icon1" />
    //       Complete quizzes with a score above <strong>50%</strong> to earn
    //       stars!
    //     </p>

    //     {/* Quiz Message */}
    //     <div>
    //       {!hasQuizzes ? (
    //         <p className="quizReadyText">
    //           Time to test your skills!{" "}
    //           <span className="highlightLink">Today quizzes are ready!</span>
    //           <img src={exicted} alt="brain" className="inline-icon" />
    //         </p>
    //       ) : (
    //         <p className="quizReadyText">
    //           You don’t have any Practice Sheet assigned yet.
    //           <img src={exicted} alt="brain" className="inline-icon" />
    //         </p>
    //       )}

    //       <div className="buttonContainer1">
    //         <button
    //           className={`startQuizButton ${hasQuizzes ? "redButton" : ""}`}
    //           onClick={navigateToQuiz}
    //           disabled={hasQuizzes}
    //         >
    //           Let’s Practice <MdKeyboardArrowRight className="startIcon" />
    //         </button>
    //       </div>
    //     </div>

    //   </div>
    // </div>
    <div className="container">
      {/* 2-column layout */}
      <div className="cardsLayout">
        {/* Left Side - Large Card */}
        <div className="leftCard">
          <div className="quizHomeContainer">
            {/* <div className="textWithArrow">
              <h1 className="motivationalText">
                <p className="motivationalLine1">
                  the more you <span className="highlightBlue">practice!</span>
                </p>
                <p className="motivationalLine">
                  the better you <span className="highlightBlue">become!</span>
                </p>
              </h1>

              <img src={arrowImage} alt="arrow" className="motivationalArrow" />
            </div> */}
            <div className="practice-header">
              <img
                src={brain}
                alt="Daily Practice"
                className="practice-brain-icon"
              />
              <h1 className="practice-title">
                <span
                  className="bold-text"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Daily
                </span>{" "}
                <span
                  className="highlight-text"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Practice!
                </span>
              </h1>
              <p className="subtitle">
                Your Daily Practice Sheet – fresh and tailored for you!
              </p>
            </div>

            <img
              src={startImage}
              // onClick={() => window.appNavigate?.('home')}
              alt="Practice Time"
              className="practiceImage"
            />

            {/* Achievement Note */}
            <p className="starNote">
              <img src={star} alt="star" className="inline-icon1" />
              Complete quizzes with a score above <strong>50%</strong> to earn
              stars!
            </p>

            {/* Quiz Message */}
            <div>
              {hasQuizzes ? (
                <p className="quizReadyText">
                  Time to test your skills!{" "}
                  <span className="highlightLink">
                    Today quizzes are ready!
                  </span>
                  <img src={exicted} alt="brain" className="inline-icon" />
                </p>
              ) : (
                <p className="quizReadyText">
                  You don’t have any Practice Sheet assigned yet.
                  <img src={exicted} alt="brain" className="inline-icon" />
                </p>
              )}

              <div className="buttonContainer1">
                <button
                  className={`startQuizButton ${!hasQuizzes ? "redButton" : ""}`}
                  onClick={navigateToQuiz}
                  disabled={!hasQuizzes}
                >
                  Let’s Practice <MdKeyboardArrowRight className="startIcon" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side - Two Stacked Cards */}
        <div className="rightCards">
          <div className="card helpCard">
            <img
              src={question}
              alt="Daily Practice"
              className="practice-brain-icon"
            />
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Ask for <span className="highlightGreen">Help!</span>
            </h1>
            <p>Upload or share a question and get hints, steps, and help.</p>
            <div className="parentContainer">
              <button className="helpButton" onClick={navigateToChat}>
                Ask a Question <MdKeyboardArrowRight className="startIcon" />
              </button>
            </div>
          </div>

          <div className="card topicCard">
            <img
              src={topic}
              alt="Daily Practice"
              className="practice-brain-icon"
            />
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Select <span className="highlightPurple">Practice Topic!</span>
            </h1>
            <p>Pick a topic you want to practice and get better at it.</p>
            <div className="parentContainer">
              <button className="topicButton" onClick={navigateToTopic}>
                Choose a Topic <MdKeyboardArrowRight className="startIcon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default start;

// <div className='homeContainer'>
//   <div className='quizHomeContainer'>
//     <img
//       src={practiceTime}
//       onClick={() => {
//         if (window.appNavigate) {
//           window.appNavigate('home');   // <-- Navigate to the Home page
//         }
//       }}
//       alt="Practice Time"
//       style={{ cursor: 'pointer' }}  // Optional: makes it look clickable
//     />
//     <h1>The more you practice, the better you become</h1>

//     {/* Stars Achievement Display */}
//     <div className="achievement-section">
//       <h2>Your Stars</h2>
//       {totalStars > 0 ? (
//         <>
//           <StarDisplay totalStars={totalStars} maxVisibleStars={20} maxRows={2} />
//           <p className="achievement-text">You've earned {totalStars} stars so far!</p>
//         </>
//       ) : (
//         <p className="achievement-text">Complete quizzes with a score above 50% to earn stars!</p>
//       )}
//     </div>

//     <hr />

//     {loading ? (
//       <div className="loadingIndicator">
//         <p>Loading your daily practice...</p>
//       </div>
//     ) : (
//       <div className='assignedQuizInfo'>
//         {hasQuizzes ? (
//           <>
//             <h2>Your daily practice is ready!</h2>
//             <button
//               onClick={navigateToQuiz}
//               className="startQuizButton"
//             >
//               Start today's practice
//             </button>
//           </>
//         ) : (
//           <div className="noQuizzesMessage">
//             <p>You don't have any PracticeSheet assigned yet.</p>
//             <button disabled className="disabledButton">Start PracticeSheet</button>
//           </div>
//         )}
//       </div>
//     )}
//   </div>
// </div>
