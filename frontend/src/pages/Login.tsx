"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Fingerprint, Lock, Eye, EyeOff, Check, ScanFace, Mail, ArrowLeft, Loader2, ShieldCheck, Radio, Wifi } from "lucide-react";

type Stage = "credentials" | "biometric" | "success";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState<Stage>("credentials");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [shakeField, setShakeField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [biometricProgress, setBiometricProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Voter ID is required";
      triggerShake("email");
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      triggerShake("password");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStage("biometric");
      startBiometricScan();
    }, 1200);
  };

  const triggerShake = (field: string) => {
    setShakeField(field);
    setTimeout(() => setShakeField(null), 500);
  };

  const startBiometricScan = () => {
    setBiometricProgress(0);
    const interval = setInterval(() => {
      setBiometricProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStage("success"), 400);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
  };

  const securityIndicators = [
    { icon: Lock, label: "256-bit Encryption" },
    { icon: ShieldCheck, label: "WebAuthn Certified" },
    { icon: Radio, label: "Anti-Duplicate Protection" },
    { icon: Wifi, label: "Real-Time Auth Logs" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* LEFT – Brand Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-background" />
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-accent/4 blur-[100px]" />

        {/* Glowing line accents */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/8 to-transparent" />

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
            Biometrically Verified Access
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground leading-relaxed mb-12"
          >
            One identity. One vote. Fully encrypted.
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

      {/* RIGHT – Login Card */}
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
          className="relative z-10 w-full max-w-[460px]"
        >
          <div className="bg-card/50 backdrop-blur-2xl border border-border/40 rounded-2xl p-10 shadow-2xl shadow-background/50">
            <AnimatePresence mode="wait">
              {/* CREDENTIALS STAGE */}
              {stage === "credentials" && (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Identity</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Enter your credentials to access the secure voting portal.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email / Voter ID */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                        Voter ID / Email
                      </label>
                      <motion.div
                        animate={shakeField === "email" ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="relative">
                          <input
                            type="text"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                            placeholder="voterID@securevote.com"
                            className={`w-full bg-muted/40 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300 focus:scale-[1.01] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] ${
                              errors.email ? "border-destructive/50" : "border-border/50 focus:border-primary/50"
                            }`}
                          />
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                        </div>
                      </motion.div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive/80 mt-1.5"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                        Password
                      </label>
                      <motion.div
                        animate={shakeField === "password" ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                            placeholder="••••••••••"
                            className={`w-full bg-muted/40 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300 focus:scale-[1.01] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] ${
                              errors.password ? "border-destructive/50" : "border-border/50 focus:border-primary/50"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </motion.div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive/80 mt-1.5"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full gradient-cta text-primary-foreground font-semibold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.4)] disabled:opacity-70 disabled:hover:scale-100 text-sm flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Authenticating…</span>
                        </motion.div>
                      ) : (
                        "Continue to Biometric Verification"
                      )}
                    </button>
                  </form>

                  {/* Secondary links */}
                  <div className="mt-8 flex flex-col items-center gap-2.5">
                    <button
                      onClick={() => { setResetModal(true); setResetSent(false); setResetEmail(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors relative group"
                    >
                      Forgot Password?
                      <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
                    </button>
                    <Link href="/register" className="text-xs text-muted-foreground hover:text-foreground transition-colors relative group">
                      Register as New Voter
                      <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
                    </Link>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors relative group">
                      Contact Election Admin
                      <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* BIOMETRIC STAGE */}
              {stage === "biometric" && (
                <motion.div
                  key="biometric"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <div className="relative mb-8">
                    {/* Progress ring */}
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="4"
                      />
                      <motion.circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke="url(#progressGrad)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={2 * Math.PI * 52 * (1 - biometricProgress / 100)}
                        transition={{ duration: 0.1 }}
                      />
                      <defs>
                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--accent))" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {biometricProgress < 50 ? (
                          <ScanFace className="w-10 h-10 text-primary" />
                        ) : (
                          <Fingerprint className="w-10 h-10 text-accent" />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    {biometricProgress < 50
                      ? "Place your finger or look into the camera"
                      : "Verifying biometric signature…"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {biometricProgress}% complete
                  </p>
                </motion.div>
              )}

              {/* SUCCESS STAGE */}
              {stage === "success" && (
                <motion.div
                  key="success"
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
                    <Check className="w-9 h-9 text-accent" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-foreground mb-2"
                  >
                    Identity Verified Successfully
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-muted-foreground"
                  >
                    Accessing Secure Dashboard…
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6"
                  >
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* PASSWORD RESET MODAL */}
      <AnimatePresence>
        {resetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            onClick={() => setResetModal(false)}
          >
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative z-10 w-full max-w-sm bg-card/80 backdrop-blur-2xl border border-border/40 rounded-2xl p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setResetModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {!resetSent ? (
                <>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Reset Password</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Enter your email to receive a secure reset link.
                  </p>
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="voterID@securevote.com"
                      className="w-full bg-muted/40 border border-border/50 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300 focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                    />
                    <button
                      type="submit"
                      className="w-full gradient-cta text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.02]"
                    >
                      Send Reset Link
                    </button>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Reset Link Sent</h3>
                  <p className="text-sm text-muted-foreground">Reset link sent securely to your email.</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
