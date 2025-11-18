"use client";

import { motion } from "framer-motion";
import { Route, Assignment } from "@/lib/supabase/admin";

interface DayViewProps {
  day: string;
  date: Date;
  routes: Route[];
  assignments: Assignment[];
  onRouteClick: (routeId: string, routeNumber: number) => void;
  onBack: () => void;
  selectedRouteId: string | null;
  volunteers: { [key: string]: { first_name: string; last_name: string } };
  isPublished: boolean;
}

export default function DayView({
  day,
  date,
  routes,
  assignments,
  onRouteClick,
  onBack,
  selectedRouteId,
  volunteers,
  isPublished,
}: DayViewProps) {
  // Create a map of routeId -> array of volunteerIds for quick lookup
  const assignmentMap = new Map<string, string[]>();
  assignments.forEach((assignment) => {
    if (assignment.volunteer_id) {
      const existing = assignmentMap.get(assignment.route_id) || [];
      existing.push(assignment.volunteer_id);
      assignmentMap.set(assignment.route_id, existing);
    }
  });

  const formatDate = (date: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-12 h-12 neumorphic rounded-xl flex items-center justify-center text-darkBlue"
            aria-label="Back to week view"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
          <h2 className="text-3xl font-bold text-darkBlue">
            {day} • {formatDate(date)}
          </h2>
          {isPublished && (
            <span className="px-4 py-1.5 bg-limeGreen/20 text-primary text-base font-semibold rounded-lg border-2 border-limeGreen/50">
              Week Published ✓
            </span>
          )}
        </div>
      </div>

      {/* Route Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {routes.map((route) => {
          const volunteerIds = assignmentMap.get(route.id) || [];
          const assignedVolunteers = volunteerIds.map(id => volunteers[id]).filter(Boolean);
          const isSelected = selectedRouteId === route.id;

          return (
            <motion.button
              key={route.id}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRouteClick(route.id, route.route_number)}
              className={`p-7 rounded-2xl shadow-neumorphic cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "ring-4 ring-primary bg-gradient-to-br from-primary/10 to-limeGreen/10 shadow-[0_0_20px_rgba(0,180,193,0.3)]"
                  : "neumorphic hover:shadow-neumorphic-sm"
              }`}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-darkBlue mb-3">
                  Route {route.route_number}
                </h3>
                <div className="text-sm text-darkBlue/70 font-medium mb-2">
                  Assigned ({assignedVolunteers.length}):
                </div>
                <div className="text-base font-semibold text-darkBlue mt-1 space-y-1">
                  {assignedVolunteers.length > 0 ? (
                    assignedVolunteers.map((vol, idx) => (
                      <div key={idx} className="truncate">
                        {vol.first_name} {vol.last_name}
                      </div>
                    ))
                  ) : (
                    <div className="text-lg">—</div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

