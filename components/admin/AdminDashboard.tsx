"use client";

import { motion } from "framer-motion";
import { formatWeekRange } from "@/lib/utils/dateUtils";

interface AdminDashboardProps {
  weekStart: Date;
  weekEnd: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCopyPreviousWeek: () => void;
  onPublishWeek: () => void;
  onDayClick: (day: string) => void;
  assignmentCounts: { [key: string]: number };
  isPublished: boolean;
  copyingWeek: boolean;
  publishingWeek: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TOTAL_ROUTES = 15;

export default function AdminDashboard({
  weekStart,
  weekEnd,
  onPreviousWeek,
  onNextWeek,
  onCopyPreviousWeek,
  onPublishWeek,
  onDayClick,
  assignmentCounts,
  isPublished,
  copyingWeek,
  publishingWeek,
}: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Week Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center gap-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPreviousWeek}
          className="w-14 h-14 neumorphic rounded-xl flex items-center justify-center text-primary hover:text-primary-dark transition-colors"
          aria-label="Previous week"
        >
          <svg
            width="28"
            height="28"
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

        <div className="neumorphic rounded-2xl px-10 py-5 min-w-[240px] text-center">
          <h2 className="text-3xl font-bold text-darkBlue">
            {formatWeekRange(weekStart, weekEnd)}
          </h2>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextWeek}
          className="w-14 h-14 neumorphic rounded-xl flex items-center justify-center text-primary hover:text-primary-dark transition-colors"
          aria-label="Next week"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex gap-5 justify-center flex-wrap"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCopyPreviousWeek}
          disabled={copyingWeek}
          className="px-8 py-4 text-lg neumorphic-button text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copyingWeek ? "Copying..." : "Copy Previous Week"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPublishWeek}
          disabled={publishingWeek}
          className="px-8 py-4 text-lg bg-limeGreen text-darkBlue font-bold rounded-xl shadow-[6px_6px_12px_rgba(191,255,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-limeGreen/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublished ? "Published ✓" : publishingWeek ? "Publishing..." : "Publish Week"}
        </motion.button>
      </motion.div>

      {/* Day Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
      >
        {DAYS.map((day) => {
          const assigned = assignmentCounts[day] || 0;
          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDayClick(day)}
              className="neumorphic rounded-3xl p-10 shadow-neumorphic cursor-pointer hover:shadow-neumorphic-sm transition-all duration-200"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-darkBlue mb-4">{day}</h3>
                <div className="text-base text-darkBlue/70 mb-2 font-medium">Assigned</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                  {assigned}/{TOTAL_ROUTES}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

