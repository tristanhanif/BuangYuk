"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeaderboardRow, type LeaderboardRowProps } from "@/components/feature/LeaderboardRow";
import { EmptyState } from "@/components/ui/empty-state";
import { leaderboardGlobalMock, leaderboardCityMock } from "@/mocks/leaderboardMock";
import { formatNumber } from "@/lib/utils";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type Podium = LeaderboardRowProps & { id: string };

function PodiumSection({ entries }: { entries: Podium[] }) {
  const rank1 = entries.find((e) => e.rank === 1);
  const rank2 = entries.find((e) => e.rank === 2);
  const rank3 = entries.find((e) => e.rank === 3);

  if (!rank1) return null;

  const podiumOrder: Podium[] = [rank2, rank1, rank3].filter(
    (e): e is Podium => Boolean(e)
  );

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-4">
      {podiumOrder.map((entry) => {
        const isFirst = entry.rank === 1;
        return (
          <div
            key={entry.id}
            className={cn(
              "flex flex-col items-center",
              isFirst ? "order-2" : entry.rank === 2 ? "order-1 pb-4" : "order-3 pb-6"
            )}
          >
            {isFirst && <Crown className="mb-1 h-6 w-6 fill-amber-400 text-amber-400" aria-label="Juara 1" />}
            <img
              src={entry.avatarUrl}
              alt={entry.name}
              className={cn(
                "rounded-full object-cover border-2 border-border",
                isFirst ? "h-20 w-20 border-amber-400" : "h-16 w-16"
              )}
            />
            <p className="mt-2 text-sm font-medium text-foreground text-center max-w-[80px] truncate">{entry.name}</p>
            <p className="text-xs text-muted-foreground">{formatNumber(entry.xp)} XP</p>
            <div
              className={cn(
                "mt-2 w-full rounded-t-lg text-center text-white font-semibold",
                isFirst ? "h-16 bg-amber-400 leading-[64px]" : entry.rank === 2 ? "h-12 bg-slate-400 leading-[48px]" : "h-10 bg-amber-700 leading-10"
              )}
            >
              {entry.rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LeaderboardPage() {
  const [scope, setScope] = useState<"kota" | "global">("kota");

  const data = scope === "kota" ? leaderboardCityMock : leaderboardGlobalMock;
  const currentUser = data.find((e) => e.isCurrentUser);

  const renderLeaderboard = () => {
    if (scope === "kota" && data.length <= 1) {
      return (
        <EmptyState
          illustration="empty-leaderboard"
          title="Belum ada Pahlawan Hijau"
          description="Belum ada Pahlawan Hijau di kotamu. Jadilah yang pertama!"
        />
      );
    }

    const sorted = [...data].sort((a, b) => a.rank - b.rank);
    const top20 = sorted.slice(0, 20);
    const selfOutside = currentUser && currentUser.rank > 20;

    return (
      <div className="space-y-6">
        <PodiumSection entries={top20} />

        <div className="space-y-2">
          {top20
            .filter((e) => e.rank > 3)
            .map((entry, index) => (
              <div
                key={entry.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05 + 0.1}s` }}
              >
                <LeaderboardRow
                  rank={entry.rank}
                  avatarUrl={entry.avatarUrl}
                  name={entry.name}
                  xp={entry.xp}
                  isCurrentUser={entry.isCurrentUser}
                />
              </div>
            ))}
        </div>

        {selfOutside && currentUser && (
          <div className="sticky bottom-20 md:bottom-6">
            <LeaderboardRow
              rank={currentUser.rank}
              avatarUrl={currentUser.avatarUrl}
              name={currentUser.name}
              xp={currentUser.xp}
              isCurrentUser
              className="border-primary"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">Pahlawan hijau dengan kontribusi terbesar</p>
      </div>

      <Tabs value={scope} onValueChange={(v) => setScope(v as "kota" | "global")} className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="kota">Kota Saya</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>
        <TabsContent value={scope} className="mt-6">
          {renderLeaderboard()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
