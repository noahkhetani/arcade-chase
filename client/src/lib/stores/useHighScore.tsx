import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LeaderboardEntry {
  id?: number;
  playerName: string;
  score: number;
  createdAt: Date | string;
  level: number;
  // Legacy support for localStorage entries
  name?: string;
  date?: string;
}

interface HighScoreState {
  personalHighScore: number;
  allTimeHighScore: number;
  leaderboard: LeaderboardEntry[];
  playerName: string;
  updatePersonalHighScore: (score: number, level: number) => boolean;
  updateAllTimeHighScore: (score: number, playerName: string, level: number) => boolean;
  addToLeaderboard: (name: string, score: number, level: number) => Promise<void>;
  resetPersonalHighScore: () => void;
  setPlayerName: (name: string) => void;
  getTopScores: (limit?: number) => LeaderboardEntry[];
  clearPlayerFromLeaderboard: (playerName: string) => void;
  cleanupDuplicates: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
}

export const useHighScore = create<HighScoreState>()(
  persist(
    (set, get) => ({
      personalHighScore: 0,
      allTimeHighScore: 0,
      leaderboard: [],
      playerName: "Player",
      
      updatePersonalHighScore: (score: number, level: number) => {
        const currentPersonalHigh = get().personalHighScore;
        if (score > currentPersonalHigh) {
          set({ personalHighScore: score });
          
          // Also check if it's a new all-time high
          const state = get();
          if (score > state.allTimeHighScore) {
            state.updateAllTimeHighScore(score, state.playerName, level);
          }
          
          // Add to leaderboard
          state.addToLeaderboard(state.playerName, score, level);
          
          return true; // New personal high score
        }
        return false;
      },
      
      updateAllTimeHighScore: (score: number, playerName: string, level: number) => {
        const currentAllTimeHigh = get().allTimeHighScore;
        if (score > currentAllTimeHigh) {
          set({ allTimeHighScore: score });
          return true; // New all-time high score
        }
        return false;
      },
      
      addToLeaderboard: async (name: string, score: number, level: number) => {
        try {
          // Send to database
          const response = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              playerName: name,
              score,
              level,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update leaderboard');
          }

          // Refresh leaderboard from database
          const leaderboardResponse = await fetch('/api/leaderboard?limit=10');
          if (leaderboardResponse.ok) {
            const dbLeaderboard = await leaderboardResponse.json();
            set((state) => ({
              ...state,
              leaderboard: dbLeaderboard.map((entry: any) => ({
                playerName: entry.playerName,
                score: entry.score,
                level: entry.level,
                createdAt: entry.createdAt,
                // Legacy support
                name: entry.playerName,
                date: new Date(entry.createdAt).toLocaleDateString()
              }))
            }));
          }
        } catch (error) {
          console.error('Error updating leaderboard:', error);
          // Fallback to localStorage behavior
          set((state) => {
            const existingIndex = state.leaderboard.findIndex(entry => 
              (entry.playerName || entry.name)?.toLowerCase() === name.toLowerCase()
            );
            
            if (existingIndex !== -1) {
              if (score > state.leaderboard[existingIndex].score) {
                state.leaderboard[existingIndex] = {
                  playerName: name,
                  name,
                  score,
                  level,
                  createdAt: new Date().toISOString(),
                  date: new Date().toLocaleDateString()
                };
              }
            } else {
              const newEntry: LeaderboardEntry = {
                playerName: name,
                name,
                score,
                level,
                createdAt: new Date().toISOString(),
                date: new Date().toLocaleDateString()
              };
              state.leaderboard.push(newEntry);
            }
            
            state.leaderboard.sort((a, b) => b.score - a.score);
            state.leaderboard = state.leaderboard.slice(0, 10);
            
            return state;
          });
        }
      },
      
      resetPersonalHighScore: () => {
        set({ personalHighScore: 0 });
      },
      
      clearPlayerFromLeaderboard: (playerName: string) => {
        set((state) => ({
          ...state,
          leaderboard: state.leaderboard.filter(entry => 
            (entry.name || entry.playerName).toLowerCase() !== playerName.toLowerCase()
          )
        }));
      },
      
      setPlayerName: (name: string) => {
        set({ playerName: name.trim() || "Player" });
      },
      
      getTopScores: (limit = 5) => {
        return get().leaderboard.slice(0, limit);
      },

      // Clean up duplicate entries (keep highest score for each player)
      cleanupDuplicates: async () => {
        try {
          // Send cleanup request to database
          const response = await fetch('/api/leaderboard/cleanup', {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error('Failed to cleanup leaderboard');
          }

          // Refresh leaderboard from database
          const leaderboardResponse = await fetch('/api/leaderboard?limit=10');
          if (leaderboardResponse.ok) {
            const dbLeaderboard = await leaderboardResponse.json();
            set((state) => ({
              ...state,
              leaderboard: dbLeaderboard.map((entry: any) => ({
                playerName: entry.playerName,
                score: entry.score,
                level: entry.level,
                createdAt: entry.createdAt,
                // Legacy support
                name: entry.playerName,
                date: new Date(entry.createdAt).toLocaleDateString()
              }))
            }));
          }
        } catch (error) {
          console.error('Error cleaning up leaderboard:', error);
          // Fallback to localStorage cleanup
          set((state) => {
            const playerBest = new Map<string, LeaderboardEntry>();
            
            state.leaderboard.forEach(entry => {
              const normalizedName = (entry.playerName || entry.name || '').toLowerCase();
              const existing = playerBest.get(normalizedName);
              
              if (!existing || entry.score > existing.score) {
                playerBest.set(normalizedName, entry);
              }
            });
            
            const cleanedLeaderboard = Array.from(playerBest.values())
              .sort((a, b) => b.score - a.score)
              .slice(0, 10);
            
            return { ...state, leaderboard: cleanedLeaderboard };
          });
        }
      },

      // Load leaderboard from database
      loadLeaderboard: async () => {
        try {
          const response = await fetch('/api/leaderboard?limit=10');
          if (response.ok) {
            const dbLeaderboard = await response.json();
            set((state) => ({
              ...state,
              leaderboard: dbLeaderboard.map((entry: any) => ({
                playerName: entry.playerName,
                score: entry.score,
                level: entry.level,
                createdAt: entry.createdAt,
                // Legacy support
                name: entry.playerName,
                date: new Date(entry.createdAt).toLocaleDateString()
              }))
            }));
          }
        } catch (error) {
          console.error('Error loading leaderboard:', error);
        }
      }
    }),
    {
      name: "neon-runner-scores",
    }
  )
);
