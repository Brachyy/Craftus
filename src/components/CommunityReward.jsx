import React, { useState, useEffect, useMemo } from 'react';
import { colors } from '../theme/colors';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';
import LeaderboardModal from './LeaderboardModal';
import { getUserRankData } from '../lib/userRanks';
import { getUserRank, getRankMessage } from '../lib/ranks';
import { motion } from 'framer-motion';

// Fabrique un ensemble de particules/étincelles pseudo-aléatoires mais stable (via useMemo)
const useBursts = (count, radius = 70) =>
  useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const ang = (i / count) * Math.PI * 2 + (i % 3) * 0.19;
        const r = radius * (0.6 + (i % 5) * 0.08);
        return {
          x: Math.cos(ang) * r,
          y: Math.sin(ang) * r,
          d: 0.35 + (i % 7) * 0.08,
        };
      }),
    [count, radius]
  );

// Configuration des effets par rank
const RANK_EFFECTS = {
  boufton: {
    effect: "sweep",
    glowFrom: "0 0 4px rgba(255,247,194,0.35)",
    glowTo: "0 0 14px rgba(255,247,194,0.9)",
    haloHover: "0 0 26px rgba(255,247,194,0.65)",
  },
  aventurier: {
    effect: "metal-shine",
    glowFrom: "0 0 4px rgba(212,175,55,0.25)",
    glowTo: "0 0 16px rgba(247,229,150,0.95)",
    haloHover: "0 0 28px rgba(247,229,150,0.7)",
  },
  disciple: {
    effect: "particles",
    glowFrom: "0 0 6px rgba(50,205,50,0.35)",
    glowTo: "0 0 20px rgba(50,205,50,1)",
    haloHover: "0 0 30px rgba(50,205,50,0.7)",
  },
  chasseur: {
    effect: "diagonal-wave",
    glowFrom: "0 0 6px rgba(0,206,209,0.35)",
    glowTo: "0 0 22px rgba(0,206,209,1)",
    haloHover: "0 0 34px rgba(0,225,220,0.75)",
  },
  protecteur: {
    effect: "hourglass",
    glowFrom: "0 0 7px rgba(255,215,0,0.45)",
    glowTo: "0 0 26px rgba(255,215,0,1)",
    haloHover: "0 0 36px rgba(255,215,0,0.75)",
  },
  champion: {
    effect: "sparks",
    glowFrom: "0 0 8px rgba(178,34,34,0.5)",
    glowTo: "0 0 28px rgba(255,107,107,1)",
    haloHover: "0 0 40px rgba(255,120,80,0.75)",
  },
  heros: {
    effect: "bicolor-flow",
    glowFrom: "0 0 9px rgba(230,230,230,0.35)",
    glowTo: "0 0 30px rgba(230,230,230,0.95)",
    haloHover: "0 0 42px rgba(244,67,54,0.6)",
  },
  gardien: {
    effect: "cosmic",
    glowFrom: "0 0 10px rgba(138,43,226,0.45)",
    glowTo: "0 0 32px rgba(138,43,226,1)",
    haloHover: "0 0 56px rgba(138,43,226,0.8)",
  },
};

