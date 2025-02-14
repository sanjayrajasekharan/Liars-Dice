import React from "react";

interface UserDisplayProps {
  userName: string;
  userIcon: string; // Expecting an emoji
}

const UserDisplay: React.FC<UserDisplayProps> = ({ userName, userIcon }) => {
  return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>
        <span style={styles.icon}>{userIcon}</span>
      </div>
      <p style={styles.userName}>{userName}</p>
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
    padding: "10px",
  },
  iconContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "80px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  icon: {
    fontSize: "55px",
  },
  userName: {
    marginTop: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
};

export default UserDisplay;
