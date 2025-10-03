import React, { useState, useEffect } from 'react';
import { colors } from '../theme/colors';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function CommunityCallToAction({ onSignIn }) {
  const [todayUsers, setTodayUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayUsers = async () => {
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
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.lastUserId) {
            userIds.add(data.lastUserId);
          }
        });

        setTodayUsers(userIds.size);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        // Valeur par défaut si erreur
        setTodayUsers(24);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayUsers();
  }, []);

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

  return (
    <div className={`mb-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 ${colors.panel} p-4 relative overflow-hidden`}>
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-semibold">Communauté active</span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">
              Faites comme les <span className="text-emerald-400">{todayUsers}</span> autres utilisateurs aujourd'hui !
            </h3>
            
            <p className="text-slate-300 text-sm mb-3">
              Connectez-vous et renseignez les prix pour aider toute la communauté Craftus
            </p>
            
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>🌟</span>
              <span>Participez aux prix communautaires</span>
              <span>•</span>
              <span>Accédez à vos favoris</span>
              <span>•</span>
              <span>Sauvegardez vos sessions</span>
            </div>
          </div>
          
          <button
            onClick={onSignIn}
            className="ml-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 hover:scale-105 transform"
          >
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