export default function CommunityReward({ user, userName }) {
  const [todayUsers, setTodayUsers] = useState(0);
  const [userContribution, setUserContribution] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userRank, setUserRank] = useState(null);

  // Hooks pour les effets - toujours appelés au niveau racine
  const sparks = useBursts(RANK_EFFECTS[userRank?.id]?.effect === "sparks" ? 12 : 0, 80);
  const particles = useBursts(RANK_EFFECTS[userRank?.id]?.effect === "particles" ? 12 : 0, 60);

  // Fonction pour obtenir le style du nom du rang selon le prestige avec effets spectaculaires
  const getRankNameStyle = (rankId) => {
    switch (rankId) {
      case 'boufton':
        return 'text-rank-boufton cursor-pointer';
      case 'aventurier':
        return 'text-rank-aventurier cursor-pointer';
      case 'disciple':
        return 'text-rank-disciple cursor-pointer';
      case 'chasseur':
        return 'text-rank-chasseur font-semibold cursor-pointer';
      case 'protecteur':
        return 'text-rank-protecteur font-semibold cursor-pointer';
      case 'champion':
        return 'text-rank-champion font-bold cursor-pointer';
      case 'heros':
        return 'text-rank-heros font-bold cursor-pointer';
      case 'gardien':
        return 'text-rank-gardien font-bold text-lg cursor-pointer';
      default:
        return 'text-gray-400';
    }
  };

  // Configuration des rangs avec effets spécifiques selon votre exemple
  const RANK_CONFIGS = {
    boufton: {
      textColor: "#f5f5dc",
      glowFrom: "0 0 4px rgba(255,247,194,0.35)",
      glowTo: "0 0 14px rgba(255,247,194,0.9)",
      haloHover: "0 0 26px rgba(255,247,194,0.65)",
      effect: "sweep", // reflets blancs traversant le texte
      duration: 12
    },
    aventurier: {
      textGradient: "linear-gradient(90deg,#b78c2a,#d4af37,#f7e596,#d4af37,#b78c2a)",
      textColorFallback: "#d4af37",
      glowFrom: "0 0 4px rgba(212,175,55,0.25)",
      glowTo: "0 0 16px rgba(247,229,150,0.95)",
      haloHover: "0 0 28px rgba(247,229,150,0.7)",
      effect: "metal-shine", // dégradé doré glisse au hover
      duration: 14
    },
    disciple: {
      textColor: "#32cd32",
      glowFrom: "0 0 6px rgba(50,205,50,0.35)",
      glowTo: "0 0 20px rgba(50,205,50,1)",
      haloHover: "0 0 30px rgba(50,205,50,0.7)",
      effect: "particles", // petits points lumineux qui jaillissent
      duration: 16
    },
    chasseur: {
      textGradient: "linear-gradient(90deg,#0099a8,#00ced1,#8bf3f6,#00ced1,#0099a8)",
      textColorFallback: "#00ced1",
      glowFrom: "0 0 6px rgba(0,206,209,0.35)",
      glowTo: "0 0 22px rgba(0,206,209,1)",
      haloHover: "0 0 34px rgba(0,225,220,0.75)",
      effect: "diagonal-wave", // vague lumineuse diagonale
      duration: 18
    },
    protecteur: {
      textColor: "#ffd700",
      glowFrom: "0 0 7px rgba(255,215,0,0.45)",
      glowTo: "0 0 26px rgba(255,215,0,1)",
      haloHover: "0 0 36px rgba(255,215,0,0.75)",
      effect: "hourglass", // sablier — grains qui descendent
      duration: 20
    },
    champion: {
      textGradient: "linear-gradient(90deg,#b22222,#ff6b6b,#ffd56b,#b22222)",
      textColorFallback: "#b22222",
      glowFrom: "0 0 8px rgba(178,34,34,0.5)",
      glowTo: "0 0 28px rgba(255,107,107,1)",
      haloHover: "0 0 40px rgba(255,120,80,0.75)",
      effect: "bicolor-flow", // va-et-vient rouge/jaune comme Héros
      duration: 22
    },
    heros: {
      textGradient: "linear-gradient(90deg,#e6e6e6,#f44336,#e6e6e6)",
      textColorFallback: "#e6e6e6",
      glowFrom: "0 0 9px rgba(230,230,230,0.35),0 0 5px rgba(244,67,54,0.25)",
      glowTo: "0 0 30px rgba(230,230,230,0.95),0 0 18px rgba(244,67,54,0.7)",
      haloHover: "0 0 42px rgba(244,67,54,0.6)",
      effect: "bicolor-flow", // va-et-vient des 2 couleurs
      duration: 24
    },
    gardien: {
      textGradient: "linear-gradient(90deg,#8a2be2,#00bfff,#ff69b4,#8a2be2,#00bfff,#ff69b4)",
      textColorFallback: "#bda0ff",
      glowFrom: "0 0 10px rgba(138,43,226,0.45),0 0 6px rgba(0,191,255,0.45),0 0 6px rgba(255,105,180,0.45)",
      glowTo: "0 0 32px rgba(138,43,226,1),0 0 28px rgba(0,191,255,1),0 0 28px rgba(255,105,180,1)",
      haloHover: "0 0 56px rgba(138,43,226,0.8)",
      effect: "cosmic", // étoiles + vague cosmique
      duration: 26
    }
  };

  // Fonction pour obtenir les animations Framer Motion selon le rang
  const getRankAnimations = (rankId) => {
    const config = RANK_CONFIGS[rankId];
    if (!config) {
      console.log('No config found for rank:', rankId);
      return {};
    }

    console.log('Getting animations for rank:', rankId, 'config:', config);
    
    return {
      // Animation subtile permanente (respiration du halo)
      initial: { filter: `drop-shadow(${config.glowFrom})` },
      animate: {
        filter: [`drop-shadow(${config.glowFrom})`, `drop-shadow(${config.glowTo})`],
        transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
      },
      // Animation au hover
      hover: {
        filter: `drop-shadow(${config.haloHover})`,
        transition: { type: "spring", stiffness: 180, damping: 16 }
      }
    };
  };

  // Fonction pour obtenir le style du texte avec gradient
  const getRankTextStyle = (rankId) => {
    const config = RANK_CONFIGS[rankId];
    if (!config) return {};

    return {
      fontWeight: 900,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      fontSize: 18,
      lineHeight: 1.1,
      color: config.textColor || "transparent",
      backgroundImage: config.textGradient,
      backgroundSize: config.textGradient ? "300% 100%" : undefined,
      backgroundClip: config.textGradient ? "text" : undefined,
      WebkitBackgroundClip: config.textGradient ? "text" : undefined,
      WebkitTextFillColor: config.textGradient ? "transparent" : undefined,
      WebkitTextStroke: config.outline ? config.outline : undefined,
    };
  };

  // Variants pour les effets hover spécifiques
  const getRankHoverVariants = (rankId) => {
    console.log('Getting hover variants for rank:', rankId);
    
    switch (rankId) {
      case 'boufton':
        return {
          initial: { x: "-120%", opacity: 0 },
          hover: { x: ["-120%", "140%"], opacity: [0, 1, 0] }
        };
      case 'aventurier':
        return {
          initial: { x: "-130%", opacity: 0 },
          hover: { x: ["-130%", "150%"], opacity: [0, 1, 0] }
        };
      case 'disciple':
        return {
          initial: { scale: 0, opacity: 0 },
          hover: { scale: [0, 1.2, 0], opacity: [0, 1, 0] }
        };
      case 'chasseur':
        return {
          initial: { x: "-120%", rotate: -18, opacity: 0 },
          hover: { x: ["-120%", "140%"], opacity: [0, 0.9, 0] }
        };
      case 'protecteur':
        return {
          initial: { y: "-110%", opacity: 0 },
          hover: { y: ["-110%", "110%"], opacity: [0, 1, 0] }
        };
      case 'champion':
        return {
          initial: { x: "-100%", opacity: 0 },
          hover: { x: ["-100%", "100%", "0%"], opacity: [0, 1, 0] }
        };
      case 'heros':
        return {
          initial: { x: "-100%", opacity: 0 },
          hover: { x: ["-100%", "100%", "0%"], opacity: [0, 1, 0] }
        };
      case 'gardien':
        return {
          initial: { x: "-130%", opacity: 0.0 },
          hover: { x: ["-130%", "150%"], opacity: [0.0, 1, 0.0] }
        };
      default:
        return {
          initial: { x: "-120%", opacity: 0 },
          hover: { x: ["-120%", "140%"], opacity: [0, 1, 0] }
        };
    }
  };

  // Fonction pour mapper les IDs de rangs aux noms de fichiers
  const getRankAssetPath = (rankId) => {
    const assetMap = {
      'boufton': 'boufton.png',
      'aventurier': 'aventurier_amakna.png',
      'disciple': 'apprenti_otomai.png',
      'chasseur': 'chasseur_dofus.png',
      'protecteur': 'protecteur_almanax.png',
      'champion': 'champion_kolizeum.png',
      'heros': 'hero_bonta⁄brakmar.png',
      'gardien': 'gardien_krosmoz.png'
    };
    return `/src/assets/ranks/${assetMap[rankId] || 'boufton.png'}`;
  };

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
        
        // Charger le rang de l'utilisateur
        if (userContributions > 0) {
          const rankData = await getUserRankData(user.uid);
          if (rankData) {
            const rank = getUserRank(rankData.monthlyParticipations);
            setUserRank(rank);
          }
        }
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

  // Toujours afficher le message de remerciement pour les utilisateurs connectés
  // if (userContribution === 0) {
  //   return null;
  // }

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
              {userRank ? (
                <span className="flex items-center gap-1">
                  Bonjour <span className="text-yellow-400">{userName || 'utilisateur'}</span> le{' '}
                  <img 
                    src={getRankAssetPath(userRank.id)} 
                    alt={userRank.name}
                    className="w-12 h-12 mr-1"
                    style={{ objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'inline';
                    }}
                  />
                  <span style={{ display: 'none' }}>🏆</span>
                  <motion.div
                    className="inline-block relative overflow-hidden"
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(12,16,22,0.35)",
                      borderRadius: 8,
                      padding: "4px 8px",
                    }}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    variants={{
                      initial: { filter: `drop-shadow(${RANK_EFFECTS[userRank.id]?.glowFrom})` },
                      animate: {
                        filter: [`drop-shadow(${RANK_EFFECTS[userRank.id]?.glowFrom})`, `drop-shadow(${RANK_EFFECTS[userRank.id]?.glowTo})`],
                        transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                      },
                      hover: {
                        filter: `drop-shadow(${RANK_EFFECTS[userRank.id]?.haloHover})`,
                        transition: { type: "spring", stiffness: 180, damping: 16 }
                      }
                    }}
                  >
                    <motion.span 
                      className="inline-block"
                      style={getRankTextStyle(userRank.id)}
                      animate={RANK_CONFIGS[userRank.id]?.textGradient ? { 
                        backgroundPositionX: ["0%", "100%", "0%"] 
                      } : {}}
                      transition={{ 
                        duration: RANK_CONFIGS[userRank.id]?.duration || 12, 
                        repeat: RANK_CONFIGS[userRank.id]?.textGradient ? Infinity : 0, 
                        ease: "linear" 
                      }}
                    >
                      {userRank.name}
                    </motion.span>
                    
                    {/* Effets hover personnalisés par rank */}
                    {(() => {
                      const effect = RANK_EFFECTS[userRank.id]?.effect;
                      
                      switch (effect) {
                        case "sweep":
                          return (
                            <motion.div
                              variants={{
                                initial: { x: "-120%", opacity: 0 },
                                hover: { x: ["-120%", "140%"], opacity: [0, 1, 0] }
                              }}
                              transition={{ duration: 1.1, ease: "easeInOut" }}
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(75deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))",
                                width: "36%",
                                filter: "blur(2px)",
                                pointerEvents: "none",
                              }}
                            />
                          );
                        
                        case "metal-shine":
                          return (
                            <motion.div
                              variants={{
                                initial: { x: "-130%", opacity: 0 },
                                hover: { x: ["-130%", "150%"], opacity: [0, 1, 0] }
                              }}
                              transition={{ duration: 0.9, ease: "easeInOut" }}
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.25), rgba(255,255,255,0))",
                                width: "30%",
                                filter: "blur(1.5px)",
                                pointerEvents: "none",
                              }}
                            />
                          );
                        
                        case "particles":
                          return (
                            <>
                              {particles.map((p, i) => (
                                <motion.span
                                  key={i}
                                  variants={{
                                    initial: { x: 0, y: 0, opacity: 0, scale: 0 },
                                    hover: { x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1, 0] }
                                  }}
                                  transition={{ duration: 0.9 + p.d * 0.4, ease: "easeOut" }}
                                  onAnimationStart={() => console.log('Hover animation started for:', userRank.id)}
                                  onAnimationComplete={() => console.log('Hover animation completed for:', userRank.id)}
                                  style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    width: 6,
                                    height: 6,
                                    borderRadius: 999,
                                    background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(50,205,50,0.5))",
                                    boxShadow: "0 0 10px rgba(50,205,50,0.8)",
                                    pointerEvents: "none",
                                  }}
                                />
                              ))}
                            </>
                          );
                        
                        case "diagonal-wave":
                          return (
                            <motion.div
                              variants={{
                                initial: { x: "-120%", rotate: -18, opacity: 0 },
                                hover: { x: ["-120%", "140%"], opacity: [0, 0.9, 0] }
                              }}
                              transition={{ duration: 1.1, ease: "easeInOut" }}
                              style={{
                                position: "absolute",
                                inset: -12,
                                background: "linear-gradient(90deg, rgba(0,206,209,0), rgba(255,255,255,0.35), rgba(0,206,209,0))",
                                width: "42%",
                                filter: "blur(3px)",
                                transformOrigin: "center",
                                pointerEvents: "none",
                              }}
                            />
                          );
                        
                        case "hourglass":
                          return (
                            <motion.div
                              variants={{
                                initial: { y: "-110%", opacity: 0 },
                                hover: { y: ["-110%", "110%"], opacity: [0, 1, 0] }
                              }}
                              transition={{ duration: 1.6, ease: "easeInOut" }}
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "repeating-linear-gradient(to bottom, rgba(255,215,0,0.0) 0 6px, rgba(255,215,0,0.35) 7px 8px, rgba(255,215,0,0.0) 9px 14px)",
                                filter: "blur(0.6px)",
                                pointerEvents: "none",
                              }}
                            />
                          );
                        
                        case "sparks":
                          return (
                            <>
                              {sparks.map((p, i) => (
                                <motion.span
                                  key={i}
                                  variants={{
                                    initial: { x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.6 },
                                    hover: { x: p.x, y: p.y, opacity: [0, 1, 0], rotate: 135, scale: [0.6, 1.1, 0.8] }
                                  }}
                                  transition={{ duration: 0.8 + (i % 5) * 0.12, ease: "easeOut" }}
                                  onAnimationStart={() => console.log('Hover animation started for:', userRank.id)}
                                  onAnimationComplete={() => console.log('Hover animation completed for:', userRank.id)}
                                  style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    width: 14,
                                    height: 2,
                                    borderRadius: 2,
                                    background: i % 2
                                      ? "linear-gradient(90deg, rgba(202,168,74,0.1), rgba(255,204,108,0.95))"
                                      : "linear-gradient(90deg, rgba(120,0,0,0.1), rgba(255,120,80,0.95))",
                                    boxShadow: "0 0 10px rgba(255,140,90,0.75)",
                                    pointerEvents: "none",
                                  }}
                                />
                              ))}
                            </>
                          );
                        
                        case "bicolor-flow":
                          return (
                            <motion.div
                              variants={{
                                initial: { x: "-100%", opacity: 0 },
                                hover: { x: ["-100%", "100%", "0%"], opacity: [0, 1, 0] }
                              }}
                              transition={{ duration: 1.2, ease: "easeInOut" }}
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(90deg, rgba(230,230,230,0.25), rgba(244,67,54,0.35), rgba(230,230,230,0.25))",
                                mixBlendMode: "overlay",
                                pointerEvents: "none",
                              }}
                            />
                          );
                        
                        case "cosmic":
                          return (
                            <>
                              <motion.div
                                variants={{
                                  initial: { x: "-130%", opacity: 0.0 },
                                  hover: { x: ["-130%", "150%"], opacity: [0.0, 1, 0.0] }
                                }}
                                transition={{ duration: 1.6, ease: "easeInOut" }}
                                onAnimationStart={() => console.log('Hover animation started for:', userRank.id)}
                                onAnimationComplete={() => console.log('Hover animation completed for:', userRank.id)}
                                style={{
                                  position: "absolute",
                                  inset: -10,
                                  background: "linear-gradient(90deg, rgba(138,43,226,0.0), rgba(255,255,255,0.25), rgba(0,191,255,0.0))",
                                  width: "45%",
                                  filter: "blur(3px)",
                                  pointerEvents: "none",
                                }}
                              />
                              {/* petites étoiles qui twinkle en permanence */}
                              {Array.from({ length: 12 }).map((_, i) => (
                                <motion.span
                                  key={i}
                                  initial={{ opacity: 0.2 }}
                                  animate={{ opacity: [0.2, 1, 0.2] }}
                                  transition={{ duration: 1.8 + (i % 5) * 0.3, repeat: Infinity }}
                                  style={{
                                    position: "absolute",
                                    left: `${8 + (i * 77) % 92}%`,
                                    top: `${10 + (i * 53) % 60}%`,
                                    width: 3,
                                    height: 3,
                                    borderRadius: 999,
                                    background: "radial-gradient(circle, #fff, rgba(255,255,255,0))",
                                    boxShadow: "0 0 8px rgba(180,160,255,0.8)",
                                    pointerEvents: "none",
                                  }}
                                />
                              ))}
                            </>
                          );
                        
                        default:
                          return null;
                      }
                    })()}
                  </motion.div>
                  ! <span className="text-slate-300">{userRank.message}</span>
                </span>
              ) : (
                `Bravo ${userName || 'utilisateur'} ! Vous faites partie des ${todayUsers} utilisateurs qui ont aidé la communauté aujourd'hui`
              )}
            </h3>
            
            <p className="text-slate-300 text-sm mb-3">
              {userContribution > 0 ? (
                <>
                  Vous avez renseigné <span className="text-yellow-400 font-semibold">{userContribution}</span> prix aujourd'hui. Merci pour votre contribution !
                </>
              ) : (
                <>
                  Bienvenue dans la communauté Craftus ! Commencez à contribuer en ajoutant des prix pour aider les autres joueurs.
                </>
              )}
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
