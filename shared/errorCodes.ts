export enum ErrorCode {
    INVALID_CLAIM = 'INVALID_CLAIM',
    INVALID_CHALLENGE = 'INVALID_CHALLENGE',
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    ROUND_NOT_ACTIVE = 'ROUND_NOT_ACTIVE',
    OUT_OF_TURN = 'OUT_OF_TURN',
    UNAUTHORIZED = 'UNAUTHORIZED',
    GAME_IN_PROGRESS = 'GAME_IN_PROGRESS',
    NOT_ENOUGH_PLAYERS = 'NOT_ENOUGH_PLAYERS',
} 

export const errorDescription = {
    [ErrorCode.INVALID_CLAIM]: 'Claim must be higher than the previous claim',
    [ErrorCode.INVALID_CHALLENGE]: 'Cannot challenge nonexistent claim',
    [ErrorCode.GAME_NOT_FOUND]: 'Game not found',
    [ErrorCode.ROUND_NOT_ACTIVE]: 'Round not active',
    [ErrorCode.OUT_OF_TURN]: 'Attempting to make a move out of turn',
    [ErrorCode.UNAUTHORIZED]: 'Player not authorized for this action',
    [ErrorCode.GAME_IN_PROGRESS]: 'Game already in progress',
    [ErrorCode.NOT_ENOUGH_PLAYERS]: 'Not enough players to start the game',
}
