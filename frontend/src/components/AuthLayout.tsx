import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AuthLayout: React.FC = () => {
  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Full-height content, no header */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full h-full flex items-center justify-center"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
