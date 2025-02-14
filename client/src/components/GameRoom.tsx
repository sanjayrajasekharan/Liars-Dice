import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameService } from '../services/gameService';

interface GameRoomProps {
    isHost : boolean;
    playerName: string;
    playerId : string;
}

const GameRoom: React.FC<GameRoomProps>= ({isHost, playerName, playerId}) => {
    const { gameCode } = useParams<{ gameCode: string }>();
    const navigate = useNavigate();
    // const [players, setPlayers] = useState<string[]>([]);
    const ws = useRef<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (!gameCode) {
            navigate('/');
            return;
        }

        console.log(gameCode);
        const websocket = GameService.createWebSocketConnection(gameCode, playerId);
        websocket.onopen = () => {
            console.log('Connected to game server');
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Handle incoming messages
            console.log(data);
        };

        websocket.onclose = (event) => {
            console.log('WebSocket connection closed:', event);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current = websocket;

        return () => {
            websocket.close();
        };
        
    }, [])

    useEffect(() => {
        // TODO: check if gameCode is valid
        // Create WebSocket connection
        // gameCode is undefined when the component first mounts
        if (!gameCode) {
            navigate('/');
            return;
        }

    }, [gameCode, navigate, playerId]);

    const handleStartGame = () => {
        if (ws.current) {
            ws.current.send(JSON.stringify({ action: 'START_GAME' }));
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1>Game Room: {gameCode}</h1>
                <h2>Players:</h2>
                <ul>
                    {/* {players.map((player, index) => (
                        <li key={index}>{player}</li>
                    ))} */}
                </ul>
                {isHost && (
                    <button onClick={handleStartGame}>Start Game</button>
                )}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default GameRoom; 