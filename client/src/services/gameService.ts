interface CreateGameResponse {
    gameCode: string;
    message: string;
}

interface JoinGameResponse {
    gameCode: string;
    playerIndex: number;
    message: string;
}

export class GameService {
    private static baseUrl = "http://localhost:3000";
    private static wsUrl = "ws://localhost:3000";

    static getOrCreatePlayerId() {
        let id = localStorage.getItem("playerId");
        if (!id) {
            id = crypto.randomUUID();
        }
        return id;
    }

    static async createGame(hostName: string): Promise<CreateGameResponse> {
        const hostId = crypto.randomUUID(); // Generate a unique ID for the host

        const response = await fetch(`${this.baseUrl}/create-game`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                hostId,
                hostName,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create game");
        }

        return response.json();
    }

    static async joinGame(
        gameCode: string,
        playerName: string
    ): Promise<JoinGameResponse> {
        const playerId = crypto.randomUUID(); // Generate a unique ID for the player

        const response = await fetch(`${this.baseUrl}/join-game`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                gameCode,
                playerId,
                playerName,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to join game");
        }

        return response.json();
    }

    static createWebSocketConnection(
        gameCode: string,
        playerId: string
    ): WebSocket {
        const ws = new WebSocket(
            `${this.wsUrl}?gameCode=${gameCode}&playerId=${playerId}`
        );

        ws.onopen = () => {
            console.log("Connected to game server");
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            setTimeout(
                () => this.createWebSocketConnection(gameCode, playerId),
                5000
            );
        };

        return ws;
    }
}
