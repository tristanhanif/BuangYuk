"use client";

import { EcoSummary } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Leaf, Award, Target, TrendingUp } from "lucide-react";
import { cn, formatNumber, getEcoLevel, getNextLevel } from "@/lib/utils";
import { ECO_LEVELS } from "@/lib/constants";

interface CarbonTrackerWidgetProps {
  ecoSummary: EcoSummary | null;
}

export function CarbonTrackerWidget({ ecoSummary }: CarbonTrackerWidgetProps) {
  const totalCO2 = ecoSummary?.totalCO2Saved || 0;
  const totalPoints = ecoSummary?.totalEcoPoints || 0;
  const currentLevel = getEcoLevel(totalPoints);
  const nextLevel = getNextLevel(currentLevel.level);

  const progressToNext = nextLevel
    ? Math.min(100, ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  const treeEquivalent = Math.round(totalCO2 / 21);
  const carKmEquivalent = Math.round(totalCO2 / 0.21);

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mb-3">
              <Leaf className="h-7 w-7" />
            </div>
            <p className="text-3xl font-bold text-foreground">{totalCO2.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">kg CO₂ Terselamatkan</p>
          </div>
          <div className="text-center border-x border-green-200">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-600 mb-3">
              <Award className="h-7 w-7" />
            </div>
            <p className="text-3xl font-bold text-foreground">{formatNumber(totalPoints)}</p>
            <p className="text-sm text-muted-foreground">Eco Points</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-3">
              <Target className="h-7 w-7" />
            </div>
            <p className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              {<currentLevel.badge className="h-6 w-6" aria-hidden="true" />}
              Level {currentLevel.level}
            </p>
            <p className="text-sm text-muted-foreground">{currentLevel.name}</p>
          </div>
        </div>

        {nextLevel && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress ke {nextLevel.name}</span>
              <span className="font-medium">
                {formatNumber(totalPoints - currentLevel.minPoints)} / {formatNumber(nextLevel.minPoints - currentLevel.minPoints)}
              </span>
            </div>
            <Progress value={progressToNext} className="h-3" />
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className={cn("p-4 rounded-lg bg-white/50 border border-green-100")}>
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Ekivalensi Pohon</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{treeEquivalent}</p>
            <p className="text-xs text-muted-foreground">Pohon ditanam (setara)</p>
          </div>
          <div className={cn("p-4 rounded-lg bg-white/50 border border-blue-100")}>
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Jarak Mobil</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(carKmEquivalent)}</p>
            <p className="text-xs text-muted-foreground">km perjalanan mobil</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {ECO_LEVELS.slice(0, currentLevel.level).map((level) => (
            <Badge key={level.level} variant="success" className="text-xs">
              {<level.badge className="h-4 w-4 inline-block" aria-hidden="true" />} {level.name}
            </Badge>
          ))}
          {ECO_LEVELS.slice(currentLevel.level, currentLevel.level + 1).map((level) => (
            <Badge key={level.level} variant="outline" className="text-xs opacity-50">
              {<level.badge className="h-4 w-4 inline-block" aria-hidden="true" />} {level.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}