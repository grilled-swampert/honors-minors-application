import react from "react";
import styles from "./scrollText.module.css";

export default function ScrollText() {
    return(
        <div className={styles.adminMessage}>
        <p className={styles.scrollMessageText}>
          <span>This is random sentence which is scrolling right now but the actual message will be put up by the admin and linked using backend</span>
        </p>
      </div>
    )
}