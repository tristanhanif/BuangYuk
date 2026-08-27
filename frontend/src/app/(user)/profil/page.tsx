"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEcoTracker } from "@/context/EcoTrackerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ECO_LEVELS } from "@/lib/constants";
import { getEcoLevel, getNextLevel } from "@/lib/utils";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Leaf,
  TrendingUp,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { ecoSummary, loading: ecoLoading } = useEcoTracker();

  if (authLoading || ecoLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Silakan login terlebih dahulu</h1>
        <a href="/(auth)/login" className="text-primary hover:underline">
          Login di sini
        </a>
      </div>
    );
  }

  const totalPoints = ecoSummary?.totalEcoPoints || 0;
  const totalCO2 = ecoSummary?.totalCO2Saved || 0;
  const totalTransactions = ecoSummary?.totalTransactions || 0;
  const currentLevel = getEcoLevel(totalPoints);
  const nextLevel = getNextLevel(currentLevel.level);
  const progressToNext = nextLevel
    ? Math.min(100, ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  const userInitials = user.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
              <AvatarFallback className="text-xl font-bold bg-green-100 text-green-700">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{user.displayName || "Pengguna"}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
              {user.phoneNumber && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3" />
                  {user.phoneNumber}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success">
                  {currentLevel.badge} {currentLevel.name}
                </Badge>
                <Badge variant="outline">Level {currentLevel.level}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      {nextLevel && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Progress Level</p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(totalPoints - currentLevel.minPoints)} / {formatNumber(nextLevel.minPoints - currentLevel.minPoints)} poin
              </p>
            </div>
            <Progress value={progressToNext} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Butuh {formatNumber(nextLevel.minPoints - totalPoints)} poin lagi untuk mencapai {nextLevel.name}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Eco Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Statistik Eco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-600">{totalCO2.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">kg CO₂ Saved</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <p className="text-2xl font-bold text-amber-600">{formatNumber(totalPoints)}</p>
              <p className="text-xs text-muted-foreground">Eco Points</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
              <p className="text-xs text-muted-foreground">Transaksi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eco Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Level Ekologi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ECO_LEVELS.map((level) => {
              const isCurrent = level.level === currentLevel.level;
              const isUnlocked = level.level <= currentLevel.level;
              return (
                <div
                  key={level.level}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isCurrent
                      ? "bg-green-50 border border-green-200"
                      : isUnlocked
                      ? "bg-muted/50"
                      : "bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.badge}</span>
                    <div>
                      <p className="font-medium text-sm">{level.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Level {level.level} · {level.minPoints === 0 ? "0" : formatNumber(level.minPoints)}+ poin
                      </p>
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge variant="success" className="text-xs">Saat Ini</Badge>
                  )}
                  {isUnlocked && !isCurrent && (
                    <Badge variant="outline" className="text-xs">✓ Tercapai</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings Menu */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Pengaturan</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Keamanan Akun</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Edit Profil</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Riwayat Transaksi</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span>Anggota sejak {user.metadata?.creationTime ? formatDate(user.metadata.creationTime) : "N/A"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Keluar dari Akun
      </Button>

      <p className="text-center text-xs text-muted-foreground pb-8">
        BuangYuk v1.0.0 · Platform Daur Ulang Terintegrasi
      </p>
    </div>
  );
}
