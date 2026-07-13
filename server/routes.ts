import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { LeaderboardService } from "./db";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Leaderboard API routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const scores = await LeaderboardService.getTopScores(limit);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/leaderboard", async (req, res) => {
    try {
      const { playerName, score, level } = req.body;
      
      if (!playerName || typeof score !== 'number' || typeof level !== 'number') {
        return res.status(400).json({ error: "Invalid data format" });
      }

      await LeaderboardService.addOrUpdateScore(playerName, score, level);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      res.status(500).json({ error: "Failed to update leaderboard" });
    }
  });

  app.get("/api/leaderboard/player/:playerName", async (req, res) => {
    try {
      const { playerName } = req.params;
      const playerScore = await LeaderboardService.getPlayerBestScore(playerName);
      res.json(playerScore);
    } catch (error) {
      console.error("Error fetching player score:", error);
      res.status(500).json({ error: "Failed to fetch player score" });
    }
  });

  app.post("/api/leaderboard/cleanup", async (req, res) => {
    try {
      await LeaderboardService.cleanupDuplicates();
      res.json({ success: true });
    } catch (error) {
      console.error("Error cleaning up leaderboard:", error);
      res.status(500).json({ error: "Failed to cleanup leaderboard" });
    }
  });

  app.get("/api/leaderboard/high-score", async (req, res) => {
    try {
      const highScore = await LeaderboardService.getAllTimeHighScore();
      res.json({ score: highScore });
    } catch (error) {
      console.error("Error fetching high score:", error);
      res.status(500).json({ error: "Failed to fetch high score" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
