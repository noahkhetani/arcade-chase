import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { leaderboard } from "../shared/schema";
import type { InsertLeaderboard, LeaderboardEntry } from "../shared/schema";
import { desc, eq, and } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

export class LeaderboardService {
  // Get top scores with limit
  static async getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
    return await db
      .select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.score))
      .limit(limit);
  }

  // Add or update player score
  static async addOrUpdateScore(playerName: string, score: number, level: number): Promise<void> {
    // Check if player already exists
    const existingEntry = await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.playerName, playerName))
      .limit(1);

    if (existingEntry.length > 0) {
      // Update only if new score is higher
      if (score > existingEntry[0].score) {
        await db
          .update(leaderboard)
          .set({ score, level, createdAt: new Date() })
          .where(eq(leaderboard.playerName, playerName));
      }
    } else {
      // Insert new entry
      await db.insert(leaderboard).values({
        playerName,
        score,
        level,
      });
    }
  }

  // Get player's best score
  static async getPlayerBestScore(playerName: string): Promise<LeaderboardEntry | null> {
    const result = await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.playerName, playerName))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  // Remove duplicate entries (cleanup function)
  static async cleanupDuplicates(): Promise<void> {
    // Get all entries grouped by player name, keeping only the highest score
    const allEntries = await db.select().from(leaderboard);
    const playerBest = new Map<string, LeaderboardEntry>();

    // Find best score for each player
    allEntries.forEach(entry => {
      const existing = playerBest.get(entry.playerName);
      if (!existing || entry.score > existing.score) {
        playerBest.set(entry.playerName, entry);
      }
    });

    // Delete all entries
    await db.delete(leaderboard);

    // Insert only the best entries
    if (playerBest.size > 0) {
      const bestEntries = Array.from(playerBest.values()).map(entry => ({
        playerName: entry.playerName,
        score: entry.score,
        level: entry.level,
      }));
      
      await db.insert(leaderboard).values(bestEntries);
    }
  }

  // Get all-time high score
  static async getAllTimeHighScore(): Promise<number> {
    const result = await db
      .select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.score))
      .limit(1);

    return result.length > 0 ? result[0].score : 0;
  }
}