import React, { useState, useEffect } from 'react';
import { colors } from '../theme/colors';
import { setUserName, isUsernameAvailable, isValidUsername, generateDefaultUsername } from '../lib/userNames';

export default function UsernameModal({ isOpen, onClose, user, onUsernameSet }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      // Générer un nom par défaut
      const defaultUsername = generateDefaultUsername(user.uid);
      setUsername(defaultUsername);
      setError('');
      setIsAvailable(null);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (username && isValidUsername(username)) {
      checkAvailability();
    } else {
      setIsAvailable(null);
    }
  }, [username]);

  const checkAvailability = async () => {
    if (!username || !isValidUsername(username)) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const available = await isUsernameAvailable(username);
      setIsAvailable(available);
      if (!available) {
        setError('Ce nom d\'utilisateur est déjà pris');
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setIsAvailable(false);
      setError('Erreur lors de la vérification');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !isValidUsername(username)) {
      setError('Format de nom d\'utilisateur invalide');
      return;
    }

    if (!isAvailable) {
      setError('Ce nom d\'utilisateur n\'est pas disponible');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await setUserName(user.uid, username);
      onUsernameSet(username);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la définition du nom:', error);
      setError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomUsername = () => {
    const newUsername = generateDefaultUsername(user.uid + Math.random().toString(36));
    setUsername(newUsername);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">👤 Choisir votre nom d'utilisateur</h2>
            <p className="text-sm text-slate-400 mt-1">Ce nom sera visible dans la communauté</p>
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

        {/* Contenu */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Champ nom d'utilisateur */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isAvailable === true 
                      ? 'border-emerald-500 focus:ring-emerald-500/50' 
                      : isAvailable === false 
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-slate-600 focus:ring-blue-500/50'
                  }`}
                  placeholder="Votre nom d'utilisateur"
                  maxLength={20}
                  disabled={loading}
                />
                
                {/* Indicateur de statut */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isChecking ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : isAvailable === true ? (
                    <div className="w-5 h-5 text-emerald-400">✓</div>
                  ) : isAvailable === false ? (
                    <div className="w-5 h-5 text-red-400">✗</div>
                  ) : null}
                </div>
              </div>
              
              {/* Bouton générer aléatoire */}
              <button
                type="button"
                onClick={generateRandomUsername}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                disabled={loading}
              >
                🎲 Générer un nom aléatoire
              </button>
            </div>

            {/* Règles */}
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Règles :</h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• 3 à 20 caractères</li>
                <li>• Lettres, chiffres et underscores uniquement</li>
                <li>• Ne peut pas commencer par un chiffre</li>
                <li>• Doit être unique</li>
              </ul>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !isAvailable || !username}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  loading || !isAvailable || !username
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/25'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
