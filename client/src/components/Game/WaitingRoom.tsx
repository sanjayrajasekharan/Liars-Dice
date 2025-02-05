import React from 'react';

interface WaitingRoomProps {
    players: string[];
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ players }) => {
    return (
        <div>
            <h3>Waiting for players...</h3>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>
        </div>
    );
};

export default WaitingRoom; 