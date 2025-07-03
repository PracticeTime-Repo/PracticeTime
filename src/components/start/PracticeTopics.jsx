import { useState } from "react";
import "./PracticeTopics.css";
import { FaChevronRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { TbMathSymbols } from "react-icons/tb";
import { LuCodeXml } from "react-icons/lu";
import { RiEnglishInput } from "react-icons/ri";

const topicsData = {
  Maths: [
    {
      id: 1,
      title: "Number Systems",
      color: "yellow",
      description:
        "Counting objects, inside and outside, longer and shorter, letter names, rhyming words and more.",
    },
    {
      id: 2,
      title: "Operations",
      color: "red",
      description:
        "Counting objects, inside and outside, longer and shorter, letter names, rhyming words and more.",
    },
    {
      id: 3,
      title: "Shapes & Geometry",
      color: "green",
      description:
        "Counting objects, inside and outside, longer and shorter, letter names, rhyming words and more.Counting objects, inside and outside, longer and shorter, letter names, rhyming words and more.",
    },
  ],
  English: [
    {
      id: 4,
      title: "Vocabulary",
      color: "blue",
      description: "Practice common words, synonyms, antonyms, and more.",
    },
    {
      id: 5,
      title: "Grammar",
      color: "purple",
      description:
        "Learn sentence structure, tenses, punctuation, and grammar rules.",
    },
  ],
  Coding: [
    {
      id: 6,
      title: "JavaScript Basics",
      color: "teal",
      description: "Learn variables, loops, functions, and basic syntax.",
    },
    {
      id: 7,
      title: "React Essentials",
      color: "cyan",
      description: "Understand components, state, props, and JSX.",
    },
  ],
};

export default function PracticeTopics() {
  const subjectIcons = {
    Maths: <TbMathSymbols className="subject-icon" />,
    English: <RiEnglishInput className="subject-icon icon3" />,
    Coding: <LuCodeXml className="subject-icon" />,
  };
  const [selectedSubject, setSelectedSubject] = useState("Maths");

  const handleClose = () => setSelectedSubject(null);

  return (
    <div className="container">
      <div className="practice-wrapper">
        <div className="topic-header">
          <div className="topic-header-content">
          <h1>
            Select Practice <span className="highlighted">Topic!</span>
          </h1>
          <p>Pick a topic you want to practice and get better at it.</p>
          </div>
          <div className="divider-line"></div>
          <div className="tab-bar">
            {["Maths", "English", "Coding"].map((subject) => (
              <button
                key={subject}
                className={`tab ${
                  selectedSubject === subject ? "selected" : ""
                }`}
                onClick={() => setSelectedSubject(subject)}
              >
                {/* {selectedSubject === subject && (
                  <IoClose className="close-icon" onClick={handleClose} />
                )} */}
                {/* {subject} */}
                {subjectIcons[subject]}
                <span className="subject-label">{subject}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedSubject && (
          <div className="topic-list">
            {topicsData[selectedSubject].map((topic, idx) => (
              <div key={topic.id} className={`topic-card bg-${topic.color}`}>
                <div className="topic-left">
                  <div className={`topic-label bg-${topic.color}`}>
                    <div className={`topic-icon icon-${topic.color}`}>
                      {["I", "II", "III", "IV", "V", "VI"][idx]}
                    </div>
                    <span className="topic-title">{topic.title}</span>
                  </div>
                </div>
                <div className="topic-center">
                  <div className="topic-desc">{topic.description}</div>
                </div>
                <div className="topic-right">
                  <span className="green-circle" />
                  <span className="skill-text">20+ Skills Available</span>
                  <FaChevronRight
                    className={`arrow-icon arrow-icon-${topic.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
