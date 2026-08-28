"use client";

import { useRouter } from "next/navigation";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { ECO_LEVELS } from "@/lib/constants";
import { getEcoLevel, getNextLevel, formatNumber } from "@/lib/utils";
import { EcoMascot, stageFromXp } from "@/components/feature/EcoMascot";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Award, TrendingUp } from "lucide-react";

export default function LevelPage() {
  const router = useRouter();
  const { ecoSummary, loading } = useEcoTracker();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-56 bg-muted rounded-xl" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  const totalPoints = ecoSummary?.totalEcoPoints || 0;
  const currentLevel = getEcoLevel(totalPoints);
  const nextLevel = getNextLevel(currentLevel.level);
  const progressToNext = nextLevel
    ? Math.min(100, ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/profil")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Profil
      </button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Level Ekologi</h1>
        <p className="text-muted-foreground mt-1">
          Kumpulkan poin untuk naik level dan tumbuhkan EcoMascot-mu
        </p>
      </div>

      {/* Current level card */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-40">
            <EcoMascot stage={stageFromXp(totalPoints)} />
          </div>
          <Badge variant="success" className="mt-4">
            {<currentLevel.badge className="h-4 w-4 inline-block" aria-hidden="true" />} {currentLevel.name} · Level {currentLevel.level}
          </Badge>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {formatNumber(totalPoints)}
            <span className="text-sm font-normal text-muted-foreground"> poin</span>
          </p>

          {nextLevel ? (
            <>
              <Progress value={progressToNext} className="mt-4 h-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                Butuh {formatNumber(nextLevel.minPoints - totalPoints)} poin lagi untuk{" "}
                {<nextLevel.badge className="h-4 w-4 inline-block align-text-bottom text-green-600" aria-hidden="true" />} {nextLevel.name}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Kamu telah mencapai level tertinggi. Hebat!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Level list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Perjalanan Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ECO_LEVELS.map((level) => {
              const isCurrent = level.level === currentLevel.level;
              const isReached = level.level <= currentLevel.level;
              return (
                <div
                  key={level.level}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isCurrent ? "border-green-300 bg-green-50" : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {<level.badge className="h-7 w-7 text-green-600" aria-hidden="true" />}
                    <div>
                      <p className="font-semibold text-foreground text-sm">{level.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Level {level.level} · {level.minPoints === 0 ? "0" : formatNumber(level.minPoints)}+ poin
                      </p>
                    </div>
                  </div>
                  {isCurrent && <Badge variant="success" className="text-xs">Saat Ini</Badge>}
                  {isReached && !isCurrent && <Badge variant="outline" className="text-xs">✓ Tercapai</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-start gap-3 text-sm text-muted-foreground">
          <Award className="h-5 w-5 shrink-0 text-amber-500" />
          <p>
            Dapatkan poin dari setiap setoran sampah, misi harian, dan aktivitas ramah lingkungan
            lainnya. EcoMascot-mu akan tumbuh seiring levelmu yang meningkat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
