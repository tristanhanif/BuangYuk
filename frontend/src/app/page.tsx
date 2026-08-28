import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Leaf, Recycle, Shield, TrendingUp, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
              <Leaf className="h-4 w-4" />
              <span>Platform Daur Ulang Terintegrasi</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
              Ubah Sampah Jadi <span className="text-primary">Nilai & Dampak Nyata</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Platform pertama yang menggabungkan penimbangan real-time, tracking karbon transparan,
              dan gamifikasi ekologi. Setor sampah, dapatkan uang & poin, lihat dampak karbonmu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="xl" className="gap-2">
                  Mulai Sekarang <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="xl">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Kenapa Memilih BuangYuk?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Solusi lengkap untuk pengelolaan sampah berkelanjutan dengan teknologi modern
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 mb-4">
                  <Recycle className="h-6 w-6" />
                </div>
                <CardTitle>Penimbangan Real-time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistem verifikasi berbasis QR Code memastikan berat sampah dicatat akurat oleh petugas
                  bank sampah terverifikasi.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>Tracking Karbon Transparan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Lihat reduksi emisi CO₂ secara real-time dengan metodologi EPA WARM. Setiap kg sampah
                  dihitung dampak lingkungannya.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 text-amber-600 mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle>Gamifikasi Ekologi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Kumpulkan Eco-Points, naikkan level dari &quot;Pemula Hijau&quot; hingga &quot;Carbon Neutral Champion&quot;,
                  dan dapatkan badge pencapaian.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 text-purple-600 mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Komunitas & Edukasi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Akses tips personalisis, artikel edukasi, dan komunitas peduli lingkungan untuk
                  memperluas dampak positifmu.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 text-orange-600 mb-4">
                  <Leaf className="h-6 w-6" />
                </div>
                <CardTitle>Multi-kategori Sampah</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dukungan 14+ kategori: Kertas, Plastik (PET/HDPE/PP/LDPE), Logam, Kaca, E-Waste,
                  CPU, Layar, Kabel, Baterai.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-teal-100 text-teal-600 mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>PWA & Mobile-First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Install sebagai aplikasi, akses offline untuk form setoran, dan desain responsif
                  optimal untuk pengguna & petugas lapangan.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Cara Kerja BuangYuk
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proses sederhana 4 langkah untuk mulai berdampak
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Pilih & Input",
                desc: "Pilih kategori sampah, masukkan kuantitas, dan lihat estimasi pendapatan & dampak karbon secara real-time.",
              },
              {
                step: "02",
                title: "Foto & Kirim",
                desc: "Ambil foto bukti sampah, pilih metode penjemputan/antar, dan submit transaksi ke bank sampah.",
              },
              {
                step: "03",
                title: "Verifikasi Petugas",
                desc: "Petugas bank sampah scan QR, timbang fisik, dan verifikasi data. Sistem hitung ulang otomatis.",
              },
              {
                step: "04",
                title: "Dapatkan Reward",
                desc: "Saldo cash, Eco-Points, dan CO₂ saved masuk ke dashboard real-time. Tukar poin ke voucher/hadiah.",
              },
            ].map((item, index) => (
              <Card key={index} className="relative">
                <div className="absolute -top-3 left-6 bg-background px-2 text-primary font-bold text-lg">
                  {item.step}
                </div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 lg:p-16 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Siap Mulai Berdampak?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan pengguna yang sudah mengubah sampah jadi nilai.
                Daftar gratis, mulai setor hari ini.
              </p>
              <Link href="/register">
                <Button size="xl" variant="secondary" className="gap-2">
                  Daftar Sekarang <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">BuangYuk</h3>
              <p className="text-muted-foreground text-sm">
                Platform pengolahan & daur ulang sampah terintegrasi dengan tracking karbon real-time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Fitur</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
                <li><Link href="/input-sampah" className="hover:text-primary">Input Sampah</Link></li>
                <li><Link href="/carbon-tracker" className="hover:text-primary">Carbon Tracker</Link></li>
                <li><Link href="/edukasi" className="hover:text-primary">Edukasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Petugas</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/scan" className="hover:text-primary">Scan QR</Link></li>
                <li><Link href="#" className="hover:text-primary">Verifikasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>email@buangyuk.id</li>
                <li>+62 21 XXXX XXXX</li>
                <li>Jl. Lingkungan No. 1, Jakarta</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2026 BuangYuk. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
