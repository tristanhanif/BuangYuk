"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StepIndicator } from "@/components/feature/StepIndicator";
import { toast } from "@/components/ui/toast";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const registerSchema = z
  .object({
    displayName: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    phoneNumber: z.string().min(10, "Nomor HP minimal 10 digit").optional().or(z.literal("")),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
    agree: z.boolean().refine((val) => val === true, "Kamu harus menyetujui Syarat & Ketentuan"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const STEPS = ["Data Diri", "Verifikasi OTP"];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP state
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [demoCode] = useState(() => String(Math.floor(100000 + Math.random() * 900000)));
  const [resendCountdown, setResendCountdown] = useState(0);
  const [pendingEmail, setPendingEmail] = useState("");
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agree: false },
  });

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    const next = [...otp];
    next[index] = value.replace(/\D/g, "").slice(0, 1);
    setOtp(next);
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const nextToOtp = async () => {
    const valid = await trigger();
    if (!valid) return;
    setPendingEmail(getValues("email"));
    setResendCountdown(30);
    setCurrentStep(2);
  };

  const createAccount = async () => {
    const data = getValues();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: data.displayName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber || null,
        role: "user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, "user_eco_summaries", user.uid), {
        userId: user.uid,
        totalCO2Saved: 0,
        totalEcoPoints: 0,
        totalTransactions: 0,
        wasteBreakdown: {},
        monthlyCO2Trend: [],
        lastUpdated: serverTimestamp(),
      });

      toast({ title: "Akun berhasil dibuat!", description: "Selamat datang di BuangYuk" });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("email-already-in-use")
          ? "Email sudah terdaftar"
          : "Gagal mendaftar. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = () => {
    if (otp.join("") === demoCode) {
      createAccount();
    } else {
      setError("Kode OTP salah. Coba periksa lagi.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pt-6 pb-2">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm ring-1 ring-border mx-auto mb-4">
            <Image
              src="/logo.png"
              alt="BuangYuk"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </Link>
          <CardTitle className="text-2xl">Daftar BuangYuk</CardTitle>
          <CardDescription>
            {currentStep === 1
              ? "Buat akun baru dan mulai berdampak positif."
              : "Masukkan kode verifikasi yang dikirim ke email kamu."}
          </CardDescription>
        </CardHeader>

        <div className="px-6 pb-2">
          <StepIndicator currentStep={currentStep} totalSteps={2} labels={STEPS} />
        </div>

        <CardContent className="space-y-6 pt-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          {currentStep === 1 ? (
            <form onSubmit={handleSubmit(nextToOtp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="displayName" placeholder="Masukkan nama lengkap" className="pl-10" {...register("displayName")} />
                </div>
                {errors.displayName && <p className="text-sm text-red-600">{errors.displayName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="email@contoh.com" className="pl-10" {...register("email")} />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Nomor HP (Opsional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phoneNumber" type="tel" placeholder="08xxxxxxxxxx" className="pl-10" {...register("phoneNumber")} />
                </div>
                {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    className="pl-10 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ulangi kata sandi"
                    className="pl-10"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    {...register("agree")}
                  />
                  <span className="text-muted-foreground">
                    Saya menyetujui <span className="text-primary font-medium">Syarat &amp; Ketentuan</span>
                  </span>
                </label>
                {errors.agree && <p className="text-sm text-red-600">{errors.agree.message}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg">
                Lanjut Verifikasi <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                <p className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  Kode verifikasi dikirim ke {pendingEmail}
                </p>
                <p className="mt-1 text-xs text-green-700">
                  (Demo: masukkan kode <strong>{demoCode}</strong> untuk menyelesaikan verifikasi)
                </p>
              </div>

              <div className="flex justify-center gap-2" role="group" aria-label="Kode OTP">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputs.current[index] = el;
                    }}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit ${index + 1}`}
                    className="h-12 w-10 rounded-lg border border-border bg-background text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  />
                ))}
              </div>

              <Button className="w-full" size="lg" onClick={verifyOtp} disabled={isLoading || otp.join("").length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verifikasi & Buat Akun
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Tidak menerima kode?{" "}
                  {resendCountdown > 0 ? (
                    <span className="font-medium text-muted-foreground">
                      Kirim ulang dalam 00:{String(resendCountdown).padStart(2, "0")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setResendCountdown(30);
                        setOtp(Array(6).fill(""));
                        setError(null);
                      }}
                      className="font-medium text-primary hover:underline"
                    >
                      Kirim Ulang Kode
                    </button>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Data Diri
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Atau</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" disabled={isLoading}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Daftar dengan Google
              </Button>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Masuk di sini
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
