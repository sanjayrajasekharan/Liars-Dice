import WebSocket from "ws";
import { generate } from "random-words";
import { ErrorCode, errorDescription } from "../shared/errorCodes";
import { ServerMessage, PlayerMessage, ErrorMessage } from "../shared/messages";
import { GameStage, StateChange } from "../shared/states";
import { Action } from "../shared/actions";


export interface Player {
    name: string;
    id: string; // change to hash
    ws: WebSocket | null;
    dice: number[];
    remainingDice: number;
    hasRolled: boolean; // flag to check if the player has rolled the dice (for the current round)
    startRoll: number | null; // roll for determining the starting player
    index: number; // index of the player in the players array,
    active: boolean; // flag to check if the player is still in the game;
}

export interface Game {
    hostId: string;
    players: { [playerId: string]: Player };
    numPlayers: number;
    currentClaim: { quantity: number; value: number } | null;
    turnIndex: number;
    gameState: GameStage;
    numPlayersRolled: number;
}

export type GameCode = string;

// Store the games by gameCode
const games: { [gameCode: GameCode]: Game } = {};

export function createGame(hostId: string, hostName: string): GameCode {
    console.log(`Creating game for host: ${hostId} (${hostName})`);
    let gameCode: GameCode;
    do {
        gameCode = generate({
            exactly: 3,
            maxLength: 5,
            minLength: 4,
            join: "-",
            seed: Date.now().toString(),
        });
    } while (games[gameCode]);

    const host = {
        name: hostName,
        id: hostId,
        ws: null,
        remainingDice: 6,
        dice: [],
        hasRolled: false,
        index: 0,
        active: false,
        startRoll: null,
    };

    games[gameCode] = {
        hostId: hostId,
        players: { [hostId]: host },
        numPlayers: 1,
        currentClaim: null,
        turnIndex: 0,
        gameState: GameStage.PRE_GAME,
        numPlayersRolled: 0,
    };

    console.log(games);

    return gameCode;
}

export function joinGame(
    gameCode: string,
    playerId: string,
    playerName: string
) {
    if (!games[gameCode]) {
        return { error: "Game not found" };
    } else if (games[gameCode].players[playerId]) {
        return { error: "Player already in the game" };
    } else if (games[gameCode].numPlayers >= 6) {
        return { error: "Game is full" };
    } else if (games[gameCode].gameState !== GameStage.PRE_GAME) {
        return { error: "Game is in progress" };
    }

    games[gameCode].players[playerId] = {
        name: playerName,
        id: playerId,
        ws: null,
        remainingDice: 6,
        dice: [],
        hasRolled: false,
        startRoll: null,
        index: games[gameCode].numPlayers,
        active: false,
    };

    games[gameCode].numPlayers += 1;

    return {
        gameCode,
        message: `Player ${playerId} (${playerName}) joined the game`,
    };
}

// Function to handle a new WebSocket connection for a game room
export function handleGameConnection(
    ws: WebSocket,
    gameCode: string,
    playerId: string
) {
    let game = games[gameCode];

    if (!game) {
        console.error(
            `${ErrorCode.GAME_NOT_FOUND} : ${
                errorDescription[ErrorCode.GAME_NOT_FOUND]
            }`
        ); // Error that's getting flagged
        ws.close(
            1008,
            JSON.stringify({
                error: ErrorCode.GAME_NOT_FOUND,
                message: errorDescription[ErrorCode.GAME_NOT_FOUND],
            })
        );
        return;
    }

    const player = game.players[playerId];
    if (!player) {
        console.error(`Player ${playerId} not member of game ${gameCode}`);
        ws.close(
            1008,
            JSON.stringify({
                error: ErrorCode.UNAUTHORIZED,
                message: errorDescription[ErrorCode.UNAUTHORIZED],
            })
        );
        return;
    } else {
        player.ws = ws;
        console.log(`Player ${playerId} connected to game ${gameCode}`);
        broadcastMessageToAll(game, {
            change: StateChange.PLAYER_JOINED,
            player: { name: player.name, index: player.index },
        });
        console.log(game);
    }

    // need funciton for users who are joining game to show up on existing players screen

    ws.on("error", (error) => {
        console.error(`WebSocket error in game ${gameCode}: ${error}`);
    });

    ws.on("message", (message) => {
        handleMessage(gameCode, playerId, JSON.parse(message.toString()));
    });

    ws.on("close", () => {
        console.log(`${playerId} disconnected from game: ${gameCode}`);
        player.ws = null;
    });

    // broadcastGameState(gameCode);
}

