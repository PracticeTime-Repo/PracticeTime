"use client";
import React, { useState } from "react";
import styles from "./Section7.module.css";
import SubjectButton from "./SubjectButton";
import ContactForm from "./ContactForm";
import arrowImg from "./arrow.png";


function Section7() {
  return (
    <section className={styles.section7}>
      <div className={styles.example04}>
        <div className={styles.div}>
          <div className={styles.column}>
            <div className={styles.div2}>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/0442a517a403251d5959637b0e2a64010cc28ce9?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
                alt="Decorative logo"
                className={styles.img}
              />
              <div className={styles.motivationWrapper}>
  <div>
<div className={styles.motivationTextWrapper}>
  <h2 className={styles.themoreyoupractice}>
    <span className={styles.boldText}>the more you </span>
    <span className={styles.highlightBlue}>practice!</span>
  </h2>
  <h2 className={styles.thebetteryoubecome}>
    <span className={styles.boldText}>the better you </span>
    <span className={styles.highlightLightBlue}>become!</span>
  </h2>
</div>

  </div>
  <img src={arrowImg} alt="Arrow" className={styles.arrowImage} />
</div>

              <div className={styles.div3}>
                <SubjectButton name="Math" active={true} />
                <div className={styles.div5}>.</div>
                <SubjectButton name="English" active={false} />
                <div className={styles.div6}>.</div>
                <SubjectButton name="Coding" active={false} />
              </div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/fbd857bd48d4b7a165771bf3fcb2d9418b3d09f9?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
                alt="Decorative illustration"
                className={styles.img3}
              />
            </div>
          </div>
          <div className={styles.column2}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Section7;
