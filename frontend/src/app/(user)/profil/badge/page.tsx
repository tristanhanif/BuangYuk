"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { badgesMock } from "@/mocks/badgesMock";
import { BadgeIcon } from "@/components/feature/BadgeIcon";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatNumber } from "@/lib/utils";
import { ArrowLeft, Award, Lock } from "lucide-react";

export default function BadgeGalleryPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"semua" | "terbuka" | "terkunci">("semua");

  const unlocked = badgesMock.filter((b) => b.unlocked);
  const locked = badgesMock.filter((b) => !b.unlocked);

  const visible =
    tab === "semua" ? badgesMock : tab === "terbuka" ? unlocked : locked;

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
        <h1 className="text-2xl font-bold text-foreground">Pencapaian</h1>
        <p className="text-muted-foreground mt-1">
          {unlocked.length} dari {badgesMock.length} lencana berhasil kamu buka
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="semua">Semua</TabsTrigger>
          <TabsTrigger value="terbuka">Terbuka</TabsTrigger>
          <TabsTrigger value="terkunci">Terkunci</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {visible.length === 0 ? (
            <EmptyState
              illustration="empty-missions"
              title={tab === "terkunci" ? "Semua lencana terbuka" : "Belum ada lencana"}
              description="Terus setor sampah untuk membuka lencana pertamamu."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visible.map((badge) => (
                <div key={badge.id}>
                  <BadgeIcon
                    icon={badge.icon}
                    label={badge.name}
                    unlocked={badge.unlocked}
                  />
                  <div className="mt-2 text-center">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {badge.requirement}
                    </p>
                    {!badge.unlocked && typeof badge.progress === "number" && badge.progress > 0 && (
                      <div className="mt-2">
                        <Progress value={badge.progress * 100} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatNumber(Math.round(badge.progress * 100))}%
                        </p>
                      </div>
                    )}
                    {badge.unlocked && badge.unlockedAt && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDate(badge.unlockedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-4 flex items-start gap-3 text-sm text-muted-foreground">
          <Award className="h-5 w-5 shrink-0 text-amber-500" />
          <p>
            Lencana yang <Lock className="inline h-3.5 w-3.5 align-text-bottom" /> terkunci
            otomatis terbuka saat kamu memenuhi syaratnya. Terus setor sampah secara rutin!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
