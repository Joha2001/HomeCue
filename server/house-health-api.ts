import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { calculateHouseHealthScore, getHealthScoreStatus, getHealthScoreRecommendations } from "./house-health-service";
import { isAuthenticated } from "./auth";

const router = Router();

// Get house health score
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId as number || 1;
    
    // Check if user has a health score
    const existingScore = await storage.getHouseHealthScore(userId);
    
    if (existingScore) {
      // Generate status and recommendations based on score
      const status = getHealthScoreStatus(existingScore.overallScore);
      const recommendations = getHealthScoreRecommendations(existingScore);
      
      return res.json({
        score: existingScore,
        status,
        recommendations
      });
    } else {
      // Demo data when no score exists yet
      const demoScore = {
        id: 0,
        userId,
        overallScore: 65,
        dailyScore: 75,
        weeklyScore: 60,
        monthlyScore: 50,
        seasonalScore: 70,
        annualScore: 80,
        lastCalculated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: null
      };
      
      // Generate status and recommendations
      const status = getHealthScoreStatus(demoScore.overallScore);
      const recommendations = [
        "Complete your first maintenance task to start building your health score",
        "Add seasonal tasks based on your climate region",
        "Set up recurring tasks for regular maintenance items"
      ];
      
      return res.json({
        score: demoScore,
        status,
        recommendations
      });
    }
  } catch (error) {
    console.error("Error fetching house health score:", error);
    res.status(500).json({ message: "Failed to fetch house health score" });
  }
});

// Calculate house health score
router.post("/calculate", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId as number;
    
    // Calculate new health score
    const newScore = await calculateHouseHealthScore(userId);
    
    // Save or update health score
    const existingScore = await storage.getHouseHealthScore(userId);
    
    let savedScore;
    if (existingScore) {
      savedScore = await storage.updateHouseHealthScore(userId, newScore);
    } else {
      savedScore = await storage.createHouseHealthScore(newScore);
    }
    
    // Generate status and recommendations
    const status = getHealthScoreStatus(savedScore.overallScore);
    const recommendations = getHealthScoreRecommendations(savedScore);
    
    res.json({
      score: savedScore,
      status,
      recommendations
    });
  } catch (error) {
    console.error("Error calculating house health score:", error);
    res.status(500).json({ message: "Failed to calculate house health score" });
  }
});

export default router;