function handleMessage(
    gameCode: string,
    playerId: string,
    message: PlayerMessage
) {
    let game = games[gameCode];
    let player = game.players[playerId];

    switch (message.action) {
        case Action.START_GAME:
            startGame(game, player);
            break;
        case Action.START_ROUND:
            startRound(game, player);
            break;
        case Action.CLAIM:
            if (!message.claim) {
                console.error("Missing claim in message");
                return;
            }
            makeClaim(game, player, message.claim);
            break;
        case Action.CHALLENGE:
            makeChallenge(game, player);
            break;
        case Action.ROLL:
            rollDice(player, game);
            break;
        case Action.ROLL_FOR_START:
            rollForStart(player, game);
            break;
        default:
            console.error(`Invalid action: ${message.action}`);
    }
}

function startGame(game: Game, player: Player) {
    if (game.hostId !== player.id) {
        sendErrorToPlayer(player, ErrorCode.UNAUTHORIZED);
    } else if (game.gameState !== GameStage.PRE_GAME) {
        sendErrorToPlayer(player, ErrorCode.GAME_IN_PROGRESS);
    } else if (Object.keys(game.players).length < 2) {
        sendErrorToPlayer(player, ErrorCode.NOT_ENOUGH_PLAYERS);
    }

    game.gameState = GameStage.START_SELECTION;

    broadcastMessageToAll(game, { change: StateChange.GAME_STARTED });
}

function startRound(game: Game, player: Player) {
    if (game.gameState !== GameStage.START_SELECTION) {
        sendErrorToPlayer(player, ErrorCode.ROUND_NOT_ACTIVE);
    } else if (player.id !== game.hostId) {
        sendErrorToPlayer(player, ErrorCode.UNAUTHORIZED);
    } else {
        game.gameState = GameStage.START_SELECTION;
        game.currentClaim = null;

        broadcastMessageToAll(game, { change: StateChange.ROUND_STARTED });
    }
}

// Function to handle making a claim
function makeClaim(
    game: Game,
    player : Player,
    claim: { quantity: number; value: number }
) {

    if (game.gameState !== GameStage.ROUND_ROBBIN) {
        sendErrorToPlayer(player, ErrorCode.ROUND_NOT_ACTIVE);
    } else if (player.id !== game.players[game.turnIndex].id) {
        sendErrorToPlayer(player, ErrorCode.OUT_OF_TURN);
    } else if (!isValidClaim(game.currentClaim, claim)) {
        sendErrorToPlayer(player, ErrorCode.INVALID_CLAIM);
    } else {
        game.currentClaim = claim;
        game.turnIndex = (game.turnIndex + 1) % game.numPlayers;

        broadcastMessageToAll(game, {
            change: StateChange.CLAIM_MADE,
            claim,
        });
    }
}

// Function to handle calling a player a liar
function makeChallenge(game: Game, player: Player) {

    if (game.gameState !== GameStage.ROUND_ROBBIN) {
        sendErrorToPlayer(player, ErrorCode.ROUND_NOT_ACTIVE);
    } else if (player.id !== game.players[game.turnIndex].id) {
        sendErrorToPlayer(player, ErrorCode.OUT_OF_TURN);
    } else if (!game.currentClaim) {
        sendErrorToPlayer(player, ErrorCode.INVALID_CHALLENGE);
    } else {
        const totalDice = countDice(game, game.currentClaim!.value);
        const isChallengeSuccesful = totalDice < game.currentClaim!.quantity;

        let loser: Player;
        let winner: Player;

        if (isChallengeSuccesful) {
            loser = game.players[game.turnIndex - (1 % game.numPlayers)];
            winner = game.players[game.turnIndex];
        } else {
            loser = game.players[game.turnIndex];
            winner = game.players[game.turnIndex - (1 % game.numPlayers)];
        }

        loser.remainingDice -= 1;

        let gameEnded = Object(game.players).every(
            (p : Player) => p !== winner || p.remainingDice === 0
        );

        game.currentClaim = null;
        game.gameState = GameStage.POST_ROUND;

        // Players need to roll for the next round
        Object(game.players).forEach((p: Player) => {
            p.hasRolled = false;
            p.startRoll = null;
        });
        game.numPlayersRolled = 0;

        game.currentClaim = null;

        if (gameEnded) {
            game.gameState = GameStage.POST_GAME;
        } else {
            game.gameState = GameStage.POST_ROUND;
        }

        broadcastMessageToAll(game, {
            change: StateChange.CHALLENGE_MADE,
            challenge: {
                winner: winner.index,
                loser: loser.index,
                totalDice,
                dicePerPlayer: Object(game.players).map((p : Player) => p.remainingDice),
                gameEnded,
            },
        });
    }
}

