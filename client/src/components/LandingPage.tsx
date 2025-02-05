import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const [titleEmoji, setTitleEmoji] = useState('🎲');

    const handleMouseEnter = () => {
        const emoji = document.querySelector('.title-emoji') as HTMLElement;
        emoji.style.animation = 'none';  // Reset animation
        emoji.offsetHeight;  // Trigger reflow
        emoji.style.animation = 'spin 0.5s forwards';
        setTimeout(() => setTitleEmoji('😈'), 250);
    };

    const handleMouseLeave = () => {
        const emoji = document.querySelector('.title-emoji') as HTMLElement;
        emoji.style.animation = 'none';  // Reset animation
        emoji.offsetHeight;  // Trigger reflow
        emoji.style.animation = 'spin 0.5s forwards';
        setTimeout(() => setTitleEmoji('🎲'), 250);
    };

    return (
        <div className="container">
            <div className="card">
                <h1>
                    <em>LIAR'S DICE</em>&nbsp;&nbsp;<span className="title-emoji">{titleEmoji}</span>
                </h1>
                <div className="button-container">
                    <Link to="/create">
                        <button 
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            Create Game
                        </button>
                    </Link>
                    <Link to="/join">
                        <button
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            Join Game
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;