// src/components/AdBlockInfo.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../theme/colors';

export default function AdBlockInfo({ isVisible, onDismiss }) {
  // Vérifier si l'utilisateur a déjà dit "J'ai compris" dans cette session
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('adblock-message-dismissed') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('adblock-message-dismissed', 'true');
    onDismiss();
  };

  if (!isVisible || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-500 rounded-2xl p-4 shadow-xl">
          {/* Icône et titre */}
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🛡️</div>
            <h3 className="text-white font-bold text-lg">
              Hé ! Pas si vite ! 😏
            </h3>
            <button
              onClick={onDismiss}
              className="ml-auto text-red-200 hover:text-white transition-colors text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Message principal */}
          <div className="text-red-100 space-y-2">
            <p className="text-sm font-medium">
              <span className="text-red-200 font-semibold">Votre bloqueur de pub</span> empêche Google Analytics de fonctionner.
            </p>
            
            <div className="bg-red-800/50 rounded-lg p-3 border border-red-600">
              <p className="text-sm">
                <span className="text-yellow-300 font-semibold">Pas d'inquiétude :</span> Craftus n'a <span className="text-white font-bold">aucune publicité</span> ! 🎉
              </p>
              <p className="text-xs mt-1 text-red-200">
                Analytics nous aide seulement à améliorer votre expérience. 
                <span className="text-yellow-300"> C'est tout !</span> ✨
              </p>
            </div>

            {/* Message humoristique */}
            <div className="bg-red-900/30 rounded-lg p-2 border border-red-700">
              <p className="text-xs text-red-200 italic">
                💡 <span className="text-yellow-300">Astuce :</span> Vous pouvez désactiver votre bloqueur pour ce site si vous voulez nous aider à comprendre comment vous utilisez Craftus. 
                <span className="text-white font-semibold"> Ou pas !</span> 😄
              </p>
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              J'ai compris ! 👍
            </button>
            <button
              onClick={() => window.open('https://support.google.com/analytics/answer/10089681', '_blank')}
              className="bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              En savoir plus 📖
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
