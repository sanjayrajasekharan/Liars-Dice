import React, { useState } from "react";
import UserDisplay from "./UserDisplay";
import DiceRoller from "./DiceRoll/DiceRoll";

interface UserControllerProps {
  userName: string;
  userIcon: string;
  numDice: number;
  isUser: boolean;
}

const UserController: React.FC<UserControllerProps> = ({ userName, userIcon, numDice, isUser }) => {
  const [rolling, setRolling] = useState(false);
//   const [finishedRolling, setFinishedRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<number[]>([]);
//   const [showDiceRoller, setShowDiceRoller] = useState(false);

  // Simulated API call to get dice roll values
  const fetchDiceRoll = async () => {
    setRolling(true);
    // setShowDiceRoller(true); // Show the dice roller when rolling starts

    setTimeout(() => {
      const serverResponse = Array(numDice)
        .fill(0)
        .map(() => Math.floor(Math.random() * 6) + 1); // Simulated server response

      setDiceValues(serverResponse);
      setRolling(false);
    //   setFinishedRolling(false);
    }, 2000); // Simulated API delay (2 seconds)
  };

  return (
    <div style={styles.container}>
      {/* Always reserve space for DiceRoller */}
      <div 
        style={{ 
          ...styles.diceRollerWrapper, 
          visibility: rolling || diceValues.length > 0 ? "visible" : "hidden"
        }}
      >
        <DiceRoller numDice={numDice} diceValues={diceValues} rolling={rolling} />
      </div>

      {/* User Display */}
      <UserDisplay userName={userName} userIcon={userIcon} />

      {/* Roll Button */}
      <button 
        onClick={fetchDiceRoll} 
        style={{ 
          ...styles.rollButton, 
          opacity: rolling || diceValues.length > 0 ? 0 : 1,
        //   maxHeight: rolling || diceValues.length > 0 ? "0px" : s"50px",
        //   pointerEvents: rolling || diceValues.length > 0 ? "none" : "auto"
        }} 
        disabled={(rolling || diceValues.length > 0) || !isUser}
        hidden={!isUser}
      >
        {"Roll"}
      </button> 
    </div>
  );
};

// Inline styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
  },
  diceRollerWrapper: {
    height: "80px", // 🔥 Reserves space so layout doesn't shift
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  rollButton: {
    marginTop: "10px",
    padding: "10px 20px",
    width: "80px",
    // fontSize: "16px",
    // backgroundColor: "#4CAF50",
    // color: "white",
    // border: "none",
    // borderRadius: "5px",
    // cursor: "pointer",
    // transition: "background 0.3s",
    // transition: "opacity 0.5s ease, max-height 0.5s ease"
  },
};

export default UserController;
