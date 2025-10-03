import React, { useState, useEffect } from 'react';
import { getUserRankData, updateUserRank } from '../lib/userRanks';
import { getUserRank, RANKS } from '../lib/ranks';
import { colors } from '../theme/colors';
import AnimatedRank from './AnimatedRank';

export default function UserRankDisplay({ user, userName }) {
  const [userRankData, setUserRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRankModal, setShowRankModal] = useState(false);

  // Fonction pour obtenir le style du nom du rang selon le prestige
  const getRankNameStyle = (rankId) => {
    switch (rankId) {
      case 'boufton':
        return 'text-gray-400';
      case 'aventurier':
        return 'text-blue-300';
      case 'disciple':
        return 'text-green-300';
      case 'chasseur':
        return 'text-yellow-300 font-semibold';
      case 'protecteur':
        return 'text-purple-300 font-semibold';
      case 'champion':
        return 'text-red-300 font-bold';
      case 'heros':
        return 'text-indigo-300 font-bold';
      case 'gardien':
        return 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent font-bold text-lg';
      default:
        return 'text-gray-400';
    }
  };

  useEffect(() => {
    if (user && userName) {
      loadUserRank();
    }
  }, [user, userName]);

  const loadUserRank = async () => {
    try {
      setLoading(true);
      const data = await getUserRankData(user.uid);
      
      if (data) {
        setUserRankData(data);
      } else {
        // Créer un nouveau document utilisateur avec 0 participations
        const newData = await updateUserRank(user.uid, userName, 0);
        setUserRankData(newData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du rang:', error);
    } finally {
      setLoading(false);
    }
  };


  if (!user || !userName || loading) {
    return null;
  }

  if (!userRankData) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <span>🐑</span>
        <span>Boufton</span>
      </div>
    );
  }

  const currentRank = getUserRank(userRankData.monthlyParticipations);
  const nextRank = RANKS.find(rank => rank.minParticipations > currentRank.minParticipations);

  return (
    <>
      <div className="flex items-center gap-2">
        <div 
          className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${currentRank.borderColor} ${currentRank.bgColor}`}
          title={`${currentRank.name} - ${userRankData.monthlyParticipations} participations ce mois`}
        >
          <AnimatedRank 
            rankId={currentRank.id}
            rankName={currentRank.name}
          />
          <span className={`text-sm font-medium ${getRankNameStyle(currentRank.id)}`}>
            {currentRank.name}
          </span>
        </div>
        
      </div>

      {/* Modal de félicitations pour promotion */}
      {showRankModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${colors.panel} rounded-xl p-6 shadow-2xl border ${colors.border} max-w-md w-full`}>
            <div className="text-center">
              <div className="text-4xl mb-4">
                <AnimatedRank 
                  rankId={currentRank.id}
                  rankName={currentRank.name}
                />
              </div>
              <h3 className={`text-xl font-bold ${currentRank.color} mb-2`}>
                Félicitations !
              </h3>
              <p className="text-slate-300 mb-4">
                {getRankMessage(userName, currentRank)}
              </p>
              <p className="text-slate-400 text-sm mb-4">
                {userRankData.monthlyParticipations} participations ce mois
              </p>
              <button
                onClick={() => setShowRankModal(false)}
                className={`px-4 py-2 ${currentRank.bgColor} ${currentRank.color} border ${currentRank.borderColor} rounded-lg hover:opacity-80 transition-opacity`}
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
