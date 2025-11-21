"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, XCircle } from "lucide-react";
import { getMyRoutes, cancelRoute, VolunteerRoutesByWeek } from "@/lib/supabase/volunteer";

interface MyRoutesCardProps {
  volunteerId: string;
}

const MyRoutesCard = React.memo(function MyRoutesCard({ volunteerId }: MyRoutesCardProps) {
  const [routes, setRoutes] = useState<VolunteerRoutesByWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadRoutes();
  }, [volunteerId]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("MyRoutesCard loading routes for volunteer:", volunteerId);
      const data = await getMyRoutes(volunteerId);
      console.log("MyRoutesCard received routes:", data);
      setRoutes(data);
    } catch (err: any) {
      console.error("Error loading routes:", err);
      setError(err.message || "Failed to load your routes");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (assignmentId: string, day: string, routeNumber: number) => {
    const confirmed = confirm(
      `Are you sure you want to cancel ${day} - Route ${routeNumber}?\n\nThis will make the route available for other volunteers.`
    );

    if (!confirmed) return;

    try {
      setCancelling(assignmentId);
      await cancelRoute(assignmentId, volunteerId);
      await loadRoutes(); // Refresh the list
    } catch (err: any) {
      console.error("Error cancelling route:", err);
      alert(err.message || "Failed to cancel route");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="neumorphic pt-4 h-[550px] w-full flex flex-col overflow-hidden">
      {/* Header - Centered */}
      <div className="flex-shrink-0 mb-0 text-center">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-7 h-7 text-primary" strokeWidth={2.5} />
          <h2 className="text-3xl font-bold text-darkBlue">My Routes</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-textSecondary">Loading your routes...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && routes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg
              className="w-20 h-20 text-primary/30 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-textSecondary text-lg">No routes assigned yet</p>
            <p className="text-textSecondary text-sm mt-2">Check back later for assignments</p>
          </div>
        )}

        {!loading && !error && routes.length > 0 && (
          <div className=" p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((week, weekIndex) => (
              <motion.div
                key={week.weekId}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 15,
                  delay: weekIndex * 0.08
                }}
                style={{ willChange: 'transform, opacity' }}
                className="neumorphic p-5 rounded-2xl bg-background"
              >
                {/* Week Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" strokeWidth={2} />
                  <h3 className="text-lg font-bold text-primary">
                    {week.weekLabel}
                  </h3>
                </div>

                {/* Route Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {week.routes.map((route) => (
                    <div
                      key={route.assignmentId}
                      className="flex flex-col p-4 bg-white rounded-xl shadow-clay-sm"
                    >
                      {/* Day and Route */}
                      <div className="mb-3">
                        <div className="text-lg font-bold text-darkBlue">
                          {route.dayOfWeek}
                        </div>
                        <div className="text-sm text-textSecondary font-medium">
                          Route {route.routeNumber}
                        </div>
                      </div>

                      {/* Cancel Button */}
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        style={{ willChange: 'transform' }}
                        onClick={() => handleCancel(route.assignmentId, route.dayOfWeek, route.routeNumber)}
                        disabled={cancelling === route.assignmentId}
                        className="w-full px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors duration-150 shadow-md text-sm flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" strokeWidth={2.5} />
                        {cancelling === route.assignmentId ? "Cancelling..." : "Cancel"}
                      </motion.button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default MyRoutesCard;

