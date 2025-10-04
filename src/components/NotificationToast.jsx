import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationToast({ 
  isVisible, 
  onClose, 
  itemName, 
  type = 'success' 
}) {
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setProgress(100);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isVisible) return;

    // Reset progress when notification becomes visible
    setProgress(100);

    // Animation de la barre de progression
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 50); // 5 secondes au total (100 * 50ms)

    return () => clearInterval(progressInterval);
  }, [isVisible, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-600',
          border: 'border-emerald-500',
          text: 'text-emerald-100',
          progress: 'bg-emerald-400'
        };
      case 'error':
        return {
          bg: 'bg-red-600',
          border: 'border-red-500',
          text: 'text-red-100',
          progress: 'bg-red-400'
        };
      case 'info':
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-500',
          text: 'text-blue-100',
          progress: 'bg-blue-400'
        };
      default:
        return {
          bg: 'bg-emerald-600',
          border: 'border-emerald-500',
          text: 'text-emerald-100',
          progress: 'bg-emerald-400'
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`
            ${colors.bg} ${colors.border} ${colors.text}
            rounded-xl border-2 shadow-2xl backdrop-blur-sm
            px-6 py-4 min-w-80 max-w-md
            relative overflow-hidden
          `}>
            {/* Barre de progression */}
            <div className="absolute top-0 left-0 h-1 bg-black/20 w-full">
              <motion.div
                className={`h-full ${colors.progress}`}
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
            </div>

            {/* Contenu */}
            <div className="flex items-center gap-3">
              {/* Icône avec animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 15,
                  delay: 0.1 
                }}
                className="text-2xl"
              >
                {getIcon()}
              </motion.div>

              {/* Texte */}
              <div className="flex-1">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-semibold text-sm"
                >
                  {type === 'success' ? 'Item mis en vente !' : 'Notification'}
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs opacity-90 truncate"
                >
                  {itemName}
                </motion.div>
              </div>

              {/* Bouton fermer */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                onClick={handleClose}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                ✕
              </motion.button>
            </div>

            {/* Effet de brillance */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
