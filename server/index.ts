import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createGame, joinGame, handleGameConnection } from './gameManager.js';

// Shared state for games
const games = {};

// Set up the Express application
const app = express();
app.use(cors());
app.use(express.json());

// HTTP API Endpoints

app.post("/create-game", (req, res) => {
    const gameCode = createGame(req.body.hostId, req.body.hostName);

    res.status(201).json({ gameCode, message: "Game created, waiting for players to join" });
    console.log(`Game created with code: ${gameCode}`);
});

app.post("/join-game", (req, res) => {
    const { gameCode, playerId, playerName } = req.body;

    const result = joinGame(gameCode, playerId, playerName);

    if (result.error) {
        return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
        gameCode,
        message: `Player ${playerId} (${playerName}) joined the game`,
    });
});

// Create a single HTTP server instance
const server = app.listen(3000, () => {
    console.log("HTTP and WebSocket server is running on port 3000");
});

// Set up the WebSocket server using the same server instance
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    if (!req.url || !req.headers.host) {
        console.error('Invalid connection: Missing URL or Host');
        ws.close(); // Close the connection if there's no URL or Host
        return;
    }

    const fullUrl = `ws://${req.headers.host}${req.url}`;
    const url = new URL(fullUrl);
    const queryParams = url.searchParams;

    const gameCode = queryParams.get('gameCode');
    const playerId = queryParams.get('playerId');

    if (!gameCode || !playerId) {
        console.error('Invalid connection: Missing gameCode or playerId');
        ws.send(JSON.stringify({ error: 'Missing gameCode or playerId' }));
        ws.close(1008, 'Missing gameCode or playerId');
        return;
    }

    console.log(`New player connected: ${playerId} to game: ${gameCode}`);

    handleGameConnection(ws, gameCode, playerId);
});
