import { create } from "zustand";

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

export const useGameState = create<GameState>((set) => ({
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