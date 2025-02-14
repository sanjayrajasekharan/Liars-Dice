import { create } from "zustand";

interface CreateGameResponse {
    gameCode: string;
    message: string;
}

interface JoinGameResponse {
    gameCode: string;
    playerIndex: number;
    message: string;
}

interface Opponent {
    name: string;
    icon: string;
    remainingDice: number;
    dice: number[];
}

interface Player {
    readonly id: string;
    readonly isHost: boolean;
    readonly name: string;
    remainingDice: number;
    dice: number[];
}

interface GameState {
    opponents: Opponent[];
    claim: { quantity: number; value: number };
    turn: number;
    player: Player | null;
    setPlayer: (id: string, name: string, isHost: boolean) => void;
    updateClaim: (quantity: number, value: number) => void;
    updateTurn: (turn: number) => void;
}

export class GameService {
    private static baseUrl = "http://localhost:3000";
    private static wsUrl = "ws://localhost:3000";

    static useGameState = create<GameState>((set) => ({
        opponents: [] as Opponent[],
        updateOpponents: (newOpponents: Opponent[]): void =>
            set({ opponents: newOpponents }),
        claim: { quantity: 0, value: 0 },
        updateClaim: (newQuantity: number, newValue: number): void =>
            set({ claim: { quantity: newQuantity, value: newValue } }),
        turn: 0,
        updateTurn: (newTurn: number): void => set({ turn: newTurn }),
        player: null,
        setPlayer: (id: string, name: string, isHost: boolean) =>
            set((state) => {
                if (state.player) return state;
                return {
                    player: {
                        id: id,
                        isHost,
                        name,
                        remainingDice: 6,
                        dice: [],
                    },
                }
    })
    }));

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
