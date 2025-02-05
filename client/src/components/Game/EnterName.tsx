import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../index.css'; // Ensure to import the CSS file

interface EnterNameProps {
    gameCode: string;
    playerName: string;
    setPlayerName: (name: string) => void;
    playerId: string;
    isHost: boolean;
}

const JoinGame: React.FC<EnterNameProps> = ({ gameCode, playerName, setPlayerName, playerId, isHost}) => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');


    const handleJoinGame = async () => {
        try {
            const response = await fetch('http://localhost:3000/join-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameCode, playerId, playerName }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.error || 'An unknown error occurred');
                console.error('Error joining game:', errorData);
                return; // Exit if there's an error
            }

            setErrorMessage('');
            navigate(`/game/${gameCode}`);
        } catch (error) {
            setErrorMessage('Failed to join game: ' + (error instanceof Error ? error.message : String(error)));
            console.error('Failed to join game:', error);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div className="container">
                <div className="card">
                    <h1> <em>JOIN</em></h1> <div className="form-group">
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name"
                            className="input-field"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleJoinGame(); // Trigger the button press
                                }
                            }}
                        />
                        <button onClick={handleJoinGame}>Join Game</button>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinGame; 