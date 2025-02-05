export enum GameStage {
    PRE_GAME = 'PRE_GAME',
    START_SELECTION = "START_SELECTION",
    DICE_ROLLING = 'DICE_ROLLING',
    ROUND_ROBBIN = "ROUND",
    POST_ROUND = "POST_ROUND",
    POST_GAME = "POST_GAME"
}

export enum StateChange {
    PLAYER_JOINED = "PLAYER_JOINED",
    PLAYER_LEFT = "PLAYER_LEFT",
    GAME_STARTED = "GAME_STARTED",
    ROUND_STARTED = "ROUND_STARTED",
    ROUND_ENDED = "ROUND_ENDED",
    DICE_ROLLING_STARTED = "DICE_ROLLING_STARTED",
    DICE_ROLLED = "DICE_ROLLED",
    CLAIM_MADE = "CLAIM_MADE",
    CHALLENGE_MADE = "CHALLENGE_MADE",
    GAME_ENDED = "GAME_ENDED"
}