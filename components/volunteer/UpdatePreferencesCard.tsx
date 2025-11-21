"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Check, AlertCircle, CheckCircle2, Save } from "lucide-react";
import { updateVolunteerPreferences, UpdatePreferencesResult } from "@/lib/supabase/volunteer";
import { getUserProfile } from "@/lib/supabase/profile";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

interface UpdatePreferencesCardProps {
  volunteerId: string;
  onPreferencesUpdated?: () => void;
}

const UpdatePreferencesCard = React.memo(function UpdatePreferencesCard({
  volunteerId,
  onPreferencesUpdated
}: UpdatePreferencesCardProps) {
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentAvailability = async () => {
      try {
        const profile = await getUserProfile(volunteerId);
        if (profile && profile.availability_days) {
          setAvailabilityDays(profile.availability_days || []);
        }
      } catch (error) {
        console.error("Error fetching current availability:", error);
        setError("Failed to load current preferences");
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentAvailability();
  }, [volunteerId]);

  const toggleDay = (day: string) => {
    setAvailabilityDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
    // Clear messages when user makes changes
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation - allow removing all days (they can still see open slots)
    try {
      const result: UpdatePreferencesResult = await updateVolunteerPreferences(
        volunteerId,
        availabilityDays
      );

      // Build success message
      let message = "Preferences updated successfully!";

      if (result.removedAssignments > 0) {
        message = `Preferences updated! Removed from ${result.removedAssignments} route${result.removedAssignments === 1 ? "" : "s"} across ${result.affectedWeeks} future week${result.affectedWeeks === 1 ? "" : "s"}.`;
      } else if (result.affectedWeeks === 0) {
        message = "Preferences updated for future weeks.";
      } else {
        message = "Preferences updated! No changes needed to future assignments.";
      }

      setSuccess(message);

      // Callback to refresh other cards if needed
      if (onPreferencesUpdated) {
        onPreferencesUpdated();
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      setError(error.message || "Failed to update preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="neumorphic p-10 h-[500px] w-full flex items-center justify-center">
        <div className="text-darkBlue">Loading...</div>
      </div>
    );
  }

  return (
    <div className="neumorphic p-8 h-[550px] w-full flex flex-col">
      {/* Header - Compact */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 rounded-full flex-shrink-0">
            <UserCircle className="w-8 h-8 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-darkBlue">Update Preferences</h2>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full">
          {/* Warning/Info Box - Compact */}
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-300 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
              <div className="text-xs text-amber-900">
                <p className="font-semibold mb-1">How this works:</p>
                <p>Updating preferences affects future weeks. Adding days makes you available; removing days removes you from routes.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Days Checkboxes - Compact Grid */}
            <div className="mb-4">
              <p className="text-xs text-darkBlue/70 mb-3 font-medium">
                Select the days you are available to volunteer
              </p>

              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <motion.label
                    key={day}
                    className="flex items-center cursor-pointer p-3 neumorphic-inset rounded-lg hover:bg-gray-50/50 transition-colors duration-150"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="checkbox"
                      checked={availabilityDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="sr-only"
                    />
                    <motion.div
                      className={`w-5 h-5 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0`}
                      animate={{
                        backgroundColor: availabilityDays.includes(day) ? "#3BB4C1" : "#f3f4f6",
                        scale: availabilityDays.includes(day) ? [1, 1.2, 1] : 1
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <Check
                        className="w-3 h-3 text-white"
                        strokeWidth={3}
                        style={{
                          opacity: availabilityDays.includes(day) ? 1 : 0,
                          transform: availabilityDays.includes(day) ? 'scale(1)' : 'scale(0.5)',
                          transition: 'all 0.15s'
                        }}
                      />
                    </motion.div>
                    <span className="text-darkBlue font-medium text-base flex-shrink-0">{day}</span>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Message Area - Fixed height to prevent layout shifts */}
            <div className="h-[80px] mb-5 flex items-start">
              <AnimatePresence mode="wait">
                {availabilityDays.length === 0 && !error && !success && (
                  <motion.div
                    key="warning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
                      <p>
                        <strong>Note:</strong> You're removing all availability days. You can still view and sign up for open slots, but admins won't be able to assign you to routes.
                      </p>
                    </div>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full "
                  >
                    <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
                      {success}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              type="submit"
              disabled={loading}
              className="w-full -mt-12 py-3 px-4 neumorphic-button text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" strokeWidth={2.5} />
              {loading ? "Updating..." : "Update Preferences"}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
});

export default UpdatePreferencesCard;

