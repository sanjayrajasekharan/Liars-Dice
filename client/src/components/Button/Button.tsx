import React from "react";
import "./Button.module.css";
interface ButtonProps {
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    text: string;
    disabled?: boolean;
    variant?: "red" | "black";
}

const Button: React.FC<ButtonProps> = ({ onClick, onMouseEnter, onMouseLeave, text, disabled, variant='red' }) => {
    return (
        <button className={variant} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} disabled={disabled}>
            {text}
        </button>
    );
};


export default Button;