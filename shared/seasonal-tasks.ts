import { ClimateRegion, Season } from "./climate-regions";
import { z } from "zod";

// Define the seasonal task type
export const seasonalTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  estimatedTime: z.string(), // e.g. "30 mins", "2 hours"
  tools: z.array(z.string()).optional(),
  frequency: z.enum(["once", "monthly", "as needed", "seasonal"]).default("seasonal"),
  isOutdoor: z.boolean().default(true),
  imageUrl: z.string().optional(),
  climateRegions: z.array(z.nativeEnum(ClimateRegion)),
  seasons: z.array(z.nativeEnum(Season)),
});

// Default frequency to set for all tasks
const DEFAULT_FREQUENCY = "seasonal" as const;

export type SeasonalTask = z.infer<typeof seasonalTaskSchema>;

// Helper function to add default frequency to tasks
const addFrequency = (task: any): SeasonalTask => ({
  ...task,
  frequency: DEFAULT_FREQUENCY
});

// Database of seasonal tasks by region and season
// Map all our tasks to add the frequency field
// Raw task data without frequency
const rawTasks = [
  // --- SPRING Tasks ---
  {
    id: "spring-lawn-care",
    title: "Spring Lawn Care",
    description: "Prepare your lawn for growing season: rake, dethatch, and apply pre-emergent weed control.",
    priority: "medium",
    estimatedTime: "3-4 hours",
    tools: ["Rake", "Dethatcher", "Spreader"],
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.NORTHEAST, 
      ClimateRegion.SOUTHEAST, 
      ClimateRegion.MIDWEST, 
      ClimateRegion.NORTHWEST
    ],
    seasons: [Season.SPRING],
  },
  {
    id: "spring-rain-gutters",
    title: "Clean Rain Gutters",
    description: "Clear debris from rain gutters and downspouts to ensure proper drainage during spring showers.",
    priority: "high",
    estimatedTime: "1-2 hours",
    tools: ["Ladder", "Gloves", "Gutter scoop"],
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.NORTHEAST, 
      ClimateRegion.SOUTHEAST, 
      ClimateRegion.MIDWEST,
      ClimateRegion.NORTHWEST, 
      ClimateRegion.WEST_COAST
    ],
    seasons: [Season.SPRING, Season.FALL],
  },
  {
    id: "spring-ac-maintenance",
    title: "A/C System Maintenance",
    description: "Clean filters, check refrigerant levels, and ensure your A/C system is ready for summer.",
    priority: "high",
    estimatedTime: "1 hour",
    isOutdoor: false,
    climateRegions: [
      ClimateRegion.SOUTHEAST, 
      ClimateRegion.SOUTHWEST, 
      ClimateRegion.MIDWEST,
      ClimateRegion.WEST_COAST,
      ClimateRegion.HAWAII_TROPICAL
    ],
    seasons: [Season.SPRING],
  },
  {
    id: "spring-inspect-roof",
    title: "Inspect Roof for Winter Damage",
    description: "Check for loose shingles, leaks, or damage caused by winter weather.",
    priority: "high",
    estimatedTime: "1 hour",
    tools: ["Ladder", "Binoculars"],
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.NORTHEAST, 
      ClimateRegion.MIDWEST, 
      ClimateRegion.NORTHWEST,
      ClimateRegion.ALASKA
    ],
    seasons: [Season.SPRING],
  },
  
  // --- SUMMER Tasks ---
  {
    id: "summer-irrigation",
    title: "Adjust Irrigation System",
    description: "Modify watering schedule to account for hot, dry conditions and check for leaks.",
    priority: "medium",
    estimatedTime: "1-2 hours",
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.SOUTHWEST, 
      ClimateRegion.WEST_COAST, 
      ClimateRegion.SOUTHEAST
    ],
    seasons: [Season.SUMMER],
  },
  {
    id: "summer-pest-control",
    title: "Perimeter Pest Control",
    description: "Inspect and treat foundation and entry points to prevent summer insects from entering home.",
    priority: "medium",
    estimatedTime: "1-2 hours",
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.SOUTHEAST, 
      ClimateRegion.MIDWEST, 
      ClimateRegion.SOUTHWEST,
      ClimateRegion.HAWAII_TROPICAL
    ],
    seasons: [Season.SUMMER],
  },
  {
    id: "summer-hurricane-prep",
    title: "Hurricane Preparedness",
    description: "Check window seals, inspect roof, and prepare emergency supplies before hurricane season.",
    priority: "high",
    estimatedTime: "3-4 hours",
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.SOUTHEAST, 
      ClimateRegion.HAWAII_TROPICAL
    ],
    seasons: [Season.SUMMER],
  },
  
  // --- FALL Tasks ---
  {
    id: "fall-leaf-removal",
    title: "Leaf Removal",
    description: "Clear fallen leaves from lawn, gutters, and garden beds to prevent lawn damage and drainage issues.",
    priority: "medium",
    estimatedTime: "2-3 hours",
    tools: ["Rake", "Leaf blower", "Yard waste bags"],
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.NORTHEAST, 
      ClimateRegion.SOUTHEAST, 
      ClimateRegion.MIDWEST, 
      ClimateRegion.NORTHWEST
    ],
    seasons: [Season.FALL],
  },
  {
    id: "fall-furnace-maintenance",
    title: "Furnace Maintenance",
    description: "Change filters, clean ducts, and have heating system inspected before winter.",
    priority: "high",
    estimatedTime: "1-2 hours",
    isOutdoor: false,
    climateRegions: [
      ClimateRegion.NORTHEAST, 
      ClimateRegion.MIDWEST, 
      ClimateRegion.NORTHWEST,
      ClimateRegion.ALASKA
    ],
    seasons: [Season.FALL],
  },
  {
    id: "fall-winterize-irrigation",
    title: "Winterize Irrigation System",
    description: "Drain and shut down irrigation system to prevent freezing damage.",
    priority: "high",
    estimatedTime: "1-2 hours",
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.NORTHEAST, 
      ClimateRegion.MIDWEST, 
      ClimateRegion.NORTHWEST
    ],
    seasons: [Season.FALL],
  },
  
  // --- WINTER Tasks ---
  {
    id: "winter-seal-drafts",
    title: "Seal Drafts and Insulate",
    description: "Check windows and doors for air leaks and add weatherstripping where needed.",
    priority: "medium",
    estimatedTime: "2-3 hours",
    isOutdoor: false,
    climateRegions: [
      ClimateRegion.NORTHEAST, 
      ClimateRegion.MIDWEST, 
      ClimateRegion.NORTHWEST,
      ClimateRegion.ALASKA
    ],
    seasons: [Season.WINTER],
  },
  {
    id: "winter-snow-removal-plan",
    title: "Snow Removal Planning",
    description: "Stock up on ice melt, check snow blower, and prepare snow removal equipment.",
    priority: "high",
    estimatedTime: "1 hour",
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.NORTHEAST, 
      ClimateRegion.MIDWEST, 
      ClimateRegion.NORTHWEST,
      ClimateRegion.ALASKA
    ],
    seasons: [Season.WINTER],
  },
  {
    id: "winter-prevent-freezing",
    title: "Prevent Pipe Freezing",
    description: "Insulate exposed pipes and check for vulnerable water lines during extreme cold.",
    priority: "high",
    estimatedTime: "1-2 hours",
    isOutdoor: false,
    climateRegions: [
      ClimateRegion.NORTHEAST, 
      ClimateRegion.MIDWEST, 
      ClimateRegion.NORTHWEST,
      ClimateRegion.ALASKA
    ],
    seasons: [Season.WINTER],
  },
  
  // --- WEST COAST Specific ---
  {
    id: "westcoast-wildfire-prep",
    title: "Wildfire Preparedness",
    description: "Clear brush around home, clean gutters of debris, and create defensible space.",
    priority: "high",
    estimatedTime: "3-4 hours",
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.WEST_COAST, 
      ClimateRegion.SOUTHWEST, 
      ClimateRegion.NORTHWEST
    ],
    seasons: [Season.SPRING, Season.SUMMER],
  },
  
  // --- TROPICAL Specific ---
  {
    id: "tropical-mold-prevention",
    title: "Mold Prevention",
    description: "Check for and address moisture issues in high-humidity areas to prevent mold growth.",
    priority: "high",
    estimatedTime: "2 hours",
    isOutdoor: false,
    climateRegions: [
      ClimateRegion.HAWAII_TROPICAL, 
      ClimateRegion.SOUTHEAST
    ],
    seasons: [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER],
  },
  
  // --- SOUTHWEST Specific ---
  {
    id: "southwest-shade-inspection",
    title: "Shade Structures and Window Coverings",
    description: "Check outdoor shade structures and window treatments to prepare for extreme heat.",
    priority: "medium",
    estimatedTime: "1-2 hours",
    isOutdoor: true,
    climateRegions: [
      ClimateRegion.SOUTHWEST
    ],
    seasons: [Season.SPRING],
  },
];

// Process all tasks with the frequency field
export const seasonalTasks: SeasonalTask[] = rawTasks.map(task => addFrequency(task));

// Function to get tasks for a specific climate region and season
export function getTasksByRegionAndSeason(region: ClimateRegion, season: Season): SeasonalTask[] {
  return seasonalTasks.filter(task => 
    task.climateRegions.includes(region) && 
    task.seasons.includes(season)
  );
}

// Function to get current seasonal tasks based on region
export function getCurrentSeasonalTasks(region: ClimateRegion): SeasonalTask[] {
  const currentSeason = getCurrentSeason();
  return getTasksByRegionAndSeason(region, currentSeason);
}

// Helper function to get current season
function getCurrentSeason(): Season {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan-Dec)
  
  if (month >= 2 && month <= 4) return Season.SPRING;     // Mar-May
  if (month >= 5 && month <= 7) return Season.SUMMER;     // Jun-Aug
  if (month >= 8 && month <= 10) return Season.FALL;      // Sep-Nov
  return Season.WINTER;                                  // Dec-Feb
}