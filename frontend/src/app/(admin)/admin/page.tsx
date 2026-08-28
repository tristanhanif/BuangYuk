"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthGuard } from "@/components/auth-guard";
import { db } from "@/lib/firebaseClient";
import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from "firebase/firestore";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart3, Users, Truck, Package, AlertTriangle, Shield,
  Settings, FileText, TrendingUp, DollarSign, Clock, CheckCircle2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

export default function AdminDashboardPage() {
  return <AuthGuard allowedRoles={["admin"]}><AdminDashboard /></AuthGuard>;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalPickups: 0,
    completedPickups: 0,
    totalUsers: 0,
    totalCO2: 0,
    gmv: 0,
    grossSpread: 0,
    activePickups: 0,
    openDisputes: 0,
    fraudFlags: 0,
  });
  const [recentPickups, setRecentPickups] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [fraudFlags, setFraudFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const pickupsSnap = await getDocs(collection(db, "pickups"));
        const totalPickups = pickupsSnap.size;

        let completedPickups = 0;
        let activePickups = 0;
        let totalCO2 = 0;
        let gmv = 0;

        pickupsSnap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === "COMPLETED") {
            completedPickups++;
            totalCO2 += (data.verifiedWeight || data.estimatedWeight || 0) * 2.0;
            gmv += data.bankPurchaseValue || data.estimatedValue || 0;
          }
          if (["REQUESTED", "MATCHING", "ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "VERIFYING"].includes(data.status)) {
            activePickups++;
          }
        });

        const usersSnap = await getDocs(collection(db, "users"));
        const totalUsers = usersSnap.size;

        const disputesSnap = await getDocs(query(collection(db, "disputes"), where("status", "!=", "RESOLVED")));
        const openDisputes = disputesSnap.size;

        const flagsSnap = await getDocs(query(collection(db, "fraud_flags"), where("status", "!=", "RESOLVED")));
        const fraudFlagsCount = flagsSnap.size;

        const grossSpread = Math.round(gmv * 0.15);

        setStats({
          totalPickups,
          completedPickups,
          totalUsers,
          totalCO2: Math.round(totalCO2),
          gmv,
          grossSpread,
          activePickups,
          openDisputes,
          fraudFlags: fraudFlagsCount,
        });
      } catch {
        // Silent fail
      }
    };

    const pickupsUnsub = onSnapshot(
      query(collection(db, "pickups"), orderBy("createdAt", "desc"), limit(10)),
      (snapshot) => {
        setRecentPickups(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const logsUnsub = onSnapshot(
      query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(20)),
      (snapshot) => {
        setRecentLogs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const flagsUnsub = onSnapshot(
      query(collection(db, "fraud_flags"), orderBy("createdAt", "desc"), limit(10)),
      (snapshot) => {
        setFraudFlags(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    fetchStats().then(() => setLoading(false));

    return () => { pickupsUnsub(); logsUnsub(); flagsUnsub(); };
  }, []);

  if (loading) {
    return <div className="space-y-6 animate-pulse"><div className="h-8 bg-muted rounded w-1/4" /><div className="h-48 bg-muted rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor dan kelola seluruh platform BuangYuk</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Super Admin
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Overview</span></TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-1"><Truck className="h-4 w-4" /><span className="hidden sm:inline">Operasi</span></TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-1"><DollarSign className="h-4 w-4" /><span className="hidden sm:inline">Keuangan</span></TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1"><AlertTriangle className="h-4 w-4" /><span className="hidden sm:inline">Risk</span></TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-1"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Config</span></TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Truck className="h-6 w-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{stats.totalPickups}</p>
                <p className="text-xs text-muted-foreground">Total Pickup</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{formatCurrency(stats.gmv)}</p>
                <p className="text-xs text-muted-foreground">GMV</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                <p className="text-2xl font-bold">{stats.totalCO2.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">kg CO₂ Saved</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
              <p className="text-2xl font-bold">{stats.activePickups}</p>
              <p className="text-xs text-muted-foreground">Active Pickups</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">{stats.completedPickups}</p>
              <p className="text-xs text-muted-foreground">Selesai</p>
            </CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-lg">Pickup Terbaru</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentPickups.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                    <div>
                      <span className="font-mono text-xs">#{p.id.slice(0, 8)}</span>
                      <span className="ml-2 text-muted-foreground">{p.customerName}</span>
                    </div>
                    <Badge variant={p.status === "COMPLETED" ? "success" : p.status === "CANCELLED" ? "destructive" : "warning"}>
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">GMV</p>
              <p className="text-xl font-bold">{formatCurrency(stats.gmv)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Platform Gross Spread (15%)</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(stats.grossSpread)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Estimated Commission</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.gmv * 0.10)}</p>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Fraud Flags ({fraudFlags.length})
            </CardTitle></CardHeader>
            <CardContent>
              {fraudFlags.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">Tidak ada fraud flags aktif</p>
              ) : (
                <div className="space-y-2">
                  {fraudFlags.map((flag) => (
                    <div key={flag.id} className={`flex items-center justify-between p-3 rounded-lg ${flag.severity === "high" ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
                      <div>
                        <p className="font-medium text-sm">{flag.rule || flag.ruleCode}</p>
                        <p className="text-xs text-muted-foreground">{flag.description}</p>
                      </div>
                      <Badge variant={flag.severity === "high" ? "destructive" : "warning"}>{flag.severity}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Open Disputes ({stats.openDisputes})
            </CardTitle></CardHeader>
            <CardContent>
              <p className="text-center py-4 text-muted-foreground text-sm">Lihat halaman Disputes untuk detail</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Platform Configuration
            </CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground mb-1">Platform Gross Spread</p><p className="text-lg font-bold">15%</p></div>
                <div className="p-4 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground mb-1">Marketplace Commission</p><p className="text-lg font-bold">10%</p></div>
                <div className="p-4 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground mb-1">Collector Base Fee</p><p className="text-lg font-bold">Rp 5.000</p></div>
                <div className="p-4 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground mb-1">Cashout Minimum</p><p className="text-lg font-bold">Rp 10.000</p></div>
                <div className="p-4 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground mb-1">Cashout Fee</p><p className="text-lg font-bold">Rp 1.000</p></div>
                <div className="p-4 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground mb-1">Weight Deviation Threshold</p><p className="text-lg font-bold">50%</p></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Audit Log (terbaru)
            </CardTitle></CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">Belum ada audit logs</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                      <div>
                        <span className="font-mono text-xs">{log.action}</span>
                        <span className="ml-2 text-muted-foreground">{log.entityType}#{log.entityId?.slice(0, 8)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.timestamp?.toDate ? formatDate(log.timestamp.toDate()) : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