function rollForStart(player: Player, game: Game) {
    if (player.hasRolled) {
        sendErrorToPlayer(player, ErrorCode.OUT_OF_TURN);
    } else if (game.gameState === GameStage.PRE_GAME) {
        player.hasRolled = true;
        game.numPlayersRolled += 1;
        player.startRoll = Math.floor(Math.random() * 6) + 1;
        broadcastMessageToAll(game, {
            change: StateChange.DICE_ROLLING_STARTED,
            roll: player.startRoll,
        });
        if (game.numPlayersRolled === game.numPlayers) {
            game.turnIndex = Object(game.players)
                .values()
                .reduce(
                    (
                        maxIdx: any,
                        currentPlayer: Player,
                        currentIndex: number,
                        players: [Player]
                    ) => {
                        return currentPlayer.startRoll! >
                            players[maxIdx].startRoll!
                            ? currentIndex
                            : maxIdx;
                    },
                    0
                );

            broadcastMessageToAll(game, {
                change: StateChange.ROUND_STARTED,
                player: {
                    name: game.players[game.turnIndex].name,
                    index: game.turnIndex,
                },
            });
        }
    }
}

// Utility to roll a die (returns a value between 1 and 6)
function rollDice(player: Player, game: Game) {
    if (player.hasRolled) {
        return sendErrorToPlayer(player, ErrorCode.OUT_OF_TURN);
    } else if (game.gameState === GameStage.DICE_ROLLING) {
        for (let i = 0; i < player.remainingDice; i++) {
            player.dice.push(Math.floor(Math.random() * 6) + 1);
        }
        player.hasRolled = true;
        game.numPlayersRolled += 1;

        sendMessageToPlayer(player, {
            change: StateChange.DICE_ROLLED,
            rolls: player.dice,
        });

        if (game.numPlayersRolled === game.numPlayers) {
            broadcastMessageToAll(game, { change: StateChange.ROUND_STARTED });
        }
    }
}

// communication utilities

function sendErrorToPlayer(player: Player, errorCode: ErrorCode) {
    if (player && player.ws && player.ws.readyState === WebSocket.OPEN) {
        let error: ErrorMessage = {
            errorCode: errorCode,
            errorMessage: errorDescription[errorCode],
        };
        player.ws.send(JSON.stringify({ error }));
    }
}

function sendGameStateToPlayer(player: Player, gameCode: GameCode) {
    let game = games[gameCode];

    let sanitizedGameState = {
        host: game.players[game.hostId].index,
        currentClaim: game.currentClaim,
        turnIndex: game.turnIndex,
        gameState: game.gameState,

        players: Object.values(game.players)
            .map((player) => ({
                name: player.name,
                remainingDice: player.remainingDice,
                index: player.index,
            }))
            .sort((a, b) => a.index - b.index),
    };

    if (player && player.ws && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify(sanitizedGameState));
    }
}

function sendMessageToPlayer(player: Player, message: ServerMessage) {
    if (player && player.ws && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify(message));
    }
}

// Utility to broadcast a specific message to all players
function broadcastMessageToAll(game: Game, message: ServerMessage) {
    Object(game.players)
        .values()
        .forEach((player: Player) => {
            sendMessageToPlayer(player, message);
        });
}

function isValidClaim(
    previousClaim: { quantity: number; value: number } | null,
    newClaim: { quantity: number; value: number }
): boolean {
    if (previousClaim === null) {
        return true;
    }
    return (
        newClaim.quantity > previousClaim.quantity ||
        (newClaim.quantity === previousClaim.quantity &&
            newClaim.value > previousClaim.value)
    );
}

// Utility to count the total number of dice showing the specified value across all players
function countDice(game: Game, value: number): number {
    return Object(game.players)
        .values()
        .reduce((total: number, player: Player) => {
            return total + player.dice.filter((die) => die === value).length;
        }, 0);
}
