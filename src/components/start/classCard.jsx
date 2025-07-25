import { useState } from "react";
import "./classCard.css";
import { TbMathSymbols } from "react-icons/tb";
import { RiEnglishInput } from "react-icons/ri";
import { LuCodeXml } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa";


const subjectIcons = {
  Maths: <TbMathSymbols size={18} />,
  English: <RiEnglishInput size={18} />,
  Coding: <LuCodeXml size={18} />,
};
const subjectTopics = {
  Maths: [
    {
      id: 1,
      className: "Class 1",
      color: "#FFE39F",
      description:
        "Counting objects, inside and outside, longer and shorter, letter names, rhyming words and more.",
      skills: "20+ Skills Available",
      icon: "I",
    },
    {
      id: 2,
      className: "Class 2",
      color: "#FFCBCB",
      description: "Simple addition, subtraction, skip counting, and shapes.",
      skills: "20+ Skills Available",
      icon: "II",
    },
    {
      id: 3,
      className: "Class 3",
      color: "#FFE39F",
      description:
        "Counting objects, inside and outside, longer and shorter, letter names, rhyming words and more.Counting objects, inside and outside, longer and shorter, letter names, rhyming words and more.",
      skills: "20+ Skills Available",
      icon: "III",
    },
    {
      id: 4,
      className: "Class 4",
      color: "#FFCBCB",
      description: "Simple addition, subtraction, skip counting, and shapes.",
      skills: "20+ Skills Available",
      icon: "IV",
    },
    {
      id: 5,
      className: "Class 5",
      color: "#FFE39F",
      description:
        "Counting objects, inside and outside, longer and shorter, letter names, rhyming words and more.",
      skills: "20+ Skills Available",
      icon: "V",
    },
    {
      id: 6,
      className: "Class 6",
      color: "#FFCBCB",
      description: "Simple addition, subtraction, skip counting, and shapes.",
      skills: "20+ Skills Available",
      icon: "VI",
    },
  ],
  English: [
    {
      id: 1,
      className: "Class 1",
      color: "#CDE8E5",
      description:
        "Basic phonics, letter recognition, and simple rhyming words.",
      skills: "15+ Skills Available",
      icon: "I",
    },
    {
      id: 2,
      className: "Class 2",
      color: "#F3D5C0",
      description:
        "Reading comprehension, sight words, and sentence formation.",
      skills: "18+ Skills Available",
      icon: "II",
    },
  ],
  Coding: [
    {
      id: 1,
      className: "Class 1",
      color: "#E4C1F9",
      description: "Basic logic building using blocks, introduction to loops.",
      skills: "10+ Skills Available",
      icon: "I",
    },
    {
      id: 2,
      className: "Class 2",
      color: "#A9DEF9",
      description: "Scratch programming, events, and interactive stories.",
      skills: "12+ Skills Available",
      icon: "II",
    },
  ],
};

const ClassCard = () => {
  const [selectedSubject, setSelectedSubject] = useState("Maths");
  const subjects = Object.keys(subjectTopics);

  return (
    <div className="container">
      <div className="practice-container">
        <h2 className="title">
          Select Practice <span className="highlight">Topic!</span>
        </h2>

        <div className="subject-buttons">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`subject-btn ${
                selectedSubject === sub ? "active" : ""
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="grid-container">
          {subjectTopics[selectedSubject].map((topic) => (
            <div className="classcard" key={topic.id} style={{ "--topic-color": topic.color }}>
              <div className="class-row">
                <div
                  className="icon-circle"
                  style={{ backgroundColor: topic.color }}
                >
                  {topic.icon}
                </div>
                <span className="class-label">{topic.className}</span>
              </div>

              <p className="description">{topic.description}</p>
            <div className="skills-row">
  <div className="skills-left">
    <span className="green-circle" />
    <div className="skills">{topic.skills}</div>
  </div>
  {/* <FaArrowRight size={14} style={{ color: topic.color }} /> */}
  <FaArrowRight className="skills-arrow"  style={{ color: topic.color }} />
</div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
