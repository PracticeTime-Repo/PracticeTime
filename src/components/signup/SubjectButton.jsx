
// import React from "react";
import styles from "./Section7.module.css";
import live from "./live.png";

function SubjectButton({ name, active }) {
  if (active) {
    return (
      <div className={styles.div4}>
        <div className={styles.math}>{name}</div>
        <img
          src={live}
          alt="Active indicator"
          className={styles.img2}
        />
      </div>
    );
  }

  return (
    <div className={active ? styles.div4 : name === "English" ? styles.english : styles.coding}>
      {name}
    </div>
  );
}

export default SubjectButton;
