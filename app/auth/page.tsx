"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "../components/GlassCard";
import { registerUser, loginUser, createDemoUser } from "../actions/authActions";
import { getQuestionnaire } from "../actions/questionnaireActions";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (isLogin) {
        // Login
        const result = await loginUser({ email, password });
        
        if (result.success && result.user) {
          // Save user to localStorage for session
          localStorage.setItem("currentUser", JSON.stringify(result.user));
          // Check if user has completed questionnaire
          const questionnaireResult = await getQuestionnaire(result.user.id);
          if (questionnaireResult.completed || localStorage.getItem(`questionnaireSkipped_${result.user.id}`) === "true") {
            router.push("/home");
          } else {
            router.push("/questionnaire");
          }
        } else {
          setError(result.error || "Login failed");
        }
      } else {
        // Register
        const result = await registerUser({ name, email, password });
        
        if (result.success) {
          setSuccessMessage(result.message || "Registration successful!");
          setIsLogin(true); // Switch to login form
          setName("");
          setPassword("");
        } else {
          setError(result.error || "Registration failed");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-surface flex flex-col md:flex-row">
      {/* Left Side - Branding (Desktop) */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-gradient-to-br from-primary to-secondary flex-col items-center justify-center relative p-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-white/5 blur-2xl"></div>
        </div>

        <div className="relative z-10 text-center text-white">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto shadow-xl">
            <span
              className="material-symbols-outlined text-[48px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Energeez</h1>
          <p className="text-xl text-white/80 max-w-sm">
            Track and manage your daily energy levels with mindfulness
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-sm text-white/70 mt-1">Active Users</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl font-bold">1M+</p>
              <p className="text-sm text-white/70 mt-1">Activities</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl font-bold">4.9</p>
              <p className="text-sm text-white/70 mt-1">App Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 h-full overflow-y-auto scrollbar-hide md:overflow-hidden">
        <div className="min-h-full flex flex-col items-center justify-center relative px-5 py-4 md:p-8 lg:p-12">
          {/* Mobile Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 md:hidden">
            <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] rounded-[100%] bg-primary-container mix-blend-multiply blur-3xl transform rotate-12"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[70%] rounded-[100%] bg-surface-tint mix-blend-multiply blur-3xl transform -rotate-6"></div>
          </div>

          <div className="z-10 w-full max-w-md animate-fade-in-up">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center mb-4 md:hidden">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shadow-lg mb-3">
                <span
                  className="material-symbols-outlined text-[32px] text-on-primary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
              </div>
              <h1 className="font-h1 text-h1 text-primary tracking-tight">
                Energeez
              </h1>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="font-h2 text-h2 text-on-surface">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                {isLogin
                  ? "Sign in to continue tracking your energy"
                  : "Start your mindful energy journey"}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl font-label-md text-label-md animate-fade-in">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md animate-fade-in">
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <div className="animate-fade-in">
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md"
                  required
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md"
                  required
                />
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="font-label-sm text-label-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>{isLogin ? "Sign In" : "Create Account"}</>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5 md:my-6">
              <div className="flex-1 h-px bg-surface-variant"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                or continue with
              </span>
              <div className="flex-1 h-px bg-surface-variant"></div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-label-sm text-label-sm">Google</span>
              </GlassCard>
              <GlassCard className="flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-2.96 1.78-2.45 5.98.05 7.13-.57 1.5-1.31 2.99-2.1 4.08zm-5.85-15.1c.07 1.04.74 1.83 1.59 2.26-.79 1.14-2.22 2.01-3.37 1.96-.17-1.16.41-2.34 1.39-3.21.96-.86 2.07-1.29 3.18-1.01-.14.43-.44.75-.79 1z" />
                </svg>
                <span className="font-label-sm text-label-sm">Apple</span>
              </GlassCard>
            </div>

            {/* Toggle */}
            <p className="text-center mt-5 md:mt-6 font-body-md text-body-md text-on-surface-variant">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>

            {/* Demo Questionnaire Button */}
            <div className="mt-5 pt-5 border-t border-surface-variant">
              <button
                type="button"
                onClick={() => router.push("/questionnaire")}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary-container/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  quiz
                </span>
                Try Demo Questionnaire
              </button>
              <p className="text-center mt-1.5 font-label-sm text-label-sm text-on-surface-variant">
                No account required — explore the app
              </p>
            </div>

            {/* Demo Account Button */}
            <div className="mt-3">
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setError("");
                  try {
                    const result = await createDemoUser();
                    if (result.success && result.user) {
                      localStorage.setItem("currentUser", JSON.stringify(result.user));
                      // Check if demo user has completed questionnaire
                      const questionnaireResult = await getQuestionnaire(result.user.id);
                      if (questionnaireResult.completed || localStorage.getItem(`questionnaireSkipped_${result.user.id}`) === "true") {
                        router.push("/home");
                      } else {
                        router.push("/questionnaire");
                      }
                    } else if (result.error?.includes("not initialized")) {
                      // Try to seed first, then load
                      setError("Setting up demo account... Please wait.");
                      const seedResponse = await fetch("/api/seed");
                      const seedResult = await seedResponse.json();
                      if (seedResult.success) {
                        // Now try loading again
                        const retryResult = await createDemoUser();
                        if (retryResult.success && retryResult.user) {
                          localStorage.setItem("currentUser", JSON.stringify(retryResult.user));
                          // Check if demo user has completed questionnaire
                          const questionnaireResult2 = await getQuestionnaire(retryResult.user.id);
                          if (questionnaireResult2.completed || localStorage.getItem(`questionnaireSkipped_${retryResult.user.id}`) === "true") {
                            router.push("/home");
                          } else {
                            router.push("/questionnaire");
                          }
                        } else {
                          setError("Failed to load demo account");
                        }
                      } else {
                        setError("Failed to setup demo");
                      }
                    } else {
                      setError(result.error || "Failed to create demo");
                    }
                  } catch (err) {
                    setError("An error occurred. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-label-md hover:bg-secondary-container/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-secondary-container/30 border-t-on-secondary-container rounded-full animate-spin"></div>
                    Loading Demo...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">play_circle</span>
                    Try Demo Account
                  </>
                )}
              </button>
              <p className="text-center mt-1.5 font-label-sm text-label-sm text-on-surface-variant">
                Pre-filled with sample data for testing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
