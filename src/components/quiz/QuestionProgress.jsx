// components/QuestionProgress.jsx
import { MdCheck, MdClose } from "react-icons/md";

// const QuestionProgress = ({ currentQuestionIndex, questions }) => {
const QuestionProgress = ({
  currentQuestionIndex,
  questions,
  skippedQuestions = [],
}) => {
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="questionProgress">
      <div className="stepCircles">
        {questions.map((_, index) => {
          let icon = index + 1;
          if (skippedQuestions.includes(index)) icon = <MdClose size={20} />;
          else if (index < currentQuestionIndex) icon = <MdCheck size={20} />;

          return (
            <div
              key={index}
              className={`stepCircle ${
                index === currentQuestionIndex
                  ? "current"
                  : index < currentQuestionIndex
                  ? "completed"
                  : skippedQuestions.includes(index)
                  ? "skipped"
                  : ""
              }`}
            >
              {icon}
            </div>
          );
        })}
      </div>
      <div className="progressBarContainer">
        <div className="progressBar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="progressText">
        <span style={{ color: "#1E88E5" }}>{Math.round(progress)}% Done</span> -
        Keep going!
      </div>
    </div>
  );
};

export default QuestionProgress;
