// src/lib/anomalyDetection.js
// Détection d'anomalies pour les prix des ingrédients uniquement

/**
 * Calcule le z-score d'un prix par rapport à l'historique
 * @param {number} price - Prix à analyser
 * @param {Array<number>} prices - Historique des prix
 * @returns {number} Z-score
 */
export function calculateZScore(price, prices) {
  if (!prices || prices.length === 0 || !price) return 0;
  
  const validPrices = prices.filter(p => typeof p === 'number' && p > 0);
  if (validPrices.length === 0) return 0;
  
  const mean = validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length;
  const variance = validPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / validPrices.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  
  return (price - mean) / stdDev;
}

/**
 * Calcule l'IQR et détecte les outliers
 * @param {Array<number>} prices - Historique des prix
 * @returns {Object} {q1, q3, iqr, outliers}
 */
export function calculateIQR(prices) {
  if (!prices || prices.length === 0) {
    return { q1: 0, q3: 0, iqr: 0, outliers: [] };
  }
  
  const validPrices = prices.filter(p => typeof p === 'number' && p > 0).sort((a, b) => a - b);
  if (validPrices.length === 0) {
    return { q1: 0, q3: 0, iqr: 0, outliers: [] };
  }
  
  const n = validPrices.length;
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  
  const q1 = validPrices[q1Index];
  const q3 = validPrices[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers = validPrices.filter(p => p < lowerBound || p > upperBound);
  
  return { q1, q3, iqr, outliers };
}

/**
 * Détecte si un prix est une anomalie
 * @param {number} price - Prix à analyser
 * @param {Array<number>} prices - Historique des prix
 * @returns {Object} {isAnomaly, reason, zScore, fluctuation}
 */
export function detectAnomaly(price, prices) {
  if (!price || !prices || prices.length === 0) {
    return { isAnomaly: false, reason: 'no_data', zScore: 0, fluctuation: 0 };
  }
  
  // Prendre seulement les 5 derniers prix pour atténuer la moyenne
  // Les prix peuvent être des objets {price: number, t: timestamp} ou des nombres directs
  const recentPrices = prices
    .map(p => typeof p === 'object' && p.price ? p.price : p) // Extraire le prix si c'est un objet
    .filter(p => typeof p === 'number' && p > 0)
    .slice(-5);
  if (recentPrices.length < 2) {
    return { isAnomaly: false, reason: 'insufficient_data', zScore: 0, fluctuation: 0 };
  }
  
  // Calculer la moyenne des prix récents
  const average = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
  // Calculer la fluctuation en pourcentage par rapport à la moyenne récente (dans les deux sens)
  const fluctuation = average > 0 ? ((price - average) / average) * 100 : 0;
  const absFluctuation = Math.abs(fluctuation);
  
  // Déterminer le niveau de warning basé sur la fluctuation absolue
  let warningLevel = 'normal';
  if (absFluctuation > 100) {
    warningLevel = 'critical'; // Rouge
  } else if (absFluctuation > 50) {
    warningLevel = 'high'; // Orange
  } else if (absFluctuation > 20) {
    warningLevel = 'medium'; // Jaune
  } else {
    warningLevel = 'normal'; // Vert
  }
  
  return {
    isAnomaly: absFluctuation > 20, // Warning si > 20% dans les deux sens
    reason: warningLevel,
    zScore: 0, // Pas utilisé pour le nouveau système
    fluctuation: Math.round(absFluctuation),
    direction: fluctuation > 0 ? 'above' : 'below' // Direction de la fluctuation
  };
}

/**
 * Détermine le niveau de warning basé sur la fluctuation
 * @param {number} fluctuation - Fluctuation en pourcentage
 * @returns {Object} {level, color, emoji}
 */
export function getFluctuationWarning(fluctuation) {
  if (fluctuation <= 20) {
    return { level: 'normal', color: 'text-green-400', emoji: '✅' };
  } else if (fluctuation <= 50) {
    return { level: 'medium', color: 'text-yellow-400', emoji: '⚠️' };
  } else if (fluctuation <= 100) {
    return { level: 'high', color: 'text-orange-400', emoji: '🚨' };
  } else {
    return { level: 'critical', color: 'text-red-400', emoji: '🚨' };
  }
}

/**
 * Calcule le temps écoulé depuis une date
 * @param {Date|string|number} date - Date à comparer
 * @returns {Object} {timeAgo, display, isOld}
 */
export function calculateTimeAgo(date) {
  if (!date) {
    return { timeAgo: null, display: '', isOld: false };
  }
  
  const now = new Date();
  let pastDate;
  
  // Gestion spéciale pour les Timestamps Firebase
  if (date && typeof date === 'object' && date.seconds && date.nanoseconds !== undefined) {
    // Timestamp Firebase
    pastDate = new Date(date.seconds * 1000 + Math.floor(date.nanoseconds / 1000000));
  } else {
    // Date normale
    pastDate = new Date(date);
  }
  
  if (isNaN(pastDate.getTime())) {
    return { timeAgo: null, display: '', isOld: false };
  }
  
  const diffMs = now - pastDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  let display = '';
  let isOld = false;
  
  if (diffSeconds < 60) {
    display = `${diffSeconds}s`;
  } else if (diffMinutes < 60) {
    display = `${diffMinutes}m`;
  } else if (diffHours < 24) {
    display = `${diffHours}h`;
    isOld = diffHours >= 1; // Warning si plus d'1h
  } else {
    display = `${diffDays}j`;
    isOld = true;
  }
  
  return { timeAgo: diffMs, display, isOld };
}

/**
 * Génère un message de warning pour l'utilisateur
 * @param {Object} anomaly - Résultat de detectAnomaly
 * @param {Object} timeInfo - Résultat de calculateTimeAgo
 * @returns {Object} {message, type, show}
 */
export function generateWarningMessage(anomaly, timeInfo) {
  const warnings = [];
  
  // Toujours afficher le temps (avec ou sans horloge selon l'âge)
  const timeEmoji = timeInfo.isOld ? '🕒' : '';
  warnings.push({
    type: 'time',
    message: `${timeEmoji} ${timeInfo.display}`,
    color: timeInfo.isOld ? 'text-yellow-400' : 'text-slate-400',
    emoji: timeEmoji
  });
  
  // Warning de fluctuation (afficher si fluctuation > 20%)
  if (anomaly.fluctuation > 20) {
    const fluctuationWarning = getFluctuationWarning(anomaly.fluctuation);
    const direction = anomaly.direction === 'above' ? 'au-dessus' : 'en-dessous';
    warnings.push({
      type: 'fluctuation',
      message: `Prix ${Math.round(anomaly.fluctuation)}% ${direction} de la moyenne`,
      color: fluctuationWarning.color,
      emoji: fluctuationWarning.emoji
    });
  }
  
  return {
    warnings,
    show: warnings.length > 0,
    hasTimeWarning: timeInfo.isOld,
    hasFluctuationWarning: anomaly.fluctuation > 20
  };
}
