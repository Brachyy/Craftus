// src/components/RankProgressBar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../theme/colors';

export default function RankProgressBar({ userRank, userContribution, userRankData, onShowRankPopup }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // Seuils mensuels pour chaque rang avec noms complets et couleurs
  const rankThresholds = {
    'boufton': { threshold: 0, name: 'Boufton', color: 'from-gray-500 to-gray-600' },
    'aventurier': { threshold: 50, name: 'Aventurier d\'Astrub', color: 'from-blue-500 to-blue-600' },
    'disciple': { threshold: 150, name: 'Disciple d\'Otomaï', color: 'from-green-500 to-green-600' },
    'chasseur': { threshold: 350, name: 'Chasseur de Dofus', color: 'from-yellow-500 to-yellow-600' },
    'protecteur': { threshold: 750, name: 'Protecteur des Mois', color: 'from-purple-500 to-purple-600' },
    'champion': { threshold: 1600, name: 'Champion du Kolizéum', color: 'from-red-500 to-red-600' },
    'heros': { threshold: 3200, name: 'Héros de Bonta/Brâkmar', color: 'from-indigo-500 to-indigo-600' },
    'gardien': { threshold: 6400, name: 'Gardien du Krosmoz', color: 'from-pink-500 to-purple-600' }
  };

  // Trouver le prochain rang à atteindre
  const getNextRank = (currentRank, contribution) => {
    const ranks = Object.keys(rankThresholds);
    const currentIndex = ranks.indexOf(currentRank);
    
    // Si c'est le dernier rang
    if (currentIndex === ranks.length - 1) {
      return null;
    }
    
    // Trouver le prochain rang non atteint
    for (let i = currentIndex + 1; i < ranks.length; i++) {
      if (contribution < rankThresholds[ranks[i]].threshold) {
        return {
          id: ranks[i],
          name: rankThresholds[ranks[i]].name,
          threshold: rankThresholds[ranks[i]].threshold,
          color: rankThresholds[ranks[i]].color,
          previousThreshold: rankThresholds[ranks[i - 1]].threshold
        };
      }
    }
    
    return null;
  };

  const nextRank = getNextRank(userRank, userContribution);
  
  // Vérifier si l'utilisateur vient d'atteindre un nouveau rang ce mois et déclencher le popup
  React.useEffect(() => {
    if (userRankData && userRankData.lastUpdated && userRank !== 'boufton') {
      const lastUpdateMonth = new Date(userRankData.lastUpdated.toDate()).getMonth();
      const currentMonth = new Date().getMonth();
      const lastUpdateYear = new Date(userRankData.lastUpdated.toDate()).getFullYear();
      const currentYear = new Date().getFullYear();
      
      // Si la dernière mise à jour est dans le mois actuel et l'année actuelle
      if (lastUpdateMonth === currentMonth && lastUpdateYear === currentYear) {
        const popupKey = `rank-popup-${userRank}-${currentMonth}-${currentYear}`;
        const hasShownPopup = localStorage.getItem(popupKey);
        
        if (!hasShownPopup) {
          // Afficher le popup et marquer comme affiché
          onShowRankPopup?.(rankThresholds[userRank]?.name || userRank);
          localStorage.setItem(popupKey, 'true');
        }
      }
    }
  }, [userRank, userRankData, onShowRankPopup]);

  if (!nextRank) {
    return (
      <div className={`mb-4 rounded-2xl border ${colors.border} ${colors.panel} p-4`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏆</div>
          <div>
            <h3 className="text-white font-semibold">Rang Maximum Atteint !</h3>
            <p className="text-sm text-slate-300">
              Vous avez atteint le rang le plus élevé avec {userContribution} contributions ce mois !
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.min(
    ((userContribution - nextRank.previousThreshold) / 
     (nextRank.threshold - nextRank.previousThreshold)) * 100, 
    100
  );

  const remaining = nextRank.threshold - userContribution;

  return (
    <div className="mb-4">
      {/* Barre de progression compacte */}
      <div className="relative">
        {/* Tooltip animé avec Framer Motion */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                x: mousePosition.x - 100 // Centre le tooltip sur la souris
              }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.2
              }}
              className="absolute bg-gradient-to-br from-slate-800 to-slate-900 text-white text-sm px-4 py-3 rounded-xl pointer-events-none whitespace-nowrap z-50 border border-slate-600 shadow-2xl backdrop-blur-sm"
              style={{ 
                top: '-160px',
                left: '0px',
                minWidth: '200px'
              }}
            >
              {/* En-tête avec icône */}
              <div className="flex items-center gap-2 mb-2">
                <div className="text-lg">📊</div>
                <span className="font-semibold text-yellow-300">Progression du Rang</span>
              </div>
              
              {/* Informations détaillées */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Contributions actuelles:</span>
                  <span className="font-bold text-blue-400">{userContribution}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Prochain rang:</span>
                  <span className={`font-bold bg-gradient-to-r ${nextRank.color} bg-clip-text text-transparent`}>
                    {nextRank.name}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Restantes:</span>
                  <span className="font-bold text-green-400">{remaining}</span>
                </div>
              </div>
              
              {/* Barre de progression mini */}
              <div className="mt-3 bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r ${nextRank.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                ></motion.div>
              </div>
              
              {/* Flèche vers le bas */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-slate-800"></div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Conteneur de la barre avec informations intégrées */}
        <div 
          className="w-full bg-slate-700 rounded-full h-6 overflow-hidden relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePosition({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
          }}
        >
          {/* Barre de progression */}
          <motion.div
            className={`h-full bg-gradient-to-r ${nextRank.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Pourcentage au centre de la barre */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white text-sm font-semibold drop-shadow-lg">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
