import { StateChange } from './states.js';
import { Action, Claim } from './actions.js';
import { ErrorCode } from './errorCodes.js';

export interface ServerMessage {
    change : StateChange;
    player? : {
        name : string;
        index: number};
    claim? : Claim;
    challenge? : {
        winner : number;
        loser : number;
        totalDice : number;
        dicePerPlayer: number[];
        gameEnded : boolean;
    };
    roll?: number;
    rolls?: number[];
}

export interface PlayerMessage {
    action : Action;
    player : string;
    claim? : Claim;
}

export interface ErrorMessage {
    errorCode : ErrorCode; 
    errorMessage : string;
}
