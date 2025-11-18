"use client";

import { motion } from "framer-motion";
import LogoutButton from "./LogoutButton";

export default function AdminContent() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-darkBlue/70 mt-1">Meals on Wheels Orange County</p>
        </div>
        <LogoutButton />
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="neumorphic rounded-3xl p-12 shadow-neumorphic"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <div className="inline-block p-6 bg-primary/10 rounded-full mb-4 shadow-[6px_6px_12px_rgba(0,180,193,0.2),-6px_-6px_12px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,180,193,0.1)]">
              <svg
                className="w-16 h-16 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-2xl font-semibold text-darkBlue mb-4"
          >
            Welcome to the Admin Portal
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-darkBlue/70 text-lg"
          >
            Volunteer management features coming soon...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

