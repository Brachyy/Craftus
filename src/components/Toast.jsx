// src/components/Toast.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  duration = 5000 
}) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-900/90',
          border: 'border-green-500/30',
          icon: '✅',
          iconColor: 'text-green-400'
        };
      case 'error':
        return {
          bg: 'bg-red-900/90',
          border: 'border-red-500/30',
          icon: '❌',
          iconColor: 'text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-900/90',
          border: 'border-yellow-500/30',
          icon: '⚠️',
          iconColor: 'text-yellow-400'
        };
      default:
        return {
          bg: 'bg-blue-900/90',
          border: 'border-blue-500/30',
          icon: 'ℹ️',
          iconColor: 'text-blue-400'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`${styles.bg} ${styles.border} border rounded-xl p-4 shadow-2xl backdrop-blur-sm`}>
            <div className="flex items-start gap-3">
              <div className={`${styles.iconColor} text-xl flex-shrink-0`}>
                {styles.icon}
              </div>
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {title}
                  </h3>
                )}
                <p className="text-slate-300 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook pour utiliser les toasts facilement
export const useToast = () => {
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    duration: 5000
  });

  const showToast = (title, message, type = 'info', duration = 5000) => {
    setToast({
      isOpen: true,
      title,
      message,
      type,
      duration
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }));
  };

  const ToastComponent = () => (
    <Toast
      isOpen={toast.isOpen}
      onClose={hideToast}
      title={toast.title}
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
    />
  );

  return {
    showToast,
    hideToast,
    ToastComponent
  };
};
