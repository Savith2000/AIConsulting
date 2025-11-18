"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import MealsOnWheelsLogo from "@/components/MealsOnWheelsLogo";
import { checkOnboardingComplete, checkIsAdmin } from "@/lib/supabase/profile";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Check if email confirmation is required
        // If session is null, it means email confirmation is required
        if (!data.session) {
          setEmailConfirmationPending(true);
          setPendingEmail(email);
          setLoading(false);
          return;
        }
        
        // If session exists, user is already confirmed, check onboarding and admin status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const onboardingComplete = await checkOnboardingComplete(user.id);
          if (onboardingComplete) {
            const isAdmin = await checkIsAdmin(user.id);
            router.push(isAdmin ? "/admin" : "/dashboard");
          } else {
            router.push("/onboarding");
          }
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Check onboarding and admin status after sign in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const onboardingComplete = await checkOnboardingComplete(user.id);
          if (onboardingComplete) {
            const isAdmin = await checkIsAdmin(user.id);
            router.push(isAdmin ? "/admin" : "/dashboard");
          } else {
            router.push("/onboarding");
          }
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
      });
      if (error) throw error;
      setResendSuccess(true);
    } catch (error: any) {
      setError(error.message || "Failed to resend email");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmailConfirmationPending(false);
    setPendingEmail("");
    setError(null);
    setResendSuccess(false);
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="mb-2 flex justify-center">
          <div className="w-72 max-w-full">
            <MealsOnWheelsLogo className="w-full h-auto" />
          </div>
        </div>

        {/* Text Hierarchy */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-darkBlue mb-1">
            MEALS{" "}
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-limeGreen text-darkBlue font-bold text-sm mx-1">
              on
            </span>{" "}
            WHEELS
          </h1>
          <p className="text-sm text-darkBlue/80 mb-2">ORANGE COUNTY, NC</p>
          <h2 className="text-xl font-semibold text-darkBlue">Volunteer Dashboard</h2>
        </div>

        {/* Cards with AnimatePresence */}
        <AnimatePresence mode="wait">
          {emailConfirmationPending ? (
            /* Email Confirmation Card */
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full neumorphic rounded-3xl p-8 shadow-neumorphic"
            >
              <div className="space-y-6">
                {/* Email Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-[6px_6px_12px_rgba(0,180,193,0.2),-6px_-6px_12px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,180,193,0.1)]">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z"
                        stroke="#00B4C1"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Message */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-darkBlue mb-2">
                    Please confirm your email to continue
                  </h3>
                  <p className="text-sm text-darkBlue/70">
                    We've sent a confirmation email to
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {pendingEmail}
                  </p>
                </div>

                {/* Success message */}
                {resendSuccess && (
                  <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm text-center">
                    Confirmation email sent successfully!
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Resend button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="w-full py-3 px-4 neumorphic-button text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Sending..." : "Resend Confirmation Email"}
                </motion.button>

                {/* Back to login */}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-sm text-darkBlue/70 hover:text-darkBlue transition-colors"
                >
                  Back to login
                </button>
              </div>
            </motion.div>
          ) : (
            /* Login Card */
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full neumorphic rounded-3xl p-8 shadow-neumorphic"
            >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z"
                    stroke="#4B5563"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 neumorphic-inset rounded-xl text-darkBlue placeholder-gray-400 focus:outline-none"
                placeholder="Email"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.8333 9.16667V5.83333C15.8333 3.53215 13.9681 1.66667 11.6667 1.66667H8.33333C6.03185 1.66667 4.16667 3.53215 4.16667 5.83333V9.16667M10 14.5833V16.6667M5.83333 9.16667H14.1667C15.0871 9.16667 15.8333 9.91286 15.8333 10.8333V16.6667C15.8333 17.5871 15.0871 18.3333 14.1667 18.3333H5.83333C4.91286 18.3333 4.16667 17.5871 4.16667 16.6667V10.8333C4.16667 9.91286 4.91286 9.16667 5.83333 9.16667Z"
                    stroke="#4B5563"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {showPassword ? (
                    <>
                      <path
                        d="M2.5 2.5L17.5 17.5M8.15833 8.15833C7.84024 8.47642 7.66667 8.9163 7.66667 9.375C7.66667 10.2875 8.4125 11.0333 9.325 11.0333C9.7837 11.0333 10.2236 10.8598 10.5417 10.5417M14.675 12.3083C13.5 13.325 11.6667 14.1667 10 14.1667C6.66667 14.1667 3.825 11.6667 2.5 10C3.18333 9.15833 4.09167 8.35 5.14167 7.65833L14.675 12.3083ZM17.5 10C16.8167 10.8417 15.9083 11.65 14.8583 12.3417L12.5 10.9833M7.5 4.10833C8.33333 3.89167 9.16667 3.83333 10 3.83333C13.3333 3.83333 16.175 6.33333 17.5 8.33333C17.1583 8.89167 16.7583 9.425 16.3083 9.925L7.5 4.10833Z"
                        stroke="#4B5563"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        d="M2.5 10C2.5 10 5 5.83333 10 5.83333C15 5.83333 17.5 10 17.5 10C17.5 10 15 14.1667 10 14.1667C5 14.1667 2.5 10 2.5 10Z"
                        stroke="#4B5563"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                        stroke="#4B5563"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                </svg>
              </button>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-3 neumorphic-inset rounded-xl text-darkBlue placeholder-gray-400 focus:outline-none"
                placeholder="Password"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Sign In button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 neumorphic-button text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? isSignUp
                  ? "Signing up..."
                  : "Signing in..."
                : isSignUp
                ? "Sign Up"
                : "Sign In"}
            </motion.button>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    rememberMe
                      ? "bg-primary shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-1px_-1px_2px_rgba(255,255,255,0.3)]"
                      : "bg-gray-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]"
                  }`}
                >
                  {rememberMe && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="ml-2 text-sm text-darkBlue">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-darkBlue/70 hover:text-darkBlue transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-100 text-darkBlue/70">or continue with</span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center text-sm text-darkBlue/70">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className="text-primary font-medium hover:text-primary-dark transition-colors"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                    }}
                    className="text-primary font-medium hover:text-primary-dark transition-colors"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
