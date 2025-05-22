
// import React from "react";
import styles from "./Section7.module.css";

function SubjectButton({ name, active }) {
  if (active) {
    return (
      <div className={styles.div4}>
        <div className={styles.math}>{name}</div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/c4a558a50c9ec80425e15f008c60fa5c385c954c?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
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
