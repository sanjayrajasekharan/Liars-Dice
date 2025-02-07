import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./DiceRoll.module.css"; // Import module CSS

interface DiceRollerProps {
  numDice: number;
}

// Standard dice layouts (3x3 grid) for **dice positioning**
const diceLayouts: Record<number, number[][]> = {
  1: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], // Single die centered
  2: [[1, 0, 0], [0, 0, 0], [0, 0, 1]], // Two dice diagonally
  3: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], // Three dice in a diagonal
  4: [[1, 0, 1], [0, 0, 0], [1, 0, 1]], // Four dice in a square
  5: [[1, 0, 1], [0, 1, 0], [1, 0, 1]], // Five dice in an X shape
  6: [[1, 0, 1], [1, 0, 1], [1, 0, 1]], // Six dice in 3 rows of 2
};

// Standard die face values (3x3 grid)
const dieFaces: Record<number, number[][]> = {
  1: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
  2: [[1, 0, 0], [0, 0, 0], [0, 0, 1]],
  3: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  4: [[1, 0, 1], [0, 0, 0], [1, 0, 1]],
  5: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
  6: [[1, 0, 1], [1, 0, 1], [1, 0, 1]],
};

const DiceRoller: React.FC<DiceRollerProps> = ({ numDice }) => {
  const [rolling, setRolling] = useState(true);
  const [diceValues, setDiceValues] = useState<number[]>(
    Array(numDice).fill(1)
  );

  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setDiceValues(
          Array(numDice)
            .fill(0)
            .map(() => Math.floor(Math.random() * 6) + 1)
        );
      }, 100); // Smooth face change

      const timeout = window.setTimeout(() => {
        clearInterval(interval);
        setDiceValues(
          Array(numDice)
            .fill(0)
            .map(() => Math.floor(Math.random() * 6) + 1)
        );
        setRolling(false);
      }, 2000); // Stop after 2 seconds

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [rolling, numDice]);

  let diceIndex = 0; // Track which dice to plac

  return (
    <div className={styles.diceContainer}>
      {diceLayouts[numDice].map((row, rowIndex) =>
        row.map((shouldShowDie, colIndex) =>
          shouldShowDie && diceIndex < numDice ? (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={styles.dice}
              animate={rolling ? { scale: [1, 1.1, 1] } : { scale: 1 }} // Subtle scale effect
              transition={rolling ? { duration: 0.5, repeat: Infinity } : { duration: 0 }}
            >
              <div className={styles.diceFace}>
                {dieFaces[diceValues[diceIndex++]].map((faceRow, faceRowIndex) =>
                  faceRow.map((dot, faceColIndex) => (
                    <div
                      key={`${faceRowIndex}-${faceColIndex}`}
                      className={`${styles.dot} ${dot ? styles.activeDot : ""}`}
                    />
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <div key={`${rowIndex}-${colIndex}`} className={styles.emptySlot} />
          )
        )
      )}
    </div>
  );
};

export default DiceRoller;
