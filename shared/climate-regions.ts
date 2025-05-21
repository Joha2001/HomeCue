// Climate regions based on USDA hardiness zones and general climate patterns
export enum ClimateRegion {
  NORTHEAST = "northeast",           // Cold winters, moderate summers
  SOUTHEAST = "southeast",           // Hot humid summers, mild winters
  MIDWEST = "midwest",               // Cold winters, hot summers
  SOUTHWEST = "southwest",           // Hot dry summers, mild winters
  WEST_COAST = "west_coast",         // Mediterranean climate
  NORTHWEST = "northwest",           // Mild, rainy climate
  HAWAII_TROPICAL = "hawaii_tropical", // Tropical climate
  ALASKA = "alaska",                 // Subarctic climate
}

// Map of US states to climate regions
export const stateToClimateRegion: { [key: string]: ClimateRegion } = {
  // Northeast
  "ME": ClimateRegion.NORTHEAST,
  "NH": ClimateRegion.NORTHEAST,
  "VT": ClimateRegion.NORTHEAST,
  "MA": ClimateRegion.NORTHEAST,
  "RI": ClimateRegion.NORTHEAST,
  "CT": ClimateRegion.NORTHEAST,
  "NY": ClimateRegion.NORTHEAST,
  "NJ": ClimateRegion.NORTHEAST,
  "PA": ClimateRegion.NORTHEAST,
  
  // Southeast
  "DE": ClimateRegion.SOUTHEAST,
  "MD": ClimateRegion.SOUTHEAST,
  "VA": ClimateRegion.SOUTHEAST,
  "WV": ClimateRegion.SOUTHEAST,
  "NC": ClimateRegion.SOUTHEAST,
  "SC": ClimateRegion.SOUTHEAST,
  "GA": ClimateRegion.SOUTHEAST,
  "FL": ClimateRegion.SOUTHEAST,
  "AL": ClimateRegion.SOUTHEAST,
  "MS": ClimateRegion.SOUTHEAST,
  "TN": ClimateRegion.SOUTHEAST,
  "KY": ClimateRegion.SOUTHEAST,
  "LA": ClimateRegion.SOUTHEAST,
  "AR": ClimateRegion.SOUTHEAST,
  
  // Midwest
  "OH": ClimateRegion.MIDWEST,
  "MI": ClimateRegion.MIDWEST,
  "IN": ClimateRegion.MIDWEST,
  "IL": ClimateRegion.MIDWEST,
  "WI": ClimateRegion.MIDWEST,
  "MN": ClimateRegion.MIDWEST,
  "IA": ClimateRegion.MIDWEST,
  "MO": ClimateRegion.MIDWEST,
  "ND": ClimateRegion.MIDWEST,
  "SD": ClimateRegion.MIDWEST,
  "NE": ClimateRegion.MIDWEST,
  "KS": ClimateRegion.MIDWEST,
  
  // Southwest
  "OK": ClimateRegion.SOUTHWEST,
  "TX": ClimateRegion.SOUTHWEST,
  "NM": ClimateRegion.SOUTHWEST,
  "AZ": ClimateRegion.SOUTHWEST,
  "NV": ClimateRegion.SOUTHWEST,
  "UT": ClimateRegion.SOUTHWEST,
  
  // West Coast
  "CA": ClimateRegion.WEST_COAST,
  
  // Northwest
  "WA": ClimateRegion.NORTHWEST,
  "OR": ClimateRegion.NORTHWEST,
  "ID": ClimateRegion.NORTHWEST,
  "MT": ClimateRegion.NORTHWEST,
  "WY": ClimateRegion.NORTHWEST,
  "CO": ClimateRegion.NORTHWEST,
  
  // Special regions
  "HI": ClimateRegion.HAWAII_TROPICAL,
  "AK": ClimateRegion.ALASKA,
};

// Full state names for display
export const stateNames: { [key: string]: string } = {
  "AL": "Alabama",
  "AK": "Alaska",
  "AZ": "Arizona",
  "AR": "Arkansas",
  "CA": "California",
  "CO": "Colorado",
  "CT": "Connecticut",
  "DE": "Delaware",
  "FL": "Florida",
  "GA": "Georgia",
  "HI": "Hawaii",
  "ID": "Idaho",
  "IL": "Illinois",
  "IN": "Indiana",
  "IA": "Iowa",
  "KS": "Kansas",
  "KY": "Kentucky",
  "LA": "Louisiana",
  "ME": "Maine",
  "MD": "Maryland",
  "MA": "Massachusetts",
  "MI": "Michigan",
  "MN": "Minnesota",
  "MS": "Mississippi",
  "MO": "Missouri",
  "MT": "Montana",
  "NE": "Nebraska",
  "NV": "Nevada",
  "NH": "New Hampshire",
  "NJ": "New Jersey",
  "NM": "New Mexico",
  "NY": "New York",
  "NC": "North Carolina",
  "ND": "North Dakota",
  "OH": "Ohio",
  "OK": "Oklahoma",
  "OR": "Oregon",
  "PA": "Pennsylvania",
  "RI": "Rhode Island",
  "SC": "South Carolina",
  "SD": "South Dakota",
  "TN": "Tennessee",
  "TX": "Texas",
  "UT": "Utah",
  "VT": "Vermont",
  "VA": "Virginia",
  "WA": "Washington",
  "WV": "West Virginia",
  "WI": "Wisconsin",
  "WY": "Wyoming"
};

// Season type and definition
export enum Season {
  SPRING = "spring",
  SUMMER = "summer",
  FALL = "fall",
  WINTER = "winter"
}

// Function to get current season based on current date
export function getCurrentSeason(): Season {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan-Dec)
  
  if (month >= 2 && month <= 4) return Season.SPRING;     // Mar-May
  if (month >= 5 && month <= 7) return Season.SUMMER;     // Jun-Aug
  if (month >= 8 && month <= 10) return Season.FALL;      // Sep-Nov
  return Season.WINTER;                                  // Dec-Feb
}

// Get climate region display name
export function getClimateRegionName(region: ClimateRegion): string {
  switch (region) {
    case ClimateRegion.NORTHEAST: return "Northeast";
    case ClimateRegion.SOUTHEAST: return "Southeast";
    case ClimateRegion.MIDWEST: return "Midwest";
    case ClimateRegion.SOUTHWEST: return "Southwest";
    case ClimateRegion.WEST_COAST: return "West Coast";
    case ClimateRegion.NORTHWEST: return "Northwest";
    case ClimateRegion.HAWAII_TROPICAL: return "Hawaii/Tropical";
    case ClimateRegion.ALASKA: return "Alaska";
    default: return "Unknown Region";
  }
}