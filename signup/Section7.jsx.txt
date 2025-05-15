// components,signup,Section7.jsx
"use client";
import React, { useState } from "react";
import styles from "./Section7.module.css";

const Section7 = () => {
  return (
    <section className={styles.section7}>
      <BackgroundSection />
      <BentoGrid />
      <DecorativeElements />
      <RegistrationForm />
      <SubjectTabs />
    </section>
  );
};

const BackgroundSection = () => {
  return (
    <div className={styles.example04}>
      <div className={styles.backgroundContainer}>
    
      
      </div>
       <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc1397f78c76fa037d62ab07629b6ea28a0c3e3f?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
          alt="Background pattern"
          className={styles.backgroundImage}
        />
    </div>
  );
};

const BentoGrid = () => {
  return (
    <div className={styles.bento}>
      <div className={styles.bentoGrid}>
        <div className={styles.column}>
          <div className={styles.columnContent}>
            <div className={styles.practiceCard}>
              <span className={styles.highlightedText}>10 Mins</span>
              <span className={styles.regularText}> of DailyPractice!</span>
            </div>
            <div className={styles.cardRow}>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/1e34bf2cb34a54080c46a50cfeeb28b245a646eb?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
                alt="Practice illustration"
                className={styles.cardImage}
              />
              <div className={styles.redCard} />
            </div>
            <div className={styles.blueCard} />
          </div>
        </div>
        <div className={styles.column2}>
          <div className={styles.columnContent2}>
            <div className={styles.greenCard} />
            <div className={styles.whiteCard}>
              <div className={styles.cardContent}>
                <h3 className={styles.quickFunReal}>Quick, Fun, Real</h3>
                <p className={styles.mathPractices}>- Math Practices!</p>
              </div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/adafb05c2252a628c0aef38a82b1f1cb4ba7f7d2?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
                alt="Math practice illustration"
                className={styles.practiceImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DecorativeElements = () => {
  return (
    <>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/6c5c468e58c9f79c5fa66674a804cca3a3122ce6?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
        alt="Decorative element"
        className={styles.decorativeImage}
      />
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d1b1c4f29a872c674538e852cb38180e78037b84?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
        alt="Logo"
        className={styles.logoImage}
      />
      <h2 className={styles.practiceHeading}>
        <span className={styles.headingRegular}>the more you </span>
        <span className={styles.headingHighlight}>practice!</span>
      </h2>
      <p className={styles.formDescription}>
        Complete the form and our team will get in touch to help your child grow!
      </p>
      <h2 className={styles.becomeHeading}>
        <span className={styles.headingRegular}>the better you </span>
        <span className={styles.headingBlue}>become!</span>
      </h2>
    </>
  );
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    parentName: "",
    childName: "",
    whatsapp: "",
    grade: "",
    board: "CBSE",
    city: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log("Form submitted:", formData);
  };

  const handleBoardChange = (board) => {
    setFormData(prev => ({ ...prev, board }));
  };

  return (
    <div className={styles.formContainer}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="parentName" className={styles.formLabel}>Parent Name</label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              placeholder="Your name"
              className={styles.formInput}
              value={formData.parentName}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="childName" className={styles.formLabel}>Child Name</label>
            <input
              type="text"
              id="childName"
              name="childName"
              placeholder="Your cutie pie name"
              className={styles.formInput}
              value={formData.childName}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className={styles.formFullWidth}>
          <label htmlFor="whatsapp" className={styles.formLabel}>WhatsApp Number</label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            placeholder="Your WhatsApp number"
            className={styles.formInput}
            value={formData.whatsapp}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formFullWidth}>
          <label htmlFor="grade" className={styles.formLabel}>Grade</label>
          <div className={styles.selectWrapper}>
            <select
              id="grade"
              name="grade"
              className={styles.formSelect}
              value={formData.grade}
              onChange={handleChange}
            >
              <option value="" disabled selected>Your child grade</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
            </select>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c9875b902e5a681ca083a240025e17def40bcb06?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
              alt="Dropdown arrow"
              className={styles.selectArrow}
            />
          </div>
        </div>
        <div className={styles.boardSection}>
          <label className={styles.formLabel}>
            School Board<span className={styles.required}>*</span>
          </label>
          <div className={styles.boardOptions}>
            <div className={styles.boardOption}>
              <label className={styles.boardLabel}>
                <input
                  type="radio"
                  name="board"
                  value="CBSE"
                  checked={formData.board === "CBSE"}
                  onChange={() => handleBoardChange("CBSE")}
                  className={styles.hiddenRadio}
                />
                <div className={formData.board === "CBSE" ? styles.radioChecked : styles.radioUnchecked} />
                <span className={styles.boardText}>CBSE</span>
              </label>
            </div>
            <div className={styles.boardOption}>
              <label className={styles.boardLabel}>
                <input
                  type="radio"
                  name="board"
                  value="ICSE"
                  checked={formData.board === "ICSE"}
                  onChange={() => handleBoardChange("ICSE")}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioUnchecked} />
                <span className={styles.boardText}>ICSE</span>
              </label>
            </div>
            <div className={styles.boardOption}>
              <label className={styles.boardLabel}>
                <input
                  type="radio"
                  name="board"
                  value="IB"
                  checked={formData.board === "IB"}
                  onChange={() => handleBoardChange("IB")}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioUnchecked} />
                <span className={styles.boardText}>IB</span>
              </label>
            </div>
            <div className={styles.boardOption}>
              <label className={styles.boardLabel}>
                <input
                  type="radio"
                  name="board"
                  value="IGCSE"
                  checked={formData.board === "IGCSE"}
                  onChange={() => handleBoardChange("IGCSE")}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioUnchecked} />
                <span className={styles.boardText}>IGCSE</span>
              </label>
            </div>
            <div className={styles.boardOption}>
              <label className={styles.boardLabel}>
                <input
                  type="radio"
                  name="board"
                  value="OTHERS"
                  checked={formData.board === "OTHERS"}
                  onChange={() => handleBoardChange("OTHERS")}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioUnchecked} />
                <span className={styles.boardText}>OTHERS</span>
              </label>
            </div>
          </div>
        </div>
        <div className={styles.formFullWidth}>
          <label htmlFor="city" className={styles.formLabel}>City</label>
          <input
            type="text"
            id="city"
            name="city"
            placeholder="Enter your City"
            className={styles.formInput}
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit!
        </button>
      </form>
    </div>
  );
};

const SubjectTabs = () => {
  return (
    <div className={styles.subjectTabs}>
      <div className={styles.activeTab}>
        <span className={styles.tabText}>Math</span>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/c4a558a50c9ec80425e15f008c60fa5c385c954c?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
          alt="New badge"
          className={styles.newBadge}
        />
      </div>
      <span className={styles.tabDivider}>.</span>
      <div className={styles.inactiveTab}>
        <span className={styles.tabText}>English</span>
      </div>
      <span className={styles.tabDivider}>.</span>
      <div className={styles.inactiveTab}>
        <span className={styles.tabText}>Coding</span>
      </div>
    </div>
  );
};

export default Section7;
