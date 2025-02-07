// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import CreateGame from "./components/Game/CreateGame";
import JoinGame from "./components/Game/JoinGame";
import GameRoom from "./components/Game/GameRoom";
import DiceRoller from "./components/Game/DiceRoll/DiceRoll";
import UserDisplay from "./components/Game/UserDisplay";
// Import other components (e.g., CreateGame, JoinGame) when they are ready

const App: React.FC = () => {
    const [gameCode, setGameCode] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [playerId, setPlayerId] = useState("");
    const [isHost, setIsHost] = useState(false);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/create"
                    element={
                        <CreateGame
                            gameCode={gameCode}
                            setGameCode={setGameCode}
                            playerName={playerName}
                            setPlayerName={setPlayerName}
                            playerId={playerId}
                            setPlayerId={setPlayerId}
                            isHost={isHost}
                            setIsHost={setIsHost}
                        />
                    }
                />
                <Route
                    path="/join"
                    element={
                        <JoinGame
                            gameCode={gameCode}
                            setGameCode={setGameCode}
                            playerName={playerName}
                            setPlayerName={setPlayerName}
                            playerId={playerId}
                            setPlayerId={setPlayerId}
                        />
                    }
                />
                <Route
                    path="/game/:gameCode"
                    element={
                        <GameRoom
                            playerName={playerName}
                            playerId={playerId}
                            isHost={isHost}
                        />
                    }
                />
                <Route
                    path="/dice"
                    element={
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center", // Centers horizontally
                                alignItems: "center", // Centers vertically
                                height: "100vh", // Full height of the viewport
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: "20px",
                                    borderRadius: "10px",
                                }}
                            >
                                <DiceRoller numDice={6} />
                            </div>
                        </div>
                    }
                />
                <Route
                    path="/user"
                    element={
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "50px",
                            }}
                        >
                            <UserDisplay userName="Sanjay" userIcon="😎" />
                        </div>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
