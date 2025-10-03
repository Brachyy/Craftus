// Système de rangs Dofus pour Craftus
export const RANKS = [
  {
    id: 'boufton',
    name: 'Boufton',
    emoji: '🐑',
    minParticipations: 0,
    maxParticipations: 49,
    color: 'text-gray-400',
    bgColor: 'bg-gray-800',
    borderColor: 'border-gray-600',
    effect: '',
    message: 'Vous commencez votre aventure...'
  },
  {
    id: 'aventurier',
    name: 'Aventurier d\'Astrub',
    emoji: '🌟',
    minParticipations: 50,
    maxParticipations: 149,
    color: 'text-blue-300',
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-500',
    effect: 'animate-rank-cosmic-pulse',
    message: 'Vous explorez de nouveaux horizons...'
  },
  {
    id: 'disciple',
    name: 'Disciple d\'Otomaï',
    emoji: '🧪',
    minParticipations: 150,
    maxParticipations: 349,
    color: 'text-green-300',
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-500',
    effect: 'animate-rank-magic-bounce',
    message: 'Votre savoir grandit...'
  },
  {
    id: 'chasseur',
    name: 'Chasseur de Dofus',
    emoji: '🥚',
    minParticipations: 350,
    maxParticipations: 749,
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-900/30',
    borderColor: 'border-yellow-500',
    effect: 'animate-rank-golden-glow',
    message: 'Vous approchez du trésor...'
  },
  {
    id: 'protecteur',
    name: 'Protecteur des Mois',
    emoji: '⏳',
    minParticipations: 750,
    maxParticipations: 1599,
    color: 'text-purple-300',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-500',
    effect: 'animate-rank-time-spiral',
    message: 'Vous maîtrisez le temps...'
  },
  {
    id: 'champion',
    name: 'Champion du Kolizéum',
    emoji: '🏛️',
    minParticipations: 1600,
    maxParticipations: 3199,
    color: 'text-red-300',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-500',
    effect: 'animate-rank-epic-glow',
    message: 'Vous dominez l\'arène...'
  },
  {
    id: 'heros',
    name: 'Héros de Bonta/Brâkmar',
    emoji: '⚔️',
    minParticipations: 3200,
    maxParticipations: 6399,
    color: 'text-indigo-300',
    bgColor: 'bg-gradient-to-r from-blue-900/30 to-red-900/30',
    borderColor: 'border-indigo-500',
    effect: 'animate-rank-epic-glow',
    message: 'Vous défendez votre cité...'
  },
  {
    id: 'gardien',
    name: 'Gardien du Krosmoz',
    emoji: '🌌',
    minParticipations: 6400,
    maxParticipations: Infinity,
    color: 'text-rainbow',
    bgColor: 'bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-blue-900/30',
    borderColor: 'border-rainbow',
    effect: 'animate-rank-universe-spin',
    message: 'Vous protégez l\'univers !'
  }
];

// Fonction pour obtenir le rang d'un utilisateur basé sur ses participations
export function getUserRank(participations) {
  return RANKS.find(rank => 
    participations >= rank.minParticipations && 
    participations <= rank.maxParticipations
  ) || RANKS[0]; // Fallback au rang le plus bas
}

// Fonction pour obtenir le prochain rang
export function getNextRank(currentRank) {
  const currentIndex = RANKS.findIndex(rank => rank.id === currentRank.id);
  return currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null;
}

// Fonction pour obtenir le message de remerciement personnalisé
export function getRankMessage(userName, rank) {
  return `Bonjour ${userName} le ${rank.name} ! ${rank.message}`;
}

// Fonction pour obtenir la date de début du mois actuel
export function getCurrentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Fonction pour vérifier si on est dans un nouveau mois
export function isNewMonth(lastResetDate) {
  const currentMonthStart = getCurrentMonthStart();
  return !lastResetDate || lastResetDate < currentMonthStart;
}
