"use client";

import { useMemo, useState } from "react";
import { MissionCard, type MissionStatus } from "@/components/feature/MissionCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { missionsMock, missionPeriods, PERIOD_LABEL, type MissionPeriod } from "@/mocks/missionsMock";
import { PartyPopper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EcoMascot } from "@/components/feature/EcoMascot";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { cn } from "@/lib/utils";

const SORT_ORDER: Record<MissionStatus, number> = {
  in_progress: 0,
  completed: 1,
  claimed: 2,
};

export default function MisiPage() {
  const { ecoSummary } = useEcoTracker();
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [levelUpFor, setLevelUpFor] = useState<MissionPeriod | null>(null);
  const [bounceId, setBounceId] = useState<string | null>(null);

  const missions = useMemo(
    () =>
      missionsMock.map((m) =>
        claimedIds.has(m.id) ? { ...m, status: "claimed" as const } : m
      ),
    [claimedIds]
  );

  const handleClaim = (period: MissionPeriod, missionId: string) => {
    setBounceId(missionId);
    setTimeout(() => setBounceId(null), 400);
    setClaimedIds((prev) => new Set(prev).add(missionId));
    setLevelUpFor(period);
  };

  const renderPeriod = (period: MissionPeriod) => {
    const list = missions
      .filter((m) => m.period === period)
      .sort(
        (a, b) =>
          SORT_ORDER[a.status] - SORT_ORDER[b.status] ||
          b.targetProgress / 100 - a.targetProgress / 100
      );

    if (list.length === 0) {
      return (
        <EmptyState
          illustration="empty-missions"
          title={`Belum ada misi ${PERIOD_LABEL[period].toLowerCase()}`}
          description={`Belum ada misi ${PERIOD_LABEL[period].toLowerCase()} saat ini. Cek lagi nanti ya!`}
        />
      );
    }

    return (
      <div className="space-y-4">
        {list.map((mission, index) => (
          <div
            key={mission.id}
            className={cn(
              "animate-fade-up",
              bounceId === mission.id && "scale-95 transition-transform"
            )}
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <MissionCard
              title={mission.title}
              description={mission.description}
              currentProgress={mission.currentProgress}
              targetProgress={mission.targetProgress}
              unit={mission.unit}
              xpReward={mission.xpReward}
              pointsReward={mission.pointsReward}
              status={mission.status}
              deadline={mission.deadline}
              onClaim={() => handleClaim(period, mission.id)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Misi Ekologi</h1>
        <p className="text-muted-foreground mt-1">
          Selesaikan misi, kumpulkan XP dan Poin untuk naik level
        </p>
      </div>

      <Tabs defaultValue="harian" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {missionPeriods.map((period) => (
            <TabsTrigger key={period} value={period}>
              {PERIOD_LABEL[period]}
            </TabsTrigger>
          ))}
        </TabsList>
        {missionPeriods.map((period) => (
          <TabsContent key={period} value={period} className="mt-4">
            {renderPeriod(period)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Level up modal */}
      <Dialog open={levelUpFor !== null} onOpenChange={(open) => !open && setLevelUpFor(null)}>
        <DialogContent className="text-center sm:max-w-sm">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg" aria-hidden="true">
            {["bg-green-500", "bg-amber-400", "bg-emerald-500", "bg-lime-400", "bg-teal-400", "bg-green-600", "bg-yellow-400", "bg-emerald-400"].map(
              (color, i) => (
                <span
                  key={i}
                  className={cn(
                    "animate-confetti-fall absolute top-2 block h-2.5 w-2.5 rounded-sm",
                    color
                  )}
                  style={{
                    left: `${8 + i * 12}%`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              )
            )}
          </div>
          <div className="flex justify-center">
            <EcoMascot stage={3} size="lg" animated />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              Level Up!
              <PartyPopper className="h-5 w-5 text-amber-500" aria-hidden="true" />
            </DialogTitle>
            <DialogDescription className="text-center">
              Selamat! Maskotmu berevolusi ke tahap berikutnya. Terus semangat mendaur ulang!
            </DialogDescription>
          </DialogHeader>
          <p className="text-center text-sm text-muted-foreground">
            Saldo Eco-Points kamu: <strong>{ecoSummary?.totalEcoPoints ?? 0}</strong>
          </p>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setLevelUpFor(null)}>Yeay!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
