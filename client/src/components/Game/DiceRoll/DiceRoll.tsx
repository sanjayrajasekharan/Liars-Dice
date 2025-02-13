import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./DiceRoll.module.css"; // Import module CSS

interface DiceRollerProps {
    numDice: number; // 1 to 6
    diceValues: number[];
    rolling: boolean;
}

// Standard dice layouts (3x3 grid) for **dice positioning**
const diceLayouts: Record<number, number[][]> = {
    1: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ], // Single die centered
    2: [
        [0, 0, 0],
        [1, 0, 1],
        [0, 0, 0],
    ], // Two dice diagonally
    3: [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ], // Three dice in a diagonal
    4: [
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 1],
    ], // Four dice in a square
    5: [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
    ], // Five dice in an X shape
    6: [
        [0, 0, 0],
        [1, 1, 1],
        [1, 1, 1],
    ], // Six dice in 3 rows of 2
};

// Standard die face values (3x3 grid)
const dieFaces: Record<number, number[][]> = {
    1: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ],
    2: [
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 1],
    ],
    3: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ],
    4: [
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 1],
    ],
    5: [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
    ],
    6: [
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
    ],
};

const DiceRoller: React.FC<DiceRollerProps> = ({
    numDice,
    diceValues,
    rolling,
}) => {
    const [tempDiceValues, setTempDiceValues] = useState<number[]>(
        Array(numDice).fill(1)
    );
    const animationInterval = useRef<number | null>(null);

    useEffect(() => {
        if (rolling) {
            animationInterval.current = window.setInterval(() => {
                setTempDiceValues(
                    Array(numDice)
                        .fill(0)
                        .map(() => Math.floor(Math.random() * 6) + 1)
                );
            }, 100); // Smooth face change

            // const timeout = window.setTimeout(() => {
            //     clearInterval(interval);
            //     setTempDiceValues(diceValues);
            //     setRolling(false);
            // }, 2000); // Stop after 2 seconds

        if (!rolling && diceValues.length == numDice) {
            if (animationInterval.current)
                clearInterval(animationInterval.current);
            setTempDiceValues(diceValues);
        }
            return () => {
                if (animationInterval.current) {
                    clearInterval(animationInterval.current);
                }
                // clearTimeout(timeout);
            };
        }

    }, [rolling, diceValues]);

    let diceIndex = 0; // Track which dice to plac

    // console.log(diceLayouts);
    return (
        <div className={styles.diceContainer}>
            {
            
            Array.from({ length: numDice }).map((_, index) => ( 
                        <motion.div
                            // key={`${rowIndex}-${colIndex}`}
                            className={styles.dice}
                            animate={
                                rolling ? { scale: [1, 1.1, 1] } : { scale: 1 }
                            } // Subtle scale effect
                            transition={
                                rolling
                                    ? { duration: 0.2, repeat: Infinity }
                                    : { duration: 0 }
                            }
                        >
                            <div className={styles.diceFace}>
                                {dieFaces[tempDiceValues[diceIndex++]].map(
                                    (faceRow, faceRowIndex) =>
                                        faceRow.map((dot, faceColIndex) => (
                                            <div
                                                key={`${faceRowIndex}-${faceColIndex}`}
                                                className={`${styles.dot} ${
                                                    dot ? styles.activeDot : ""
                                                }`}
                                            />
                                        ))
                                )}
                            </div>
                        </motion.div>
                    ) 
                
            )}
        </div>
    );
};

export default DiceRoller;
