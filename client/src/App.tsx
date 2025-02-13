// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import CreateGame from "./components/Game/CreateGame";
import JoinGame from "./components/Game/JoinGame";
import GameRoom from "./components/Game/GameRoom";
// import DiceRoll from "./components/Game/DiceRoll/DiceRoll";
import UserController from "./components/Game/UserController";
import UserDisplay from "./components/Game/UserDisplay";
import DiceRoller from "./components/Game/DiceRoll/DiceRoll";
import Table from "./components/Game/Table/Table";
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
                                justifyContent: "center",
                                marginTop: "50px",
                            }}
                        >
                            <DiceRoller numDice = {4} diceValues={[1,3,5,2]} rolling = {false}/>
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
                            <UserController
                                userName="Sanjay"
                                userIcon="🙉"
                                numDice={6}
                                isUser={true}
                            />
                        </div>
                    }
                />
                <Route path="/table" element={
                <div style={{ textAlign: "center", padding: "20px" }}>
                <Table user={{name: "Sanjay", icon: "🙉", numDice: 5}} opponents={[{name: "April", icon: "🦧", numDice: 1}, {name: "Abdullah", icon: "🦍", numDice: 4}, {name: "Ben", icon: "🦁", numDice: 3}, {name: "Colin", icon: "🐭", numDice: 2}]} />
            </div>
                
                }/>
            </Routes>
        </Router>
    );
};

export default App;
