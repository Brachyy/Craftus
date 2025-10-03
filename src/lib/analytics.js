// src/lib/analytics.js
// Module Google Analytics pour Craftus

// Fonction pour envoyer des événements à Google Analytics
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'Craftus',
      ...parameters
    });
  }
};

// Fonction pour envoyer des pages vues personnalisées
export const trackPageView = (pageName, parameters = {}) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      ...parameters
    });
  }
};

// Fonction pour envoyer des conversions (utilisateurs premium)
export const trackConversion = (conversionType, value = 0) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', {
      event_category: 'Premium',
      event_label: conversionType,
      value: value,
      currency: 'EUR'
    });
  }
};

// Événements spécifiques à Craftus
export const analytics = {
  // Événements d'authentification
  userSignIn: (method = 'google') => {
    trackEvent('user_sign_in', {
      event_label: method,
      custom_parameter_1: method
    });
  },

  userSignOut: () => {
    trackEvent('user_sign_out');
  },

  // Événements de calcul
  itemAdded: (itemName, serverId) => {
    trackEvent('item_added', {
      event_label: itemName,
      custom_parameter_1: serverId
    });
  },

  itemRemoved: (itemName) => {
    trackEvent('item_removed', {
      event_label: itemName
    });
  },

  priceUpdated: (itemName, priceType, serverId) => {
    trackEvent('price_updated', {
      event_label: `${itemName}_${priceType}`,
      custom_parameter_1: serverId,
      custom_parameter_2: priceType
    });
  },

  // Événements de session
  sessionSaved: (sessionName) => {
    trackEvent('session_saved', {
      event_label: sessionName
    });
  },

  sessionLoaded: (sessionName) => {
    trackEvent('session_loaded', {
      event_label: sessionName
    });
  },

  // Événements de partage
  linkShared: (method = 'clipboard') => {
    trackEvent('link_shared', {
      event_label: method
    });
  },

  jsonExported: () => {
    trackEvent('json_exported');
  },

  jsonImported: () => {
    trackEvent('json_imported');
  },

  // Événements de favoris
  favoriteAdded: (itemName) => {
    trackEvent('favorite_added', {
      event_label: itemName
    });
  },

  favoriteRemoved: (itemName) => {
    trackEvent('favorite_removed', {
      event_label: itemName
    });
  },

  // Événements de serveur
  serverChanged: (oldServer, newServer) => {
    trackEvent('server_changed', {
      event_label: `${oldServer}_to_${newServer}`,
      custom_parameter_1: newServer
    });
  },

  // Événements de rang
  rankUpgraded: (oldRank, newRank) => {
    trackEvent('rank_upgraded', {
      event_label: `${oldRank}_to_${newRank}`,
      custom_parameter_2: newRank
    });
  },

  // Événements d'erreur
  errorOccurred: (errorType, errorMessage) => {
    trackEvent('error_occurred', {
      event_label: errorType,
      custom_parameter_1: errorMessage
    });
  },

  // Événements de performance
  calculationCompleted: (itemCount, processingTime) => {
    trackEvent('calculation_completed', {
      event_label: `${itemCount}_items`,
      value: processingTime
    });
  },

  // Événements de comparaison
  comparisonOpened: (itemCount) => {
    trackEvent('comparison_opened', {
      event_label: `${itemCount}_items`
    });
  },

  // Événements de recherche
  searchPerformed: (query, resultCount) => {
    trackEvent('search_performed', {
      event_label: query,
      value: resultCount
    });
  },

  // Événements d'aide
  helpOpened: () => {
    trackEvent('help_opened');
  },

  helpClosed: () => {
    trackEvent('help_closed');
  }
};

// Fonction pour initialiser les paramètres utilisateur
export const setUserProperties = (userId, userName, userRank, serverId) => {
  if (typeof gtag !== 'undefined') {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-JFFJ466DW5';
    gtag('config', gaId, {
      user_id: userId,
      custom_map: {
        'custom_parameter_1': serverId,
        'custom_parameter_2': userRank
      }
    });
  }
};

// Fonction pour mesurer le temps passé sur la page
export const trackTimeOnPage = () => {
  const startTime = Date.now();
  
  window.addEventListener('beforeunload', () => {
    const timeSpent = Date.now() - startTime;
    trackEvent('time_on_page', {
      value: Math.round(timeSpent / 1000) // en secondes
    });
  });
};

// Fonction pour mesurer les performances
export const trackPerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          trackEvent('page_load_time', {
            value: Math.round(perfData.loadEventEnd - perfData.loadEventStart)
          });
        }
      }, 0);
    });
  }
};

// Initialisation automatique
export const initAnalytics = () => {
  trackTimeOnPage();
  trackPerformance();
  
  // Track la page d'accueil
  trackPageView('Craftus - Accueil');
};
