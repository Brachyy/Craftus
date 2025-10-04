import React, { useState, useEffect } from 'react';
import { colors } from '../theme/colors';

export default function SharePromotion({ user, selectedServer, isHelperOpen }) {
  const [showPromotion, setShowPromotion] = useState(false);
  const [showServerReminder, setShowServerReminder] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialiser le composant
  useEffect(() => {
    setIsReady(true); // Marquer le composant comme prêt
  }, []);

  // Afficher le message de partage après 1 minute pour tout le monde
  useEffect(() => {
    if (isReady && !isHelperOpen) {
      const timer = setTimeout(() => {
        setShowPromotion(true);
      }, 60000); // 1 minute
      return () => clearTimeout(timer);
    }
  }, [isReady, isHelperOpen]);

  // Afficher le rappel serveur à chaque actualisation pour tout le monde
  useEffect(() => {
    // Attendre que le composant soit prêt et que le helper ne soit pas ouvert
    if (isReady && !isHelperOpen) {
      setShowServerReminder(true);
    }
  }, [isReady, isHelperOpen]);

  const handleClosePromotion = () => {
    setShowPromotion(false);
    // Plus de persistance localStorage - s'affiche à chaque actualisation
  };

  const handleCloseServerReminder = () => {
    setShowServerReminder(false);
    // Ne plus sauvegarder, permettre l'affichage à chaque actualisation
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Craftus - Calculateur de rentabilité Dofus',
      text: 'Découvre Craftus, l\'outil gratuit pour optimiser tes crafts dans Dofus ! Partage avec ta guilde et ton alliance pour des prix plus fiables 🎯',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        handleClosePromotion();
      } catch (err) {
        console.log('Erreur lors du partage:', err);
      }
    } else {
      // Fallback : copier le lien
      navigator.clipboard.writeText(window.location.origin);
      alert('Lien copié ! Partage-le avec tes amis, ta guilde et ton alliance pour améliorer la fiabilité des prix 🚀');
      handleClosePromotion();
    }
  };

  return (
    <>
      {/* Message de promotion du partage */}
      {showPromotion && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md mx-4">
          <div className={`${colors.panel} rounded-xl p-4 shadow-2xl border ${colors.border} animate-slide-in-bottom relative overflow-hidden`}>
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine"></div>
            
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 animate-pulse">
                🚀
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1">
                  Partage Craftus !
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">
                  Plus il y a d'utilisateurs, plus les prix sont fiables ! 
                  Partage avec tes amis, ta guilde et ton alliance dans le jeu ! 🌟
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-emerald-500 hover:to-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-1"
                  >
                    📤 Partager
                  </button>
                  <button
                    onClick={handleClosePromotion}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-all duration-200"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
              <button
                onClick={handleClosePromotion}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rappel de sélection du serveur */}
      {showServerReminder && (
        <div className="fixed top-4 left-4 z-50 max-w-sm">
          <div className={`${colors.panel} rounded-xl p-4 shadow-2xl border ${colors.border} animate-slide-in-left relative overflow-hidden`}>
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/10 to-transparent animate-shine"></div>
            
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 animate-pulse">
                ⚠️
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1">
                  Vérifiez votre serveur !
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">
                  Assurez-vous d'avoir sélectionné le bon serveur dans le menu. 
                  Les prix varient énormément entre serveurs ! 🎯
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCloseServerReminder}
                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Compris
                  </button>
                  <button
                    onClick={handleCloseServerReminder}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-all duration-200"
                  >
                    Ignorer
                  </button>
                </div>
              </div>
              <button
                onClick={handleCloseServerReminder}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-bottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
