import WebSocket from "ws";
import { generate } from "random-words";

export interface Player {
    name: string | null;
    id: string;
    ws: WebSocket | null;
    dice: number[];
    remainingDice: number;
    hasRolled: boolean; // flag to check if the player has rolled the dice (for the current round)
    roll: number | null; // roll for determining the starting player
    index: number; // index of the player in the players array,
    active: boolean; // flag to check if the player is still in the game
}

export interface GameState {
    host: string;
    players: Player[];
    currentClaim: { quantity: number; value: number } | null;
    currentPlayer: string;
    turnIndex: number;
    roundActive: boolean;
    allPlayersRolled: boolean;
}

// Store the games by gameCode
const games: { [gameCode: string]: GameState } = {};

export function createGame(hostId: string, hostName: string) {
    console.log(`Creating game for host: ${hostId} (${hostName})`);
    let gameCode: string;
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
        roll: null,
        index: 0,
        active: false,
    };

    games[gameCode] = {
        host: hostId,
        players: [host],
        currentClaim: null,
        currentPlayer: "",
        turnIndex: 0,
        roundActive: false,
        allPlayersRolled: false,
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
    }

    // Check if the player is already in the game
    if (games[gameCode].players.find((p) => p.id === playerId)) {
        return { error: "Player already in the game" };
    }

    if (games[gameCode].players.length >= 6) {
        return { error: "Game is full" };
    }

    if (games[gameCode].roundActive) {
        return { error: "Game is in progress" };
    }

    // Add the player to the game
    games[gameCode].players.push({
        name: playerName,
        id: playerId,
        ws: null,
        remainingDice: 6,
        dice: [],
        hasRolled: false,
        roll: null,
        index: games[gameCode].players.length,
        active: false,
    });

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
    let gameState = games[gameCode];

    // Check if the game exists
    console.log("handleGameConnection");
    console.log(games);
    if (!gameState) {
        console.error(`Game not found: ${gameCode}`); // Error that's getting flagged
        ws.send(JSON.stringify({ error: "Game not found" }));
        ws.close(1008, "Game not found");
        return;
    }

    const player = gameState.players.find((player) => player.id === playerId);
    if (!player) {
        // Player not allowed in game
        console.error(`Player ${playerId} not member of game ${gameCode}`);
        ws.send(JSON.stringify({ error: "Player not allowed in game" }));
        ws.close(1008, "Player not allowed in game");
        return;
    }
    if (player.ws) {
        console.log(`Player ${playerId} reconnected to game ${gameCode}`);
        player.ws = ws; // Update the WebSocket connection
        broadcastMessageToAll(gameCode, {
            action: "reconnect",
            player: player.index,
        });
    } else {
        player.ws = ws;
        console.log(`Player ${playerId} connected to game ${gameCode}`);
        broadcastMessageToAll(gameCode, {
            action: "join",
            player: gameState.players.length - 1,
        });
        console.log(gameState);
    }

    // need funciton for users who are joining game to show up on existing players screen

    if (gameState.players.length === 1) {
        gameState.currentPlayer = playerId;
    }

    // Send sanitized players array to all players
    // ws.send(JSON.stringify({
    //     players: gameState.players.map((player: Player) => ({
    //         ...player,
    //         ws: undefined,
    //         playerId: undefined
    //     }))
    // }));

    ws.on("message", (message) => {
        const { action, data } = JSON.parse(message.toString());

        if (action === "rollDie") {
            handlePlayerRoll(gameCode, playerId);
        } else if (action === "makeClaim") {
            handleMakeClaim(gameCode, playerId, data);
        } else if (action === "callLiar") {
            handleCallLiar(gameCode, playerId);
        }
    });

    ws.on("close", () => {
        console.log(`${playerId} disconnected from game: ${gameCode}`);
    });

    // broadcastGameState(gameCode);
}

// Function to handle making a claim
function handleMakeClaim(
    gameCode: string,
    playerId: string,
    claim: { quantity: number; value: number }
) {
    let gameState = games[gameCode];

    // Ensure it's the player's turn
    if (playerId !== gameState.currentPlayer) {
        sendErrorToPlayer(gameCode, playerId, "It is not your turn");
        return;
    }

    // Validate the claim (must raise the number of dice or increase the value)
    if (
        gameState.currentClaim &&
        !isValidClaim(gameState.currentClaim, claim)
    ) {
        sendErrorToPlayer(
            gameCode,
            playerId,
            "Invalid claim: must raise the quantity or the die value"
        );
        return;
    }

    // Update the game state with the new claim
    gameState.currentClaim = claim;
    gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
    gameState.currentPlayer = gameState.players[gameState.turnIndex].id;
    gameState.roundActive = true;

    // Broadcast the new claim to all players
    broadcastMessageToAll(gameCode, {
        action: "newClaim",
        claim,
        newCurrentPlayer: gameState.currentPlayer,
    });
}

