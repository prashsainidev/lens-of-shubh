"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, AlertTriangle, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("Invalid email or password. Please try again.");
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch {
      setErrorMsg("Failed to connect to authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070706] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden select-none">
      {/* Background ambient light effects */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none rounded-full animate-gold-glow-1" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.04)_0%,transparent_70%)] pointer-events-none rounded-full animate-gold-glow-2" />

      <div className="w-full max-w-[420px] z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#C9A84C] font-semibold">
            Administrative Hub
          </span>
          <h1 className="text-3xl font-serif mt-2.5 tracking-widest text-[#FAFAF8] font-light">
            LENS OF SHUBH
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-[#111110]/80 border border-amber-500/10 rounded-2xl p-8 md:p-10 shadow-2xl backdrop-blur-xl animate-pulse-border">
          <h2 className="text-xl font-serif mb-1.5 tracking-wide text-white font-medium">
            Verify Identity
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed mb-6 font-light">
            Enter your secure administrative credentials to unlock the Lens of Shubh dashboard.
          </p>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
            {errorMsg && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 flex items-start gap-2.5 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] tracking-wider text-gray-400 uppercase font-semibold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shubh@lensofshubh.com"
                  required
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg pl-10 pr-4 py-3 text-white font-sans text-sm outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/20 placeholder:text-gray-600"
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] tracking-wider text-gray-400 uppercase font-semibold">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg pl-10 pr-11 py-3 text-white font-sans text-sm outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/20 placeholder:text-gray-600"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
                  title={showPassword ? "Hide Password" : "Show Password"}
                  suppressHydrationWarning
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2.5 h-12 bg-[#C9A84C] hover:bg-[#b08f37] text-[#0A0A08] font-mono text-xs font-semibold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#C9A84C]/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              {isSubmitting ? (
                "Accessing Control Panel..."
              ) : (
                <>
                  <span>Authenticate</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
