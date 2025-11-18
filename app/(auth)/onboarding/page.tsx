"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import MealsOnWheelsLogo from "@/components/MealsOnWheelsLogo";
import { checkOnboardingComplete, createOrUpdateProfile } from "@/lib/supabase/profile";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Personal info, Step 2: Availability
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUserAndOnboarding = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/login");
          return;
        }

        setEmail(user.email || "");

        // Check if onboarding already completed
        const isComplete = await checkOnboardingComplete(user.id);
        if (isComplete) {
          router.push("/dashboard");
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error("Error checking user:", error);
        router.push("/login");
      }
    };

    checkUserAndOnboarding();
  }, [router, supabase]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, "");
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length === 10;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Save step 1 data and move to step 2
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save personal info (without marking onboarding as complete)
      await createOrUpdateProfile(user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber,
        email: email,
        onboarding_completed: false,
        is_admin: false,
      });

      // Move to step 2
      setStep(2);
      setError(null);
    } catch (error: any) {
      setError(error.message || "Failed to save profile. Please try again.");
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation - at least one day must be selected
    if (availabilityDays.length === 0) {
      setError("Please select at least one day you are available");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update profile with availability and mark onboarding as complete
      await createOrUpdateProfile(user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber,
        email: email,
        availability_days: availabilityDays,
        onboarding_completed: true,
        is_admin: false,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Failed to save availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setAvailabilityDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-darkBlue">Loading...</div>
      </div>
    );
  }

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
          <h2 className="text-xl font-semibold text-darkBlue">
            {step === 1 ? "Complete Your Profile" : "Select Your Availability"}
          </h2>
        </div>

        {/* Onboarding Cards with AnimatePresence */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* Step 1: Personal Information */
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ duration: 0.5 }}
              className="w-full neumorphic rounded-3xl p-8 shadow-neumorphic"
            >
              <form onSubmit={handleStep1Submit} className="space-y-5">
            {/* First Name field */}
            <div className="relative">
              <label htmlFor="firstName" className="block text-sm font-medium text-darkBlue mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 neumorphic-inset rounded-xl text-darkBlue placeholder-gray-400 focus:outline-none"
                placeholder="Enter your first name"
              />
            </div>

            {/* Last Name field */}
            <div className="relative">
              <label htmlFor="lastName" className="block text-sm font-medium text-darkBlue mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 neumorphic-inset rounded-xl text-darkBlue placeholder-gray-400 focus:outline-none"
                placeholder="Enter your last name"
              />
            </div>

            {/* Phone Number field */}
            <div className="relative">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-darkBlue mb-2">
                Phone Number
              </label>
              <div className="absolute left-4 top-[42px]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 3.33333C2.5 2.41286 3.24619 1.66667 4.16667 1.66667H6.66667C7.58714 1.66667 8.33333 2.41286 8.33333 3.33333V4.16667C8.33333 8.41286 11.2538 11.3333 15.5 11.3333H16.3333C17.2538 11.3333 18 12.0795 18 13V15.5C18 16.4205 17.2538 17.1667 16.3333 17.1667H13.3333C6.98481 17.1667 2.5 12.6819 2.5 6.33333V3.33333Z"
                    stroke="#4B5563"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                required
                maxLength={14}
                className="w-full pl-12 pr-4 py-3 neumorphic-inset rounded-xl text-darkBlue placeholder-gray-400 focus:outline-none"
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Email field (read-only) */}
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-darkBlue mb-2">
                Email
              </label>
              <div className="absolute left-4 top-[42px]">
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
                readOnly
                className="w-full pl-12 pr-4 py-3 neumorphic-inset rounded-xl text-darkBlue/70 placeholder-gray-400 focus:outline-none bg-gray-50/50 cursor-not-allowed"
                placeholder="Email"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 px-4 neumorphic-button text-white font-semibold rounded-xl transition-all duration-300"
                >
                  Continue
                </motion.button>
              </form>
            </motion.div>
          ) : (
            /* Step 2: Availability Selection */
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full neumorphic rounded-3xl p-8 shadow-neumorphic"
            >
              <form onSubmit={handleStep2Submit} className="space-y-5">
                <div>
                  <p className="text-sm text-darkBlue/70 mb-4 text-center">
                    Select the days of the week you are available to volunteer
                  </p>
                  
                  {/* Days Checkboxes */}
                  <div className="space-y-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <label
                        key={day}
                        className="flex items-center cursor-pointer p-3 neumorphic-inset rounded-xl hover:bg-gray-50/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={availabilityDays.includes(day)}
                          onChange={() => toggleDay(day)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all mr-3 ${
                            availabilityDays.includes(day)
                              ? "bg-primary shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-1px_-1px_2px_rgba(255,255,255,0.3)]"
                              : "bg-gray-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]"
                          }`}
                        >
                          {availabilityDays.includes(day) && (
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
                        <span className="text-darkBlue font-medium">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    className="flex-1 py-3 px-4 bg-gray-200 text-darkBlue font-semibold rounded-xl shadow-neumorphic-sm transition-all duration-300 hover:bg-gray-300"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 neumorphic-button text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Complete"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

