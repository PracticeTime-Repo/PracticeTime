"use client";
import styles from "./Section7.module.css";
import SubjectButton from "./SubjectButton";
import ContactForm from "./ContactForm1";
import arrowImg from "./arrow.png";
import SignupImage from "./SignupImage.png";

function Section7() {
  return (
    <div className="container-fluid">
      <div className="container">
      <img src={arrowImg} alt="Dotted Arrow" className={styles.outsideArrow} />

      <section className={styles.section7}>
        <div className={styles.example04}>
          <div className={styles.div}>
            <div className={styles.column}>
              <div className={styles.div2}>
               <div className={styles.logo}> <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/0442a517a403251d5959637b0e2a64010cc28ce9?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
                  alt="Decorative logo"
                  className={styles.img}
                />
                </div>

                <div className={styles.heroSection}>
                  <div className={styles.leftCont3ent}>
                    <div className={styles.motivationText}>
                      <h2>
                        <span className={styles.boldText}>the more you </span>
                        <span className={styles.highlightBlue}>practice!</span>
                      </h2>
                      <h2>
                        <span className={styles.boldText}>the better you </span>
                        <span className={styles.highlightLightBlue}>
                          become!
                        </span>
                      </h2>
                    </div>
                  </div>
                </div>

                <div className={styles.subjectWrapper}>
                  <SubjectButton name="Math" active={true} showLive />
                  <div className={styles.divider}>•</div>
                  <SubjectButton name="English" active={false} />
                  <div className={styles.divider}>•</div>
                  <SubjectButton name="Coding" active={false} />
                </div>

               <div>
                  <img src={SignupImage} alt="Decorative illustration" className={styles.signupImages} />
                </div>

              </div>
            </div>
            <div className={styles.column2}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

export default Section7;
                {/* <div className={styles.signupIhmages}>
           <img
  src={SignupImage}
  alt="Decorative illustration"
  className={styles.imgh3}
  style={{ height: '600px', width: '600px', objectFit: 'contain' }}
/>

                </div> */}
