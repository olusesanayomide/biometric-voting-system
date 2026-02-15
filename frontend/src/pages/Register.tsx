"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Fingerprint, Lock, Check, ScanFace, Mail,
  Loader2, ShieldCheck, User, Hash, ChevronRight, ArrowLeft,
  UserCheck, Eye
} from "lucide-react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3;
type BiometricState = "idle" | "permission" | "scanning" | "success";

const Register = () => {
  const router = useRouter();

  // Step 1
  const [fullName, setFullName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeField, setShakeField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 2
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpVerified, setOtpVerified] = useState(false);

  // Step 3
  const [biometricState, setBiometricState] = useState<BiometricState>("idle");
  const [biometricProgress, setBiometricProgress] = useState(0);

  // Flow
  const [step, setStep] = useState<Step>(1);
  const [complete, setComplete] = useState(false);

  const triggerShake = (field: string) => {
    setShakeField(field);
    setTimeout(() => setShakeField(null), 500);
  };

  // Step 1 submit
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      triggerShake("fullName");
    }
    if (!matricNumber.trim() || !/^[A-Za-z0-9/]{6,}$/.test(matricNumber)) {
      newErrors.matricNumber = "Enter a valid matric number";
      triggerShake("matricNumber");
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".edu")) {
      newErrors.email = "Use a valid institutional email (.edu)";
      triggerShake("email");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  // OTP handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto verify when all filled
    if (newOtp.every((d) => d !== "")) {
      setTimeout(() => {
        setOtpVerified(true);
        setTimeout(() => setStep(3), 1200);
      }, 600);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Biometric
  const startBiometricCapture = () => {
    setBiometricState("permission");
  };

  const grantPermission = () => {
    setBiometricState("scanning");
    setBiometricProgress(0);
    const interval = setInterval(() => {
      setBiometricProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setBiometricState("success"), 400);
          return 100;
        }
        return prev + 1.5;
      });
    }, 40);
  };

  const completeRegistration = () => {
    setComplete(true);
  };

  const securityIndicators = [
    { icon: Lock, label: "256-bit Encryption" },
    { icon: Fingerprint, label: "Biometric Identity Binding" },
    { icon: ShieldCheck, label: "Institutional Verification Only" },
    { icon: UserCheck, label: "One Person, One Vote Policy" },
  ];

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  const inputClass = (field: string) =>
    `w-full bg-muted/40 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300 focus:scale-[1.01] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] ${
      errors[field] ? "border-destructive/50" : "border-border/50 focus:border-primary/50"
    }`;

  return (
    <div className="min-h-screen bg-background flex">
      {/* LEFT – Brand Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-background" />
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-accent/4 blur-[100px]" />

        {/* Glowing lines */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/8 to-transparent" />

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{ left: `${20 + i * 15}%`, top: `${30 + i * 10}%` }}
            animate={{ y: [-10, 10, -10], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <div className="relative z-10 max-w-md px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">SecureVote</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl font-bold text-foreground leading-tight mb-4"
          >
            Secure Biometric Enrollment
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground leading-relaxed mb-12"
          >
            Register once. Vote securely. Identity verified for every election.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="space-y-4"
          >
            {securityIndicators.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/8 border border-border/50 flex items-center justify-center">
                  <item.icon className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* RIGHT – Registration Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[160px]" />
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">SecureVote</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[480px]"
        >
          <div className="bg-card/50 backdrop-blur-2xl border border-border/40 rounded-2xl p-10 shadow-2xl shadow-background/50">
            <AnimatePresence mode="wait">
              {/* === COMPLETE STATE === */}
              {complete ? (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-accent/15 border-2 border-accent/40 flex items-center justify-center mb-6"
                    style={{ boxShadow: "0 0 40px -8px hsl(var(--accent) / 0.3)" }}
                  >
                    <ShieldCheck className="w-9 h-9 text-accent" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-foreground mb-2"
                  >
                    Registration Complete
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-sm text-muted-foreground mb-8 leading-relaxed"
                  >
                    You are now eligible to participate in secure digital elections.
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => router.push("/login")}
                    className="w-full gradient-cta text-primary-foreground font-semibold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.4)] text-sm"
                  >
                    Proceed to Login
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="flow">
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Step {step} of 3
                      </span>
                      <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {/* === STEP 1: Personal Details === */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="mb-6">
                          <h1 className="text-2xl font-bold text-foreground mb-2">
                            Enter Your Academic Details
                          </h1>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Your identity will be verified against institutional records.
                          </p>
                        </div>

                        <form onSubmit={handleStep1} className="space-y-5">
                          {/* Full Name */}
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                              Full Name
                            </label>
                            <motion.div
                              animate={shakeField === "fullName" ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <div className="relative">
                                <input
                                  type="text"
                                  value={fullName}
                                  onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
                                  placeholder="John Michael Doe"
                                  className={inputClass("fullName")}
                                />
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                              </div>
                            </motion.div>
                            {errors.fullName && (
                              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive/80 mt-1.5">
                                {errors.fullName}
                              </motion.p>
                            )}
                          </div>

                          {/* Matric Number */}
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                              Matric Number
                            </label>
                            <motion.div
                              animate={shakeField === "matricNumber" ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <div className="relative">
                                <input
                                  type="text"
                                  value={matricNumber}
                                  onChange={(e) => { setMatricNumber(e.target.value); setErrors((p) => ({ ...p, matricNumber: "" })); }}
                                  placeholder="U2023/123456"
                                  className={inputClass("matricNumber")}
                                />
                                <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                              </div>
                            </motion.div>
                            {errors.matricNumber && (
                              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive/80 mt-1.5">
                                {errors.matricNumber}
                              </motion.p>
                            )}
                          </div>

                          {/* Email */}
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                              Institutional Email
                            </label>
                            <motion.div
                              animate={shakeField === "email" ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <div className="relative">
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                                  placeholder="john.doe@university.edu"
                                  className={inputClass("email")}
                                />
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                              </div>
                            </motion.div>
                            {errors.email && (
                              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive/80 mt-1.5">
                                {errors.email}
                              </motion.p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-cta text-primary-foreground font-semibold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.4)] disabled:opacity-70 disabled:hover:scale-100 text-sm flex items-center justify-center gap-2 mt-2"
                          >
                            {loading ? (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Verifying…</span>
                              </motion.div>
                            ) : (
                              <>
                                Continue to Biometric Setup
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </form>

                        {/* Secondary links */}
                        <div className="mt-8 flex flex-col items-center gap-2.5">
                          <button
                            onClick={() => router.push("/login")}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors relative group"
                          >
                            Already registered? Sign in
                            <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* === STEP 2: OTP Verification === */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.35 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>

                        <h2 className="text-xl font-bold text-foreground mb-2">
                          Verify Your Institutional Email
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                          {"We've"} sent a secure verification code to{" "}
                          <span className="text-foreground font-medium">{email}</span>
                        </p>

                        {!otpVerified ? (
                          <>
                            <div className="flex gap-3 mb-6">
                              {otp.map((digit, i) => (
                                <motion.input
                                  key={i}
                                  ref={(el) => { otpRefs.current[i] = el; }}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(i, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className={`w-12 h-14 text-center text-lg font-semibold rounded-xl bg-muted/40 border outline-none transition-all duration-300 focus:scale-[1.05] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] ${
                                    digit ? "border-primary/50 text-foreground" : "border-border/50 text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>

                            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors relative group">
                              Resend verification code
                              <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
                            </button>
                          </>
                        ) : (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="w-16 h-16 rounded-full bg-accent/15 border-2 border-accent/40 flex items-center justify-center"
                            style={{ boxShadow: "0 0 40px -8px hsl(var(--accent) / 0.3)" }}
                          >
                            <Check className="w-7 h-7 text-accent" />
                          </motion.div>
                        )}

                        <button
                          onClick={() => setStep(1)}
                          className="mt-8 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Back to details
                        </button>
                      </motion.div>
                    )}

                    {/* === STEP 3: Biometric Enrollment === */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.35 }}
                        className="flex flex-col items-center text-center"
                      >
                        <AnimatePresence mode="wait">
                          {/* IDLE */}
                          {biometricState === "idle" && (
                            <motion.div
                              key="bio-idle"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex flex-col items-center"
                            >
                              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                                <Fingerprint className="w-9 h-9 text-primary" />
                              </div>

                              <h2 className="text-xl font-bold text-foreground mb-2">
                                Enroll Your Biometric Identity
                              </h2>
                              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                                This biometric signature will be securely linked to your voter profile.
                              </p>

                              <button
                                onClick={startBiometricCapture}
                                className="w-full gradient-cta text-primary-foreground font-semibold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.4)] text-sm"
                              >
                                Begin Biometric Capture
                              </button>
                            </motion.div>
                          )}

                          {/* PERMISSION MODAL */}
                          {biometricState === "permission" && (
                            <motion.div
                              key="bio-permission"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex flex-col items-center"
                            >
                              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                                <Eye className="w-7 h-7 text-primary" />
                              </div>

                              <h2 className="text-lg font-bold text-foreground mb-2">
                                Biometric Access Request
                              </h2>
                              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                                SecureVote would like to access your biometric authentication device.
                              </p>

                              <div className="flex gap-3 w-full">
                                <button
                                  onClick={() => setBiometricState("idle")}
                                  className="flex-1 border border-border/50 text-muted-foreground font-medium py-3 rounded-xl transition-all duration-300 hover:border-muted-foreground/50 text-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={grantPermission}
                                  className="flex-1 gradient-cta text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] text-sm"
                                >
                                  Allow
                                </button>
                              </div>
                            </motion.div>
                          )}

                          {/* SCANNING */}
                          {biometricState === "scanning" && (
                            <motion.div
                              key="bio-scanning"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.4 }}
                              className="flex flex-col items-center py-4"
                            >
                              <div className="relative mb-8">
                                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                                  <motion.circle
                                    cx="60" cy="60" r="52"
                                    fill="none"
                                    stroke="url(#regProgressGrad)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 52}
                                    strokeDashoffset={2 * Math.PI * 52 * (1 - biometricProgress / 100)}
                                    transition={{ duration: 0.1 }}
                                  />
                                  <defs>
                                    <linearGradient id="regProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                                    {biometricProgress < 50 ? (
                                      <Fingerprint className="w-10 h-10 text-primary" />
                                    ) : (
                                      <ScanFace className="w-10 h-10 text-accent" />
                                    )}
                                  </motion.div>
                                </div>
                              </div>

                              <h2 className="text-lg font-semibold text-foreground mb-2">
                                {biometricProgress < 50 ? "Align your fingerprint" : "Look into the camera"}
                              </h2>
                              <p className="text-sm text-muted-foreground">{Math.round(biometricProgress)}% complete</p>
                            </motion.div>
                          )}

                          {/* SUCCESS */}
                          {biometricState === "success" && (
                            <motion.div
                              key="bio-success"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5 }}
                              className="flex flex-col items-center py-4"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                className="w-20 h-20 rounded-full bg-accent/15 border-2 border-accent/40 flex items-center justify-center mb-6"
                                style={{ boxShadow: "0 0 40px -8px hsl(var(--accent) / 0.3)" }}
                              >
                                <Check className="w-9 h-9 text-accent" />
                              </motion.div>

                              <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-xl font-bold text-foreground mb-2"
                              >
                                Biometric Enrollment Successful
                              </motion.h2>
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className="text-sm text-muted-foreground mb-8 leading-relaxed"
                              >
                                Your biometric signature has been securely encrypted and stored.
                              </motion.p>

                              <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                onClick={completeRegistration}
                                className="w-full gradient-cta text-primary-foreground font-semibold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.4)] text-sm"
                              >
                                Complete Registration
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {biometricState === "idle" && (
                          <button
                            onClick={() => setStep(2)}
                            className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Back to verification
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
