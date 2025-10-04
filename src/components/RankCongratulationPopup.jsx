// src/components/RankCongratulationPopup.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RankCongratulationPopup({ isVisible, rankName, onClose }) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-r from-green-600 to-green-700 border-2 border-green-500 rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-white font-bold text-2xl mb-3">
              Félicitations !
            </h2>
            <p className="text-green-100 text-lg mb-4">
              Vous avez atteint le rang
            </p>
            <p className="text-yellow-300 font-bold text-xl mb-6">
              {rankName}
            </p>
            <p className="text-green-200 text-sm mb-6">
              Ce mois-ci ! Continuez comme ça ! 🚀
            </p>
            <button
              onClick={onClose}
              className="bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Merci ! 👍
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