// Function to handle calling a player a liar
function handleCallLiar(gameCode: string, playerId: string) {
    let gameState = games[gameCode];

    // Ensure that a claim has been made before calling a liar
    if (!gameState.roundActive) {
        sendErrorToPlayer(gameCode, playerId, "No claim has been made yet");
        return;
    }

    if (playerId !== gameState.currentPlayer) {
        sendErrorToPlayer(gameCode, playerId, "It is not your turn");
        return;
    }

    const totalDice = countDice(gameCode, gameState.currentClaim!.value);
    const liar = totalDice < gameState.currentClaim!.quantity;
    const loser = liar
        ? gameState.players.find((p) => p.id === gameState.currentPlayer)!
        : gameState.players.find((p) => p.id === playerId)!;

    // The loser loses one die
    loser.remainingDice -= 1;

    if (loser.remainingDice <= 0) {
        // The player is eliminated
        gameState.players = gameState.players.filter((p) => p.id !== loser.id);
    }

    // Check if there is a winner (only one player left)
    if (gameState.players.length === 1) {
        const winner = gameState.players[0];
        broadcastMessageToAll(gameCode, {
            action: "winner",
            winner: winner.id,
            value: gameState.currentClaim!.value,
            count: totalDice,
        });
        return;
    }

    // Reset the current claim and round state
    gameState.currentClaim = null;
    gameState.roundActive = false;

    // Players need to roll for the next round
    gameState.players.forEach((p) => {
        p.hasRolled = false;
        p.roll = null;
    });
    gameState.allPlayersRolled = false;
}

// Handle the player's roll
function handlePlayerRoll(gameCode: string, playerId: string) {
    let gameState = games[gameCode];
    let player = gameState.players.find((p) => p.id === playerId);

    if (player && !player.hasRolled) {
        // Player rolls the die
        player.roll = rollDie();
        player.hasRolled = true;

        // Send the roll result privately to the player
        if (player.ws) {
            player.ws.send(
                JSON.stringify({ action: "roll", roll: player.roll })
            );
        }

        // Check if all players have rolled
        if (gameState.players.every((p) => p.hasRolled)) {
            gameState.allPlayersRolled = true;

            // Broadcast all rolls to everyone and announce the round starter
            revealAllRollsAndStartNextRound(gameCode);
        }
    } else {
        sendErrorToPlayer(gameCode, playerId, "You have already rolled.");
    }
}

// Reveal all rolls and determine the next round's starting player
function revealAllRollsAndStartNextRound(gameCode: string) {
    let gameState = games[gameCode];

    // Find the player with the highest roll
    let highestRoll = Math.max(...gameState.players.map((p) => p.roll!));
    let startingPlayer = gameState.players.find(
        (p) => p.roll === highestRoll
    )!.id;

    // Broadcast everyone's roll
    broadcastMessageToAll(gameCode, {
        action: "revealRolls",
        rolls: gameState.players.map((p) => ({ playerId: p.id, roll: p.roll })),
    });

    // Update the turnIndex and currentPlayer for the next round
    gameState.turnIndex = gameState.players.findIndex(
        (p) => p.id === startingPlayer
    );
    gameState.currentPlayer = startingPlayer;

    // Reset player rolls for the next round
    gameState.players.forEach((p) => {
        p.hasRolled = false;
        p.roll = null;
    });

    // Start the next round after revealing rolls
    broadcastGameState(gameCode);
}

// Utility to roll a die (returns a value between 1 and 6)
function rollDie(): number {
    return Math.floor(Math.random() * 6) + 1;
}

// Utility to send an error message to a specific player
function sendErrorToPlayer(
    gameCode: string,
    playerId: string,
    message: string
) {
    let gameState = games[gameCode];
    const player = gameState.players.find((p) => p.id === playerId);
    if (player && player.ws && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify({ error: message }));
    }
}

// Utility to broadcast the game state to all players
// Utility to broadcast the sanitized game state to all players
function broadcastGameState(gameCode: string) {
    const gameState = games[gameCode];

    // Create a sanitized version of the gameState without the WebSocket (ws) reference
    const sanitizedGameState = {
        ...gameState,
        players: gameState.players.map((player) => ({
            ...player,
            ws: undefined, // Exclude the WebSocket reference
            playerId: undefined,
            // exlude the playerId
        })),
    };

    // Send the sanitized game state to each player
    gameState.players.forEach((player) => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(sanitizedGameState));
        }
    });
}

// Utility to broadcast a specific message to all players
function broadcastMessageToAll(gameCode: string, message: any) {
    const gameState = games[gameCode];

    // Send the message to each player, excluding the ws property
    gameState.players.forEach((player) => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

// Utility to validate the new claim based on the previous claim
function isValidClaim(
    previousClaim: { quantity: number; value: number },
    newClaim: { quantity: number; value: number }
): boolean {
    return (
        newClaim.quantity > previousClaim.quantity ||
        (newClaim.quantity === previousClaim.quantity &&
            newClaim.value > previousClaim.value)
    );
}

// Utility to count the total number of dice showing the specified value across all players
function countDice(gameCode: string, value: number): number {
    const gameState = games[gameCode];
    return gameState.players.reduce((total, player) => {
        return total + player.remainingDice;
    }, 0);
}
