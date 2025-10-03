import React, { useState, useEffect } from 'react';
import { colors } from '../theme/colors';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { getUserNames } from '../lib/userNames';
import { getUserProfiles } from '../lib/userProfiles';

// Composant Avatar avec avatars colorés
const UserAvatar = ({ userId, userName, className = "w-6 h-6" }) => {
  // Générer une couleur basée sur l'UID pour avoir des avatars uniques
  const getAvatarColor = (uid) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
    ];
    
    // Utiliser l'UID pour choisir une couleur de manière déterministe
    const hash = uid.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  // Obtenir les initiales du nom d'utilisateur ou de l'UID
  const getInitials = () => {
    if (userName && userName.length >= 2) {
      return userName.slice(0, 2).toUpperCase();
    }
    return userId.slice(0, 2).toUpperCase();
  };
  
  return (
    <div className={`${className} rounded-full flex items-center justify-center text-xs font-bold text-white border border-slate-600 ${getAvatarColor(userId)}`}>
      {getInitials()}
    </div>
  );
};

export default function LeaderboardModal({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('day'); // 'day', 'week', 'month'
  const [userRank, setUserRank] = useState(null);
  const [nextPeriodTime, setNextPeriodTime] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [userProfiles, setUserProfiles] = useState({});

  const getNextPeriodTime = (period) => {
    const now = new Date();
    const nextPeriod = new Date(now);
    
    switch (period) {
      case 'day':
        nextPeriod.setDate(nextPeriod.getDate() + 1);
        nextPeriod.setHours(0, 0, 0, 0);
        break;
      case 'week':
        // Prochain lundi
        const dayOfWeek = nextPeriod.getDay();
        const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // Dimanche = 0, donc 1 jour, sinon 8 - jour actuel
        nextPeriod.setDate(nextPeriod.getDate() + daysToNextMonday);
        nextPeriod.setHours(0, 0, 0, 0);
        break;
      case 'month':
        // Premier du mois suivant
        nextPeriod.setMonth(nextPeriod.getMonth() + 1, 1);
        nextPeriod.setHours(0, 0, 0, 0);
        break;
    }
    
    return nextPeriod;
  };

  const formatTimeUntilNext = (nextTime) => {
    const now = new Date();
    const diff = nextTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Maintenant";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Dans ${hours}h ${minutes}m`;
    } else {
      return `Dans ${minutes}m`;
    }
  };

  const getPeriodTimestamp = (period) => {
    const now = new Date();
    const timestamp = new Date(now);
    
    switch (period) {
      case 'day':
        timestamp.setHours(0, 0, 0, 0);
        break;
      case 'week':
        // Calculer le début de la semaine (lundi)
        const dayOfWeek = timestamp.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Dimanche = 0, donc 6 jours en arrière
        timestamp.setDate(timestamp.getDate() - daysToMonday);
        timestamp.setHours(0, 0, 0, 0);
        break;
      case 'month':
        timestamp.setDate(1);
        timestamp.setHours(0, 0, 0, 0);
        break;
    }
    
    console.log(`[Leaderboard] Période ${period}:`, timestamp.toISOString());
    return Timestamp.fromDate(timestamp);
  };

  const fetchLeaderboard = async (selectedPeriod) => {
    setLoading(true);
    try {
      const startTimestamp = getPeriodTimestamp(selectedPeriod);
      const nextPeriod = getNextPeriodTime(selectedPeriod);
      setNextPeriodTime(nextPeriod);
      
      const pricesRef = collection(db, 'publicPrices');
      const q = query(pricesRef, where('lastAt', '>=', startTimestamp));
      
      const snapshot = await getDocs(q);
      console.log(`[Leaderboard] ${selectedPeriod}: ${snapshot.size} documents trouvés`);
      
      const userStats = new Map();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.lastUserId) {
          const userId = data.lastUserId;
          userStats.set(userId, (userStats.get(userId) || 0) + 1);
        }
      });
      
      console.log(`[Leaderboard] ${selectedPeriod}: ${userStats.size} utilisateurs uniques`);

      // Convertir en array et trier par nombre de contributions
      const sortedUsers = Array.from(userStats.entries())
        .map(([userId, contributions]) => ({ userId, contributions }))
        .sort((a, b) => b.contributions - a.contributions)
        .slice(0, 10); // Top 10

      setLeaderboard(sortedUsers);
      
      // Charger les noms d'utilisateur et profils
      const userIds = sortedUsers.map(user => user.userId);
      console.log(`[Leaderboard] Chargement des profils pour les UIDs:`, userIds);
      
      try {
        const names = await getUserNames(userIds);
        const profiles = await getUserProfiles(userIds);
        console.log(`[Leaderboard] Noms chargés:`, names);
        console.log(`[Leaderboard] Profils chargés:`, profiles);
        setUserNames(names);
        setUserProfiles(profiles);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Continuer sans les données personnalisées
        setUserNames({});
        setUserProfiles({});
      }
      
      // Trouver le rang de l'utilisateur actuel (si connecté)
      if (auth.currentUser) {
        const userRankIndex = sortedUsers.findIndex(user => user.userId === auth.currentUser.uid);
        setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard(period);
    }
  }, [isOpen, period]);

  // Mise à jour du temps en temps réel
  useEffect(() => {
    if (!isOpen || !nextPeriodTime) return;
    
    const interval = setInterval(() => {
      // Force un re-render pour mettre à jour le temps
      setNextPeriodTime(new Date(nextPeriodTime.getTime()));
    }, 60000); // Mise à jour toutes les minutes
    
    return () => clearInterval(interval);
  }, [isOpen, nextPeriodTime]);

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'day': return 'Aujourd\'hui';
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      default: return 'Aujourd\'hui';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">🏆 Leaderboard Communautaire</h2>
            <p className="text-sm text-slate-400 mt-1">Top contributeurs aux prix communautaires</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filtres de période */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex gap-2">
            {['day', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  period === p
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {getPeriodLabel(p)}
              </button>
            ))}
          </div>
          
          {/* Indicateur de temps */}
          {nextPeriodTime && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>
                Prochaine période dans : <span className="text-emerald-400 font-semibold">{formatTimeUntilNext(nextPeriodTime)}</span>
              </span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-700 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                    <div className="w-16 h-6 bg-slate-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-slate-400">Aucune contribution pour cette période</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user.userId}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    index < 3
                      ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30'
                      : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {getRankIcon(index + 1)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {/* Avatar coloré avec initiales du nom d'utilisateur */}
                      <UserAvatar 
                        userId={user.userId}
                        userName={userNames[user.userId]}
                        className="w-6 h-6"
                      />
                      <span className="text-white font-medium truncate">
                        {userNames[user.userId] || `Utilisateur ${user.userId.slice(-4)}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {user.contributions} prix renseigné{user.contributions > 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-500/20 text-gray-400' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-600/20 text-slate-400'
                    }`}>
                      {user.contributions}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec rang de l'utilisateur */}
        {userRank && (
          <div className="p-6 border-t border-slate-700 bg-slate-900/50">
            <div className="text-center">
              <p className="text-sm text-slate-400">
                Votre rang : <span className="text-emerald-400 font-semibold">#{userRank}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
