import React from 'react';
import { colors } from '../theme/colors';

const CGUModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${colors.panel} border ${colors.border} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">Conditions Générales d'Utilisation</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-invert max-w-none">
            <h3>1. Objet et acceptation</h3>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de l'application web Craftus, 
              un outil de calcul de rentabilité pour le jeu Dofus.
            </p>
            <p>
              En accédant et en utilisant Craftus, vous acceptez sans réserve les présentes CGU. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
            </p>

            <h3>2. Description du service</h3>
            <p>
              Craftus est une application web gratuite qui permet aux joueurs de Dofus de :
            </p>
            <ul>
              <li>Calculer la rentabilité de la fabrication d'objets</li>
              <li>Comparer les prix d'ingrédients et d'objets finis</li>
              <li>Gérer des listes de favoris et des sessions de calcul</li>
              <li>Partager des configurations via des liens</li>
              <li>Accéder à des données communautaires de prix</li>
            </ul>

            <h3>3. Données et contenu</h3>
            <h4>3.1 Données du jeu</h4>
            <ul>
              <li>Craftus utilise des données publiques provenant de l'API DofusDB</li>
              <li>Les informations sur les objets, recettes et métiers sont fournies à titre indicatif</li>
              <li>Nous ne garantissons pas l'exactitude ni la mise à jour en temps réel de ces données</li>
            </ul>

            <h4>3.2 Données utilisateur</h4>
            <ul>
              <li><strong>Authentification</strong> : Connexion via Google pour sauvegarder vos sessions et favoris</li>
              <li><strong>Données collectées</strong> : Sessions de calcul, favoris, prix communautaires saisis</li>
              <li><strong>Stockage</strong> : Données stockées sur Firebase (Google Cloud Platform)</li>
              <li><strong>Suppression</strong> : Vous pouvez supprimer vos données en vous déconnectant</li>
            </ul>

            <h4>3.3 Prix communautaires</h4>
            <ul>
              <li>Les utilisateurs peuvent contribuer aux prix d'objets et d'ingrédients</li>
              <li>Ces données sont partagées anonymement entre tous les utilisateurs</li>
              <li>Nous ne garantissons pas l'exactitude des prix communautaires</li>
            </ul>

            <h3>4. Utilisation du service</h3>
            <h4>4.1 Utilisation autorisée</h4>
            <ul>
              <li>Utilisation personnelle et non commerciale</li>
              <li>Respect des conditions d'utilisation de Dofus et d'Ankama</li>
              <li>Contribution constructive à la communauté</li>
            </ul>

            <h4>4.2 Utilisation interdite</h4>
            <ul>
              <li>Utilisation à des fins commerciales sans autorisation</li>
              <li>Tentative de contournement des limitations techniques</li>
              <li>Envoi de données malveillantes ou inappropriées</li>
              <li>Utilisation automatisée excessive (scraping, bots)</li>
            </ul>

            <h3>5. Responsabilités</h3>
            <h4>5.1 Responsabilités de l'utilisateur</h4>
            <ul>
              <li>Vérifier l'exactitude des calculs avant toute décision</li>
              <li>Respecter les droits de propriété intellectuelle</li>
              <li>Ne pas partager de contenu inapproprié</li>
              <li>Maintenir la confidentialité de son compte</li>
            </ul>

            <h4>5.2 Limitation de responsabilité</h4>
            <ul>
              <li>Craftus est fourni "en l'état" sans garantie</li>
              <li>Nous ne sommes pas responsables des pertes financières liées aux calculs</li>
              <li>Les prix affichés sont indicatifs et peuvent varier</li>
              <li>Interruptions de service possibles pour maintenance</li>
            </ul>

            <h3>6. Propriété intellectuelle</h3>
            <h4>6.1 Contenu de Craftus</h4>
            <ul>
              <li>L'interface et le code source sont protégés par le droit d'auteur</li>
              <li>Les données du jeu Dofus appartiennent à Ankama</li>
              <li>Les contributions communautaires restent la propriété de leurs auteurs</li>
            </ul>

            <h4>6.2 Utilisation du contenu</h4>
            <ul>
              <li>Vous pouvez utiliser Craftus pour vos calculs personnels</li>
              <li>La reproduction ou la distribution nécessite une autorisation</li>
              <li>Les marques et logos restent la propriété de leurs détenteurs</li>
            </ul>

            <h3>7. Données personnelles et confidentialité</h3>
            <h4>7.1 Collecte de données</h4>
            <ul>
              <li><strong>Données d'authentification</strong> : Email et nom via Google</li>
              <li><strong>Données d'usage</strong> : Sessions, favoris, prix saisis</li>
              <li><strong>Données techniques</strong> : Adresse IP, navigateur, cookies</li>
            </ul>

            <h4>7.2 Utilisation des données</h4>
            <ul>
              <li>Amélioration du service</li>
              <li>Sauvegarde de vos préférences</li>
              <li>Statistiques d'usage anonymisées</li>
              <li>Communication (si nécessaire)</li>
            </ul>

            <h4>7.3 Partage des données</h4>
            <ul>
              <li>Données non partagées avec des tiers</li>
              <li>Prix communautaires partagés anonymement</li>
              <li>Respect du RGPD et des lois applicables</li>
            </ul>

            <h3>8. Disponibilité du service</h3>
            <h4>8.1 Maintenance</h4>
            <ul>
              <li>Interruptions possibles pour maintenance</li>
              <li>Mises à jour régulières pour améliorer le service</li>
              <li>Aucune garantie de disponibilité continue</li>
            </ul>

            <h4>8.2 Support</h4>
            <ul>
              <li>Support communautaire via les canaux officiels</li>
              <li>Aucune garantie de réponse dans un délai donné</li>
              <li>Documentation disponible dans l'application</li>
            </ul>

            <h3>9. Modifications des CGU</h3>
            <h4>9.1 Évolution des conditions</h4>
            <ul>
              <li>Les CGU peuvent être modifiées à tout moment</li>
              <li>Notification des changements importants</li>
              <li>Utilisation continue = acceptation des nouvelles conditions</li>
            </ul>

            <h4>9.2 Version en vigueur</h4>
            <ul>
              <li>Seule la version en ligne fait foi</li>
              <li>Date de dernière mise à jour indiquée en haut du document</li>
            </ul>

            <h3>10. Résiliation</h3>
            <h4>10.1 Arrêt d'utilisation</h4>
            <ul>
              <li>Vous pouvez cesser d'utiliser Craftus à tout moment</li>
              <li>Suppression de votre compte possible</li>
              <li>Données conservées selon la politique de rétention</li>
            </ul>

            <h4>10.2 Suspension du service</h4>
            <ul>
              <li>Nous nous réservons le droit de suspendre l'accès</li>
              <li>En cas de violation des CGU</li>
              <li>Notification préalable dans la mesure du possible</li>
            </ul>

            <h3>11. Droit applicable et juridiction</h3>
            <h4>11.1 Loi applicable</h4>
            <ul>
              <li>Droit français applicable</li>
              <li>Conformité au RGPD</li>
              <li>Respect des lois sur la protection des données</li>
            </ul>

            <h4>11.2 Règlement des litiges</h4>
            <ul>
              <li>Tentative de résolution amiable en priorité</li>
              <li>Juridiction compétente : tribunaux français</li>
              <li>Médiation possible pour les consommateurs</li>
            </ul>

            <h3>12. Contact</h3>
            <p>
              Pour toute question concernant ces CGU ou le service Craftus :
            </p>
            <ul>
              <li><strong>Email</strong> : [Votre email de contact]</li>
              <li><strong>Support</strong> : Via l'application ou les canaux communautaires</li>
              <li><strong>Adresse</strong> : [Votre adresse si applicable]</li>
            </ul>

            <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm text-orange-200">
                <strong>Note importante</strong> : Ces CGU sont adaptées à un projet éducatif/personnel. 
                Pour une utilisation commerciale, consultez un avocat spécialisé en droit numérique et propriété intellectuelle.
              </p>
            </div>

            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-200">
                <strong>Avertissement</strong> : Craftus est un outil d'aide au calcul. 
                Les résultats sont indicatifs et ne remplacent pas votre jugement. 
                Vérifiez toujours les prix actuels dans le jeu avant toute transaction importante.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CGUModal;
