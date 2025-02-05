import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameService } from '../../services/gameService';

interface GameRoomProps {
    isHost : boolean;
    playerName: string;
    playerId : string;
}

const GameRoom: React.FC<GameRoomProps>= ({isHost, playerName, playerId}) => {
    const { gameCode } = useParams<{ gameCode: string }>();
    console.log(gameCode);
    const navigate = useNavigate();
    const [players, setPlayers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        // TODO: check if gameCode is valid
        // Create WebSocket connection
        // gameCode is undefined when the component first mounts
        if (!gameCode) {
            navigate('/');
            return;
        }
        const websocket = GameService.createWebSocketConnection(gameCode, playerId);
        setWs(websocket);

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.players) {
                setPlayers(data.players);
            }
        };

        return () => {
            websocket.close();
        };
    }, [gameCode, navigate]);

    const handleStartGame = () => {
        if (ws) {
            ws.send(JSON.stringify({ action: 'START_GAME' }));
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1>Game Room: {gameCode}</h1>
                <h2>Players:</h2>
                <ul>
                    {players.map((player, index) => (
                        <li key={index}>{player}</li>
                    ))}
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