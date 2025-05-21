import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HealthStatus {
  status: 'excellent' | 'good' | 'fair' | 'needs-attention' | 'critical';
  color: string;
  message: string;
}

interface HouseHealthScore {
  id: number;
  userId: number;
  overallScore: number;
  dailyScore: number;
  weeklyScore: number;
  monthlyScore: number;
  seasonalScore: number;
  annualScore: number;
  lastCalculated: string;
  createdAt: string;
  updatedAt: string | null;
}

interface HealthScoreResponse {
  score: HouseHealthScore;
  status: HealthStatus;
  recommendations: string[];
}

interface HouseHealthScoreProps {
  className?: string;
}

export function HouseHealthCard({ className }: HouseHealthScoreProps) {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [needleRotation, setNeedleRotation] = useState(0);
  const [selectedTab, setSelectedTab] = useState("overall");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data, isLoading, refetch } = useQuery<HealthScoreResponse>({
    queryKey: ['/api/house-health'],
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      // Calculate needle rotation based on selected score
      let score = data.score.overallScore;
      
      if (selectedTab === "daily") {
        score = data.score.dailyScore;
      } else if (selectedTab === "weekly") {
        score = data.score.weeklyScore;
      } else if (selectedTab === "monthly") {
        score = data.score.monthlyScore;
      } else if (selectedTab === "seasonal") {
        score = data.score.seasonalScore;
      } else if (selectedTab === "annual") {
        score = data.score.annualScore;
      }
      
      // Convert score (0-100) to angle (-130 to 130 degrees)
      // We're mapping 0 -> -130, 50 -> 0, 100 -> 130
      const angle = (score / 100) * 260 - 130;
      setNeedleRotation(angle);
      
      // Draw gauge
      drawGauge(canvasRef.current, score);
    }
  }, [data, selectedTab]);

  // Function to draw the gauge
  const drawGauge = (canvas: HTMLCanvasElement | null, score: number) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.45; // Move center point up slightly
    const radius = Math.min(centerX, centerY) * 0.82; // Reduce overall radius
    
    // Add shadow for the gauge
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    // Draw the colored arc segments with gradient effects
    const startAngle = Math.PI + Math.PI * 0.3;
    const endAngle = Math.PI * 2 - Math.PI * 0.3;
    const angleRange = endAngle - startAngle;
    const arcWidth = radius * 0.2; // thinner, more professional looking
    
    // Draw background track
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.lineWidth = arcWidth;
    ctx.strokeStyle = '#f1f5f9'; // slate-100
    ctx.stroke();
    
    // Critical (red) segment
    const criticalGrad = ctx.createLinearGradient(
      centerX - radius, centerY, centerX + radius, centerY
    );
    criticalGrad.addColorStop(0, '#ef4444');
    criticalGrad.addColorStop(1, '#dc2626');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + angleRange * 0.2, false);
    ctx.lineWidth = arcWidth;
    ctx.strokeStyle = criticalGrad;
    ctx.stroke();
    
    // Needs Attention (orange) segment
    const attentionGrad = ctx.createLinearGradient(
      centerX - radius, centerY, centerX + radius, centerY
    );
    attentionGrad.addColorStop(0, '#f97316');
    attentionGrad.addColorStop(1, '#ea580c');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + angleRange * 0.2, startAngle + angleRange * 0.4, false);
    ctx.lineWidth = arcWidth;
    ctx.strokeStyle = attentionGrad;
    ctx.stroke();
    
    // Fair (yellow) segment
    const fairGrad = ctx.createLinearGradient(
      centerX - radius, centerY, centerX + radius, centerY
    );
    fairGrad.addColorStop(0, '#eab308');
    fairGrad.addColorStop(1, '#ca8a04');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + angleRange * 0.4, startAngle + angleRange * 0.6, false);
    ctx.lineWidth = arcWidth;
    ctx.strokeStyle = fairGrad;
    ctx.stroke();
    
    // Good (light green) segment
    const goodGrad = ctx.createLinearGradient(
      centerX - radius, centerY, centerX + radius, centerY
    );
    goodGrad.addColorStop(0, '#84cc16');
    goodGrad.addColorStop(1, '#65a30d');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + angleRange * 0.6, startAngle + angleRange * 0.8, false);
    ctx.lineWidth = arcWidth;
    ctx.strokeStyle = goodGrad;
    ctx.stroke();
    
    // Excellent (green) segment
    const excellentGrad = ctx.createLinearGradient(
      centerX - radius, centerY, centerX + radius, centerY
    );
    excellentGrad.addColorStop(0, '#22c55e');
    excellentGrad.addColorStop(1, '#16a34a');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + angleRange * 0.8, endAngle, false);
    ctx.lineWidth = arcWidth;
    ctx.strokeStyle = excellentGrad;
    ctx.stroke();
    
    // Reset shadow for other elements
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw ticks
    for (let i = 0; i <= 10; i++) {
      const tickAngle = startAngle + (i / 10) * angleRange;
      const tickLength = i % 5 === 0 ? radius * 0.15 : radius * 0.08;
      const outerRadius = radius + arcWidth/2 + 2;
      
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(tickAngle) * outerRadius,
        centerY + Math.sin(tickAngle) * outerRadius
      );
      ctx.lineTo(
        centerX + Math.cos(tickAngle) * (outerRadius + tickLength),
        centerY + Math.sin(tickAngle) * (outerRadius + tickLength)
      );
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.strokeStyle = '#94a3b8'; // slate-400
      ctx.stroke();
    }
    
    // Draw needle with gradient
    const needleLength = radius * 0.75; // Reduced from 0.95 to make needle shorter
    const needleAngle = startAngle + (score / 100) * angleRange;
    const needleWidth = 3; // Slightly thinner needle
    
    // Add a subtle shadow for the needle
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    
    // Draw the needle with gradient
    const needleGrad = ctx.createLinearGradient(
      centerX, centerY,
      centerX + Math.cos(needleAngle) * needleLength,
      centerY + Math.sin(needleAngle) * needleLength
    );
    needleGrad.addColorStop(0, '#475569'); // slate-600
    needleGrad.addColorStop(1, '#334155'); // slate-700
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * needleLength,
      centerY + Math.sin(needleAngle) * needleLength
    );
    ctx.lineWidth = needleWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = needleGrad;
    ctx.stroke();
    
    // Draw center circle with gradient
    const centerGrad = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 15
    );
    centerGrad.addColorStop(0, '#475569'); // slate-600
    centerGrad.addColorStop(1, '#334155'); // slate-700
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2, false);
    ctx.fillStyle = centerGrad;
    ctx.fill();
    
    // Add a white dot in the center for polish
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2, false);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw text score in a stylish container
    const scoreBoxWidth = 60;
    const scoreBoxHeight = 36; // Slightly shorter
    const scoreBoxY = centerY + radius * 0.3; // Moved up closer to gauge
    
    // Draw score box
    ctx.beginPath();
    ctx.roundRect(
      centerX - scoreBoxWidth/2,
      scoreBoxY,
      scoreBoxWidth,
      scoreBoxHeight,
      6
    );
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowOffsetY = 2;
    ctx.fill();
    
    // Draw score value
    ctx.shadowBlur = 0;
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.textAlign = 'center';
    ctx.fillText(`${score}`, centerX, scoreBoxY + 27);
    
    // Add labels at key positions around the gauge
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#64748b'; // slate-500
    
    // Label positions
    const labelRadius = radius + arcWidth/2 + 20;
    const positions = [
      { angle: startAngle, text: '0', align: 'left' },
      { angle: startAngle + angleRange * 0.25, text: '25', align: 'center' },
      { angle: startAngle + angleRange * 0.5, text: '50', align: 'center' },
      { angle: startAngle + angleRange * 0.75, text: '75', align: 'center' },
      { angle: endAngle, text: '100', align: 'right' }
    ];
    
    // Draw labels
    positions.forEach(pos => {
      const x = centerX + Math.cos(pos.angle) * labelRadius;
      const y = centerY + Math.sin(pos.angle) * labelRadius;
      ctx.textAlign = pos.align as CanvasTextAlign;
      ctx.fillText(pos.text, x, y);
    });
  };

  const handleRecalculate = () => {
    fetch('/api/house-health/calculate', { method: 'POST' })
      .then(response => response.json())
      .then(() => {
        refetch();
      })
      .catch(error => {
        console.error('Error recalculating score:', error);
      });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">House Health Score</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-pulse w-full flex flex-col items-center">
            <div className="h-40 w-40 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Your Home Health Score</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Your home health score measures how well you maintain your home
                    based on completed tasks across different frequencies.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8"
            onClick={handleRecalculate}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span>Recalculate</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        {data && (
          <div className="flex flex-col items-center">
            <Tabs 
              defaultValue="overall" 
              className="w-full"
              value={selectedTab}
              onValueChange={setSelectedTab}
            >
              <TabsList className="grid grid-cols-6 h-7 mb-2">
                <TabsTrigger value="overall" className="text-xs">Overall</TabsTrigger>
                <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
                <TabsTrigger value="seasonal" className="text-xs">Seasonal</TabsTrigger>
                <TabsTrigger value="annual" className="text-xs">Annual</TabsTrigger>
              </TabsList>
              
              <div className="relative flex justify-center">
                <canvas 
                  ref={canvasRef}
                  width={280}
                  height={180}
                  className="my-0"
                />
              </div>
              
              <div className="mb-2">
                <div 
                  className="text-center py-1.5 px-4 rounded-md" 
                  style={{ 
                    backgroundColor: `${data.status.color}15`, 
                    color: data.status.color
                  }}
                >
                  <p className="font-semibold text-sm">{data.status.message}</p>
                </div>
              </div>
            </Tabs>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="mb-1 h-7 px-2 text-xs"
            >
              {showRecommendations ? "Hide" : "Show"} Recommendations
            </Button>
            
            {showRecommendations && (
              <div className="w-full p-3 bg-slate-50 rounded-md mb-2">
                <h4 className="font-medium mb-1 text-sm">Recommendations</h4>
                <ul className="text-xs space-y-0.5">
                  {data.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}