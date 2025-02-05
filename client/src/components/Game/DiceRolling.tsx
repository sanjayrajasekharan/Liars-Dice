import React from 'react';

interface DiceRollingProps {
    dice: number[];
}

const DiceRolling: React.FC<DiceRollingProps> = ({ dice }) => {
    return (
        <div>
            <h3>Rolling Dice</h3>
            <div>
                {dice.map((value, index) => (
                    <span key={index}>🎲 {value} </span>
                ))}
            </div>
        </div>
    );
};

export default DiceRolling; 