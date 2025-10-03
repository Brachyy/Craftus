import React from 'react';
import { colors } from '../theme/colors';

export default function Footer() {
  return (
    <footer className={`${colors.panel} border-t ${colors.border} mt-12`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Contenu principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* À propos */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">À propos de Craftus</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Craftus est un outil gratuit pour optimiser vos crafts dans Dofus. 
              Comparez les prix, calculez les profits et participez à la communauté.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liens utiles</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.dofus.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Site officiel Dofus
                </a>
              </li>
              <li>
                <a 
                  href="https://dofusdb.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  DofusDB - Base de données
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Code source sur GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/craftus51420" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  @craftus51420 sur Twitter
                </a>
              </li>
            </ul>
          </div>

          {/* Communauté */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Communauté</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📊 Leaderboard des contributeurs</li>
              <li>💰 Prix communautaires</li>
              <li>🏆 Système de récompenses</li>
              <li>👥 Noms d'utilisateur personnalisés</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="#help" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Guide d'utilisation
                </a>
              </li>
              <li>
                <a 
                  href="#faq" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="#bug" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Signaler un bug
                </a>
              </li>
              <li>
                <a 
                  href="#feature" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Suggérer une fonctionnalité
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-slate-700 mb-8"></div>

        {/* Informations légales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Mentions légales */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Mentions légales</h3>
            <div className="text-sm text-slate-400 space-y-2">
              <p>
                <strong className="text-white">Éditeur :</strong> Craftus<br/>
                <strong className="text-white">Hébergement :</strong> Firebase (Google Cloud)<br/>
                <strong className="text-white">Contact :</strong> @craftus51420 sur Twitter
              </p>
              <p>
                Ce site est un projet non commercial à but éducatif. 
                Aucune donnée personnelle n'est collectée à des fins commerciales.
              </p>
            </div>
          </div>

          {/* Protection des données */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Protection des données</h3>
            <div className="text-sm text-slate-400 space-y-2">
              <p>
                Nous utilisons Firebase Authentication (Google) pour la connexion. 
                Vos données sont protégées selon les standards Google.
              </p>
              <p>
                <strong className="text-white">Données collectées :</strong><br/>
                • Nom d'utilisateur personnalisé<br/>
                • Prix communautaires (anonymisés)<br/>
                • Préférences de session (localStorage)
              </p>
            </div>
          </div>
        </div>

        {/* Citations et crédits */}
        <div className="border-t border-slate-700 mb-8 pt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Crédits et citations</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-slate-400">
            
            {/* APIs utilisées */}
            <div>
              <h4 className="text-white font-medium mb-3">APIs et services utilisés</h4>
              <ul className="space-y-2">
                <li>
                  <strong>DofusDB API</strong><br/>
                  <span className="text-xs">
                    Base de données des objets Dofus<br/>
                    <a href="https://dofusdb.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                      https://dofusdb.fr
                    </a>
                  </span>
                </li>
                <li>
                  <strong>Firebase (Google)</strong><br/>
                  <span className="text-xs">
                    Authentification et base de données<br/>
                    <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                      https://firebase.google.com
                    </a>
                  </span>
                </li>
                <li>
                  <strong>Google Fonts</strong><br/>
                  <span className="text-xs">
                    Polices d'écriture<br/>
                    <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                      https://fonts.google.com
                    </a>
                  </span>
                </li>
              </ul>
            </div>

            {/* Propriété intellectuelle */}
            <div>
              <h4 className="text-white font-medium mb-3">Propriété intellectuelle</h4>
              <ul className="space-y-2">
                <li>
                  <strong>Dofus</strong><br/>
                  <span className="text-xs">
                    Jeu vidéo propriété d'Ankama Games<br/>
                    <a href="https://www.ankama.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                      https://www.ankama.com
                    </a>
                  </span>
                </li>
                <li>
                  <strong>Données de jeu</strong><br/>
                  <span className="text-xs">
                    Les prix et objets proviennent de la communauté Dofus.<br/>
                    Craftus ne prétend pas être affilié à Ankama.
                  </span>
                </li>
                <li>
                  <strong>Code source</strong><br/>
                  <span className="text-xs">
                    Projet open source sous licence MIT<br/>
                    Disponible sur GitHub
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Avertissements */}
        <div className="border-t border-slate-700 mb-8 pt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Avertissements</h3>
          <div className="text-sm text-slate-400 space-y-3">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-300 font-medium mb-2">⚠️ Avertissement important</p>
              <p>
                Les prix affichés sont fournis par la communauté et peuvent ne pas être à jour. 
                Vérifiez toujours les prix actuels dans le jeu avant de faire vos crafts.
              </p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 font-medium mb-2">ℹ️ Information</p>
              <p>
                Craftus est un outil non officiel. Nous ne sommes pas affiliés à Ankama Games 
                ou au jeu Dofus. Utilisez cet outil à vos propres risques.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400">
              <p>© 2024 Craftus. Tous droits réservés.</p>
              <p className="text-xs mt-1">
                Fait avec ❤️ pour la communauté Dofus
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <a 
                href="#privacy" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Politique de confidentialité
              </a>
              <a 
                href="#terms" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Conditions d'utilisation
              </a>
              <a 
                href="#cookies" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
