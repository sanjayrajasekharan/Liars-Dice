import { StateChange } from './states';
import { Action, Claim } from './actions';
import { ErrorCode } from './errorCodes';

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
