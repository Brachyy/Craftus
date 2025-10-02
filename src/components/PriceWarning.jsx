// src/components/PriceWarning.jsx
import React from "react";
import { 
  detectAnomaly, 
  calculateTimeAgo, 
  generateWarningMessage,
  getFluctuationWarning 
} from "../lib/anomalyDetection";

// Fonction pour obtenir la couleur de l'input basée sur la fluctuation
export function getInputColor(fluctuation) {
  if (fluctuation <= 20) {
    return "border-green-500/30 bg-green-900/10"; // Vert assombri
  } else if (fluctuation <= 50) {
    return "border-yellow-500/30 bg-yellow-900/10"; // Jaune assombri
  } else if (fluctuation <= 100) {
    return "border-orange-500/30 bg-orange-900/10"; // Orange assombri
  } else {
    return "border-red-500/30 bg-red-900/10"; // Rouge assombri
  }
}

export default function PriceWarning({ 
  currentPrice, 
  priceHistory = [], 
  lastPriceDate,
  serverId 
}) {
  // Vérifier que nous avons des données valides
  if (!currentPrice || typeof currentPrice !== 'number' || currentPrice <= 0) {
    return null;
  }

  // Extraire les prix de l'historique (seulement les prix valides)
  const validPrices = priceHistory
    .filter(h => h && typeof h.p === 'number' && h.p > 0)
    .map(h => h.p);

  // Détecter les anomalies
  const anomaly = detectAnomaly(currentPrice, validPrices);
  
  // Calculer le temps écoulé
  const timeInfo = calculateTimeAgo(lastPriceDate);
  
  // Générer les messages de warning
  const warningInfo = generateWarningMessage(anomaly, timeInfo);

  // Toujours afficher les warnings (même pour les prix normaux)
  // if (!warningInfo.show) {
  //   console.log(`❌ Pas de warning à afficher`);
  //   return null;
  // }

  // Déterminer la couleur selon l'ancienneté
  const getTimeColor = (timeInfo) => {
    if (timeInfo.timeAgo > 24 * 60 * 60 * 1000) { // Plus d'un jour
      return 'text-red-400';
    } else if (timeInfo.timeAgo > 60 * 60 * 1000) { // Plus d'une heure
      return 'text-yellow-400';
    } else {
      return 'text-slate-400';
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      {/* Temps avec horloge toujours visible */}
      <div className="flex items-center gap-1" title={`Prix mis à jour il y a ${timeInfo.display}`}>
        <span className={getTimeColor(timeInfo)}>
          🕒
        </span>
        <span className={getTimeColor(timeInfo)}>
          {timeInfo.display}
        </span>
      </div>
    </div>
  );
}
