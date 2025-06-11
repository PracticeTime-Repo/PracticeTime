import { useState } from "react";
import emailjs from "@emailjs/browser";
import "./ContactForm1.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // or any other icons you prefer

function ContactForm() {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("Your child grade");
  const [showGradeOptions, setShowGradeOptions] = useState(false);

  const handleBoardChange = (event) => {
    setSelectedBoard(event.target.value);
  };

  const handleGradeSelectClick = () => {
    setShowGradeOptions((prev) => !prev);
  };

  const handleGradeOptionClick = (grade) => {
    setSelectedGrade(grade);
    setShowGradeOptions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const parent = document.getElementById("parent-name").value.trim();
    const child = document.getElementById("child-name").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const city = document.getElementById("city").value.trim();
    const email = document.getElementById("email").value.trim();

    if (
      !parent ||
      !child ||
      !whatsapp ||
      !email ||
      selectedBoard === "" ||
      selectedGrade === "Your child grade"
    ) {
      alert("Please fill out the complete form.");
      return;
    }

    const templateParams = {
      name: `${child} (${parent})`,
      time: new Date().toLocaleString(),
      message: "You have a new lead from the contact form.",
      child_name: child,
      parent_name: parent,
      grade: selectedGrade,
      phone: whatsapp,
      city: city,
      email: email,
      board: selectedBoard,
    };

    emailjs
      .send(
        "service_7zzlil4",
        "template_elce2r2",
        templateParams,
        "z9EUU8ILLd_CQSLgV"
      )
      .then(
        () => {
          alert("✅ Submitted! We will contact you soon.");
          document.getElementById("parent-name").value = "";
          document.getElementById("child-name").value = "";
          document.getElementById("whatsapp").value = "";
          setSelectedBoard("");
          setSelectedGrade("Your child grade");
        },
        () => {
          alert("❌ Something went wrong. Please try again later.");
        }
      );
  };

  return (
    <section className="contact-section1">
      <p className="section-description">
        Complete the form and our team will get in touch
      </p>

      <form className="contact-form-container1" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group1">
            <label className="form-label">Parent Name</label>
            <input
              type="text"
              className="form-input1"
              id="parent-name"
              placeholder="Your Name"
            />
          </div>

          <div className="form-group1">
            <label className="form-label">Child Name</label>
            <input
              type="text"
              className="form-input1"
              id="child-name"
              placeholder="Your Child Name"
            />
          </div>
        </div>

        <div className="form-group1">
          <label className="form-label">WhatsApp Number</label>
          <input
            type="tel"
            className="form-input1"
            id="whatsapp"
            placeholder="Your WhatsApp Number"
          />
        </div>
        <div className="form-group grade-group">
          <label className="form-label">
            Grade <span className="required">*</span>
          </label>
          <div
            className={`grade-select-box ${
              showGradeOptions ? "dropdown-open" : ""
            }`}
            onClick={handleGradeSelectClick}
          >
            <span>{selectedGrade}</span>
            <span className="dropdown-arrow">
              {showGradeOptions ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          {showGradeOptions && (
            <ul className="options-list">
              {[
                "Grade 1",
                "Grade 2",
                "Grade 3",
                "Grade 4",
                "Grade 5",
                "Grade 6",
                "Grade 7",
                "Grade 8",
                "Grade 9",
                "Grade 10",
              ].map((grade) => (
                <li
                  key={grade}
                  onClick={() => handleGradeOptionClick(grade)}
                  className="option-item"
                >
                  {grade}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group1">
          <label className="form-label">
            School Board <span className="required">*</span>
          </label>
          <div className="radio-group">
            {["CBSE", "ICSE", "IB", "IGCSE", "OTHERS"].map((board) => (
              <label key={board} className="radio-option">
                <input
                  type="radio"
                  name="board"
                  value={board}
                  checked={selectedBoard === board}
                  onChange={handleBoardChange}
                />
                <div className="radio-button" />
                <span className="space-grotesk-custom">{board}</span>
              </label>
            ))}
          </div>
        </div>
         <div className="form-group1">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input1"
              id="email"
              placeholder="Enter Your Email"
            />
          </div>

        <div className="form-group1">
          <label className="form-label">City</label>
          <input
            type="text"
            className="form-input1"
            id="city"
            placeholder="Enter Your city"
          />
        </div>

        <button type="submit" className="submit-button2">
          Submit!
        </button>
      </form>
    </section>
  );
}

export default ContactForm;



        {/* <div className="form-group grade-group">
          <label className="form-label">
            Grade <span className="required">*</span>
          </label>
          <div className="grade-select-box" onClick={handleGradeSelectClick}>
            <span>{selectedGrade}</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          {showGradeOptions && (
            <ul className="options-list">
              {[
                "Grade 1",
                "Grade 2",
                "Grade 3",
                "Grade 4",
                "Grade 5",
                "Grade 6",
                "Grade 7",
                "Grade 8",
                "Grade 9",
                "Grade 10",
              ].map((grade) => (
                <li
                  key={grade}
                  onClick={() => handleGradeOptionClick(grade)}
                  className="option-item"
                >
                  {grade}
                </li>
              ))}
            </ul>
          )}
        </div> */}