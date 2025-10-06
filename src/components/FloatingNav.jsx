import React, { useState, useEffect } from 'react';

const FloatingNav = ({ onScrollToShoppingList, onScrollToComparison, onOpenGraphComparison, itemsCount, comparisonCount, selectedForComparisonCount }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('items');

  // Afficher les boutons seulement s'il y a des items
  useEffect(() => {
    setIsVisible(itemsCount > 0);
  }, [itemsCount]);

  // Détecter la section active lors du scroll
  useEffect(() => {
    const handleScroll = () => {
      const itemsSection = document.getElementById('items-section');
      const shoppingSection = document.getElementById('shopping-section');
      const comparisonSection = document.getElementById('comparison-section');

      if (!itemsSection || !shoppingSection || !comparisonSection) return;

      const scrollY = window.scrollY;
      const itemsTop = itemsSection.offsetTop;
      const shoppingTop = shoppingSection.offsetTop;
      const comparisonTop = comparisonSection.offsetTop;

      if (scrollY < shoppingTop - 100) {
        setActiveSection('items');
      } else if (scrollY < comparisonTop - 100) {
        setActiveSection('shopping');
      } else {
        setActiveSection('comparison');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Bouton Shopping List */}
      <button
        onClick={onScrollToShoppingList}
        className={`group relative flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 ${
          activeSection === 'shopping'
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/90'
        }`}
        title="Aller à la liste de courses"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
        <span className="font-medium text-sm">Courses</span>
      </button>

      {/* Bouton Résultats */}
      <button
        onClick={onScrollToComparison}
        className={`group relative flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 ${
          activeSection === 'comparison'
            ? 'bg-blue-500 text-white'
            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/90'
        }`}
        title="Aller au tableau de résultats"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="font-medium text-sm">Résultats</span>
      </button>

      {/* Bouton Comparer */}
      <button
        onClick={onOpenGraphComparison}
        disabled={selectedForComparisonCount < 2}
        className={`group relative flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 ${
          selectedForComparisonCount >= 2
            ? 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/90'
            : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
        }`}
        title={selectedForComparisonCount >= 2 ? "Comparer les graphiques de prix" : "Sélectionnez au moins 2 items pour comparer"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <span className="font-medium text-sm">Comparer</span>
        
        {/* Badge avec nombre d'items sélectionnés */}
        {selectedForComparisonCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {selectedForComparisonCount}
          </div>
        )}
      </button>

      {/* Bouton Retour en haut */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center justify-center w-12 h-12 bg-slate-800/90 text-slate-300 hover:bg-slate-700/90 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
        title="Retour en haut"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default FloatingNav;
