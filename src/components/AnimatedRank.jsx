import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedRank({ rankId, rankName }) {
  // Animations SPECTACULAIRES uniquement au hover
  const getHoverAnimation = (rankId) => {
    switch (rankId) {
      case 'aventurier':
        return {
          scale: [1, 1.8, 1.2, 1],
          rotate: [0, 20, -15, 10, 0],
          y: [0, -15, 8, 0],
          filter: [
            'brightness(1) drop-shadow(0 0 20px #3B82F6) drop-shadow(0 0 40px #60A5FA)',
            'brightness(3) drop-shadow(0 0 40px #3B82F6) drop-shadow(0 0 80px #60A5FA) drop-shadow(0 0 120px #93C5FD)',
            'brightness(2) drop-shadow(0 0 30px #3B82F6) drop-shadow(0 0 60px #60A5FA)',
            'brightness(1) drop-shadow(0 0 20px #3B82F6) drop-shadow(0 0 40px #60A5FA)'
          ]
        };
      case 'disciple':
        return {
          y: [0, -30, 15, -20, 0],
          scale: [1, 1.9, 1.3, 1.6, 1],
          rotate: [0, 12, -10, 8, 0],
          filter: [
            'brightness(1) drop-shadow(0 0 15px #10B981) drop-shadow(0 0 30px #34D399)',
            'brightness(3.5) drop-shadow(0 0 35px #10B981) drop-shadow(0 0 70px #34D399) drop-shadow(0 0 105px #6EE7B7)',
            'brightness(2.5) drop-shadow(0 0 25px #10B981) drop-shadow(0 0 50px #34D399)',
            'brightness(3) drop-shadow(0 0 30px #10B981) drop-shadow(0 0 60px #34D399)',
            'brightness(1) drop-shadow(0 0 15px #10B981) drop-shadow(0 0 30px #34D399)'
          ]
        };
      case 'chasseur':
        return {
          scale: [1, 2.2, 1.5, 1.8, 1],
          rotate: [0, 18, -12, 9, 0],
          filter: [
            'brightness(1) drop-shadow(0 0 15px #FFD700) drop-shadow(0 0 30px #FFA500) drop-shadow(0 0 45px #FF8C00)',
            'brightness(4) drop-shadow(0 0 35px #FFD700) drop-shadow(0 0 70px #FFA500) drop-shadow(0 0 105px #FF8C00) drop-shadow(0 0 140px #FF6B35)',
            'brightness(3) drop-shadow(0 0 25px #FFD700) drop-shadow(0 0 50px #FFA500) drop-shadow(0 0 75px #FF8C00)',
            'brightness(3.5) drop-shadow(0 0 30px #FFD700) drop-shadow(0 0 60px #FFA500) drop-shadow(0 0 90px #FF8C00)',
            'brightness(1) drop-shadow(0 0 15px #FFD700) drop-shadow(0 0 30px #FFA500) drop-shadow(0 0 45px #FF8C00)'
          ]
        };
      case 'protecteur':
        return {
          rotate: [0, 180, 360],
          scale: [1, 2, 1.4, 1.7, 1],
          filter: [
            'brightness(1) drop-shadow(0 0 15px #8B5CF6) drop-shadow(0 0 30px #A855F7)',
            'brightness(3.5) drop-shadow(0 0 35px #8B5CF6) drop-shadow(0 0 70px #A855F7) drop-shadow(0 0 105px #C084FC)',
            'brightness(2.5) drop-shadow(0 0 25px #8B5CF6) drop-shadow(0 0 50px #A855F7)',
            'brightness(3) drop-shadow(0 0 30px #8B5CF6) drop-shadow(0 0 60px #A855F7)',
            'brightness(1) drop-shadow(0 0 15px #8B5CF6) drop-shadow(0 0 30px #A855F7)'
          ]
        };
      case 'champion':
        return {
          scale: [1, 2.1, 1.4, 1.7, 1],
          rotate: [0, 15, -12, 9, 0],
          filter: [
            'brightness(1) drop-shadow(0 0 20px #EF4444) drop-shadow(0 0 40px #F87171) drop-shadow(0 0 60px #FCA5A5)',
            'brightness(4.2) drop-shadow(0 0 40px #EF4444) drop-shadow(0 0 80px #F87171) drop-shadow(0 0 120px #FCA5A5) drop-shadow(0 0 160px #FECACA)',
            'brightness(3.2) drop-shadow(0 0 30px #EF4444) drop-shadow(0 0 60px #F87171) drop-shadow(0 0 90px #FCA5A5)',
            'brightness(3.7) drop-shadow(0 0 35px #EF4444) drop-shadow(0 0 70px #F87171) drop-shadow(0 0 105px #FCA5A5)',
            'brightness(1) drop-shadow(0 0 20px #EF4444) drop-shadow(0 0 40px #F87171) drop-shadow(0 0 60px #FCA5A5)'
          ]
        };
      case 'heros':
        return {
          scale: [1, 2.3, 1.6, 1.9, 1],
          rotate: [0, 20, -16, 12, 0],
          filter: [
            'brightness(1) drop-shadow(0 0 20px #6366F1) drop-shadow(0 0 40px #8B5CF6) drop-shadow(0 0 60px #A855F7)',
            'brightness(4.5) drop-shadow(0 0 45px #6366F1) drop-shadow(0 0 90px #8B5CF6) drop-shadow(0 0 135px #A855F7) drop-shadow(0 0 180px #C084FC)',
            'brightness(3.5) drop-shadow(0 0 35px #6366F1) drop-shadow(0 0 70px #8B5CF6) drop-shadow(0 0 105px #A855F7)',
            'brightness(4) drop-shadow(0 0 40px #6366F1) drop-shadow(0 0 80px #8B5CF6) drop-shadow(0 0 120px #A855F7)',
            'brightness(1) drop-shadow(0 0 20px #6366F1) drop-shadow(0 0 40px #8B5CF6) drop-shadow(0 0 60px #A855F7)'
          ]
        };
      case 'gardien':
        return {
          rotate: [0, 180, 360],
          scale: [1, 2.5, 1.8, 2.1, 1],
          filter: [
            'brightness(1) drop-shadow(0 0 25px #EC4899) drop-shadow(0 0 50px #8B5CF6) drop-shadow(0 0 75px #06B6D4)',
            'brightness(5) drop-shadow(0 0 50px #EC4899) drop-shadow(0 0 100px #8B5CF6) drop-shadow(0 0 150px #06B6D4) drop-shadow(0 0 200px #F59E0B)',
            'brightness(3.5) drop-shadow(0 0 35px #EC4899) drop-shadow(0 0 70px #8B5CF6) drop-shadow(0 0 105px #06B6D4)',
            'brightness(4.2) drop-shadow(0 0 42px #EC4899) drop-shadow(0 0 84px #8B5CF6) drop-shadow(0 0 126px #06B6D4)',
            'brightness(1) drop-shadow(0 0 25px #EC4899) drop-shadow(0 0 50px #8B5CF6) drop-shadow(0 0 75px #06B6D4)'
          ]
        };
      default:
        return {};
    }
  };

  const hoverAnimation = getHoverAnimation(rankId);

  return (
    <motion.span
      initial={{ scale: 1, opacity: 1 }}
      whileHover={hoverAnimation}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        display: 'inline-block',
        textShadow: '0 0 30px currentColor, 0 0 60px currentColor',
        willChange: 'transform, filter',
        fontSize: '2em',
        cursor: 'pointer'
      }}
    >
      <img 
        src={`/assets/ranks/${rankId}.png`} 
        alt={rankName}
        className="w-8 h-8"
        onError={(e) => {
          // Fallback vers emoji si l'asset n'existe pas
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline';
        }}
      />
      <span style={{ display: 'none' }}>🏆</span>
    </motion.span>
  );
}