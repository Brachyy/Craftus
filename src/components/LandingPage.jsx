// src/components/LandingPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '../theme/colors';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className={`${colors.bg} min-h-screen`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Optimise tes <span className="text-emerald-400">Crafts</span> Dofus
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto"
            >
              Calcule la rentabilité de tes crafts en 30 secondes. 
              Plus d'utilisateurs = prix plus fiables grâce à la communauté.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🚀 Essayer Gratuitement
              </button>
              <button className="px-8 py-4 border border-slate-600 hover:border-slate-500 text-white font-semibold rounded-lg text-lg transition-all duration-200">
                📖 Voir la Démo
              </button>
            </motion.div>
          </div>
        </div>
        
        {/* Screenshot de l'outil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto px-4"
        >
          <div className={`${colors.panel} rounded-2xl border ${colors.border} p-6 shadow-2xl`}>
            <div className="bg-slate-800 rounded-lg p-4 text-center text-slate-400">
              📱 Screenshot de Craftus en action
            </div>
          </div>
        </motion.div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Pourquoi Choisir Craftus ?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`${colors.panel} rounded-xl border ${colors.border} p-6 text-center`}
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-3">Calculs Automatiques</h3>
              <p className="text-slate-300">
                Rentabilité, taxes, profits... Tout calculé automatiquement avec les derniers prix communautaires.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${colors.panel} rounded-xl border ${colors.border} p-6 text-center`}
            >
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-white mb-3">Système de Rangs</h3>
              <p className="text-slate-300">
                Contribuez aux prix et montez en rang : de Boufton à Gardien du Krosmoz !
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`${colors.panel} rounded-xl border ${colors.border} p-6 text-center`}
            >
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-3">Communauté Active</h3>
              <p className="text-slate-300">
                Plus de 1000 utilisateurs contribuent aux prix. Plus il y a d'utilisateurs, plus c'est fiable !
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Ce que disent nos utilisateurs
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className={`${colors.panel} rounded-xl border ${colors.border} p-6`}>
              <p className="text-slate-300 italic mb-4">
                "Grâce à Craftus, j'ai doublé mes profits en crafts ! Les prix communautaires sont super fiables."
              </p>
              <div className="text-emerald-400 font-semibold">- Jean, Chasseur de Dofus</div>
            </div>
            
            <div className={`${colors.panel} rounded-xl border ${colors.border} p-6`}>
              <p className="text-slate-300 italic mb-4">
                "Enfin un outil simple et efficace pour calculer la rentabilité. Le système de rangs est motivant !"
              </p>
              <div className="text-emerald-400 font-semibold">- Marie, Protecteur des Mois</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à Optimiser tes Crafts ?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Rejoins plus de 1000 joueurs qui utilisent Craftus quotidiennement
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🚀 Commencer Maintenant
          </button>
        </div>
      </section>
    </div>
  );
}
