import React, { useState, useEffect } from 'react';
import { colors } from '../theme/colors';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';
import LeaderboardModal from './LeaderboardModal';

export default function CommunityReward({ user, userName }) {
  const [todayUsers, setTodayUsers] = useState(0);
  const [userContribution, setUserContribution] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const fetchCommunityStats = async () => {
      try {
        // Calculer le début de la journée (00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = Timestamp.fromDate(today);

        // Chercher les utilisateurs qui ont ajouté des prix aujourd'hui
        const pricesRef = collection(db, 'publicPrices');
        const q = query(pricesRef, where('lastAt', '>=', todayTimestamp));
        
        const snapshot = await getDocs(q);
        const userIds = new Set();
        let userContributions = 0;
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.lastUserId) {
            userIds.add(data.lastUserId);
            // Compter les contributions de l'utilisateur actuel
            if (data.lastUserId === user.uid) {
              userContributions++;
            }
          }
        });

        setTodayUsers(userIds.size);
        setUserContribution(userContributions);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Valeurs par défaut si erreur
        setTodayUsers(4);
        setUserContribution(1);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCommunityStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className={`mb-4 rounded-2xl border ${colors.border} ${colors.panel} p-4`}>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Ne pas afficher si l'utilisateur n'a pas contribué aujourd'hui
  if (userContribution === 0) {
    return null;
  }

  return (
    <div className={`mb-4 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 ${colors.panel} p-4 relative overflow-hidden`}>
      {/* Effet de brillance dorée */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transform -skew-x-12 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 text-sm font-semibold">Contribution communautaire</span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">
              Bravo <span className="text-yellow-400">{userName || 'utilisateur'}</span> ! Vous faites partie des <span className="text-yellow-400">{todayUsers}</span> utilisateurs qui ont aidé la communauté aujourd'hui
            </h3>
            
            <p className="text-slate-300 text-sm mb-3">
              Vous avez renseigné <span className="text-yellow-400 font-semibold">{userContribution}</span> prix aujourd'hui. Merci pour votre contribution !
            </p>
            
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>🏆</span>
              <span>Vous participez activement à la communauté</span>
              <span>•</span>
              <span>Vos prix aident d'autres joueurs</span>
              <span>•</span>
              <span>Merci pour votre engagement</span>
            </div>
          </div>
          
          <div className="ml-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-xs text-yellow-400 font-semibold text-center">
              {userContribution} prix<br/>renseigné{userContribution > 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="mt-2 px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-xs font-medium rounded-lg transition-all duration-200 border border-yellow-500/30 hover:border-yellow-500/50"
            >
              📊 Leaderboard
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal Leaderboard */}
      <LeaderboardModal 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
    </div>
  );
}
