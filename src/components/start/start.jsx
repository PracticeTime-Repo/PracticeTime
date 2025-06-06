import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseServices from "../firebase/firebaseSetup";
import "./start.css";
import practiceTime from "../../assets/practiceTime.jpg";
import startImage from "./startImage.png";
import arrowImage from "./arrow.png";
import star from "./star.png";
import exicted from "./exicted.png";
import { MdKeyboardArrowRight } from "react-icons/md";

const start = ({ onNavigate }) => {
  const { db, ref, get } = firebaseServices;
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyQuizSet, setDailyQuizSet] = useState("");
  const [hasQuizzes, setHasQuizzes] = useState(false);
  const [user, setUser] = useState(null);
  const [totalStars, setTotalStars] = useState(0);

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

  // Fetch quizzes whenever user changes
  useEffect(() => {
    const fetchAssignedQuizzes = async () => {
      try {
        if (!user) {
          setHasQuizzes(false);
          return;
        }

        const userId = user.uid;
        console.log("Fetching quizzes for user:", userId);

        // Fetch assigned quiz sets
        const userRef = ref(db, `users/${userId}/assignedSets`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const assignedSetsData = snapshot.val();
          console.log("Assigned sets data:", assignedSetsData);

          let quizzes = [];

          // Handle different data structures
          // if (
          //   typeof assignedSetsData === "object" &&
          //   !Array.isArray(assignedSetsData)
          // ) {
          //   quizzes = Object.keys(assignedSetsData);
          // } else if (Array.isArray(assignedSetsData)) {
          //   quizzes = assignedSetsData.filter((item) => item); // Filter out null/undefined values
          // }

          // console.log("Processed quizzes:", quizzes);
          // quizzes.reverse();
          if (typeof assignedSetsData === "object") {
          quizzes = Object.entries(assignedSetsData)
            .map(([quizId, quizData]) => ({
              id: quizId,
              attachedAt: quizData.attachedAt || "", // fallback in case it's missing
            }))
            .sort((a, b) => new Date(a.attachedAt) - new Date(b.attachedAt)) // ascending order
            .map((item) => item.id);
        }
        console.log("Sorted quizzes by attachedAt:", quizzes);


          // Check if there are valid quizzes
          if (quizzes.length > 0) {
            setLoading(false);

            setAssignedQuizzes(quizzes);
            // setHasQuizzes(true);

            // Get daily quiz set based on the date
            // const dailySet = getDailyQuizSet(quizzes);
            const dailySet = quizzes[0]; 
            setDailyQuizSet(dailySet);
            console.log("Daily quiz set:", dailySet);
          } else {
            setLoading(false);

            setAssignedQuizzes([]);
            setHasQuizzes(false);
          }
        } else {
          console.log("No assigned sets found");
          setAssignedQuizzes([]);
          setLoading(false);
          // setHasQuizzes(false);
          setHasQuizzes(true);
        }

        // Fetch total stars earned
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
      }
    };

    fetchAssignedQuizzes();
  }, [user, db]); // Re-run when user or db changes

  // Function to calculate total stars from quiz results
  const calculateTotalStars = (quizResults) => {
    if (!quizResults) return 0;

    const successfulSets = Object.values(quizResults).filter((quiz) => {
      const total = parseInt(quiz.totalQuestions) || 0;
      const correct = parseInt(quiz.correctAnswers) || 0;
      return total > 0 && (correct / total) * 100 >= 50;
    }).length;

    return successfulSets;
  };

  // Function to determine the daily quiz set based on the date
  const getDailyQuizSet = (quizzes) => {
    if (!quizzes || quizzes.length === 0) return "";

    // Use the day of the year to cycle through the quiz sets
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );

    // Use modulo to ensure we get a valid index in the array
    const dailyIndex = dayOfYear % quizzes.length;

    return quizzes[dailyIndex];
  };

  const navigateToQuiz = () => {
    // Store the selected quiz set in localStorage instead of router state
    localStorage.setItem("selectedQuizSet", dailyQuizSet);

    // Use the parent component's navigation function
    if (window.appNavigate) {
      window.appNavigate("practice");
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
  const StarDisplay = ({ totalStars, maxVisibleStars = 10, maxRows = 2 }) => {
    const starsPerRow = Math.ceil(maxVisibleStars / maxRows);
    const visibleStars = Math.min(totalStars, maxVisibleStars);
    const hiddenStars = totalStars - visibleStars;

    // Create rows of stars
    const rows = [];
    for (
      let i = 0;
      i < Math.min(maxRows, Math.ceil(visibleStars / starsPerRow));
      i++
    ) {
      const rowStars = Math.min(starsPerRow, visibleStars - i * starsPerRow);

      rows.push(
        <div key={`row-${i}`} className="stars-row">
          {Array.from({ length: rowStars }).map((_, index) => (
            <span
              key={index}
              role="img"
              aria-label="star"
              className="star-item"
            >
              ⭐
            </span>
          ))}
        </div>
      );
    }

    return (

      <div className="stars-container">
        {rows}
        {hiddenStars > 0 && (
          <div className="more-stars">+{hiddenStars} more</div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="quizHomeContainer">
        <div className="textWithArrow">
          <h1 className="motivationalText">
            <p className="motivationalLine1">
              the more you <span className="highlightBlue">practice!</span>
            </p>
            <p className="motivationalLine">
              the better you <span className="highlightBlue">become!</span>
            </p>
          </h1>

          <img src={arrowImage} alt="arrow" className="motivationalArrow" />
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
          {!hasQuizzes ? (
            <p className="quizReadyText">
              Time to test your skills!{" "}
              <span className="highlightLink">Today quizzes are ready!</span>
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
              className={`startQuizButton ${hasQuizzes ? "redButton" : ""}`}
              onClick={navigateToQuiz}
              disabled={hasQuizzes}
            >
              Let’s Practice <MdKeyboardArrowRight className="startIcon" />
            </button>
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
