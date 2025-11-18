"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CategorizedVolunteers, VolunteerWithAssignments } from "@/lib/supabase/volunteers";

interface RouteSidebarProps {
  routeNumber: number;
  currentVolunteers: Array<{ id: string; first_name: string; last_name: string }>;
  volunteers: CategorizedVolunteers;
  onAssign: (volunteerId: string) => void;
  onRemove: (volunteerId: string) => void;
  onClose: () => void;
  assigning: boolean;
}

export default function RouteSidebar({
  routeNumber,
  currentVolunteers,
  volunteers,
  onAssign,
  onRemove,
  onClose,
  assigning,
}: RouteSidebarProps) {
  const getDayAbbreviation = (day: string): string => {
    return day.substring(0, 3);
  };

  const VolunteerItem = ({
    volunteer,
    type,
  }: {
    volunteer: VolunteerWithAssignments;
    type: "available" | "scheduled" | "notAvailable";
  }) => {
    const iconColor =
      type === "available"
        ? "text-primary"
        : type === "scheduled"
        ? "text-yellow-500"
        : "text-gray-400";

    const bgColor =
      type === "available"
        ? "bg-primary/30 border-2 border-primary"
        : type === "scheduled"
        ? "bg-yellow-100 border-2 border-yellow-400"
        : "bg-gray-200 border-2 border-gray-300";

    return (
      <motion.button
        whileHover={{ scale: 1.02, x: 5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAssign(volunteer.id)}
        disabled={assigning || type === "notAvailable"}
        className={`w-full p-4 rounded-xl ${bgColor} flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 shadow-md`}
      >
        {/* Icon */}
        <div className={iconColor}>
          {type === "available" && (
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path
                d="M16.6667 5L7.50004 14.1667L3.33337 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {type === "scheduled" && (
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" fill="currentColor" />
              <text x="10" y="13" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">
                !
              </text>
            </svg>
          )}
          {type === "notAvailable" && (
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {/* Volunteer Name */}
        <div className="flex-1 text-left">
          <div className="font-bold text-darkBlue text-base">
            {volunteer.first_name} {volunteer.last_name}
          </div>
          {type === "scheduled" && volunteer.assignmentsThisWeek.length > 0 && (
            <div className="text-sm text-darkBlue/80 font-medium mt-0.5">
              {volunteer.assignmentsThisWeek.map((a) => `(${getDayAbbreviation(a.day)})`).join(" ")}
            </div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-50 overflow-y-auto"
      >
        <div className="p-7 space-y-7">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-primary/20 pb-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Route {routeNumber}</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-darkBlue/70 hover:text-darkBlue rounded-lg hover:bg-gray-200"
              aria-label="Close sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.button>
          </div>

          {/* Current Assignments */}
          <div className="bg-white rounded-xl p-5 border-2 border-primary shadow-lg">
            <div className="text-base font-semibold text-primary mb-3">
              Current Assignments ({currentVolunteers.length}):
            </div>
            {currentVolunteers.length > 0 ? (
              <div className="space-y-3">
                {currentVolunteers.map((volunteer) => (
                  <div
                    key={volunteer.id}
                    className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30"
                  >
                    <div className="text-base font-bold text-darkBlue">
                      {volunteer.first_name} {volunteer.last_name}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRemove(volunteer.id)}
                      disabled={assigning}
                      className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors shadow-md"
                    >
                      Remove
                    </motion.button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-lg font-semibold text-darkBlue/50">None</div>
            )}
          </div>

          {/* Available Today */}
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <span className="text-primary text-xl">✓</span> Available Today
            </h3>
            <div className="space-y-2">
              {volunteers.available.length > 0 ? (
                volunteers.available.map((volunteer) => (
                  <VolunteerItem
                    key={volunteer.id}
                    volunteer={volunteer}
                    type="available"
                  />
                ))
              ) : (
                <div className="text-base text-darkBlue/50 italic p-4">
                  No volunteers available
                </div>
              )}
            </div>
          </div>

          {/* Already Scheduled This Week */}
          <div>
            <h3 className="text-lg font-bold text-yellow-700 mb-4 flex items-center gap-2">
              <span className="text-yellow-500 text-xl">⚠</span> Already Scheduled This Week
            </h3>
            <div className="space-y-2">
              {volunteers.alreadyScheduled.length > 0 ? (
                volunteers.alreadyScheduled.map((volunteer) => (
                  <VolunteerItem
                    key={volunteer.id}
                    volunteer={volunteer}
                    type="scheduled"
                  />
                ))
              ) : (
                <div className="text-base text-darkBlue/50 italic p-4">
                  No scheduled volunteers
                </div>
              )}
            </div>
          </div>

          {/* Not Available */}
          <div>
            <h3 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
              <span className="text-gray-400 text-xl">✕</span> Not Available
            </h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {volunteers.notAvailable.length > 0 ? (
                volunteers.notAvailable.map((volunteer) => (
                  <VolunteerItem
                    key={volunteer.id}
                    volunteer={volunteer}
                    type="notAvailable"
                  />
                ))
              ) : (
                <div className="text-base text-darkBlue/50 italic p-4">
                  All volunteers available
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

