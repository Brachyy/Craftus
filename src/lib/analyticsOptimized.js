// src/lib/analyticsOptimized.js
// Version optimisée de Google Analytics qui évite les bloqueurs

let analyticsLoaded = false;
let analyticsQueue = [];

// Fonction pour charger Google Analytics de manière optimisée
export const loadAnalyticsOptimized = () => {
  return new Promise((resolve, reject) => {
    // Vérifier si déjà chargé
    if (analyticsLoaded && window.gtag) {
      resolve(true);
      return;
    }

    // Méthode 1: Chargement direct avec gestion d'erreur
    const loadDirect = () => {
      return new Promise((resolveDirect, rejectDirect) => {
        try {
          // Créer le script de manière plus discrète
          const script = document.createElement('script');
          script.src = 'https://www.googletagmanager.com/gtag/js?id=G-JFFJ466DW5';
          script.async = true;
          script.defer = true;
          
          // Ajouter des attributs pour éviter la détection
          script.setAttribute('data-adblock-bypass', 'true');
          
          script.onload = () => {
            analyticsLoaded = true;
            
            // Initialiser gtag
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-JFFJ466DW5');
            
            // Traiter la queue
            processQueue();
            resolveDirect(true);
          };
          
          script.onerror = () => {
            rejectDirect(new Error('Analytics blocked'));
          };
          
          // Timeout de sécurité
          setTimeout(() => {
            if (!analyticsLoaded) {
              rejectDirect(new Error('Analytics timeout'));
            }
          }, 5000);
          
          document.head.appendChild(script);
        } catch (error) {
          rejectDirect(error);
        }
      });
    };

    // Méthode 2: Chargement alternatif via fetch
    const loadAlternative = async () => {
      try {
        
        // Essayer de charger via fetch
        const response = await fetch('https://www.googletagmanager.com/gtag/js?id=G-JFFJ466DW5', {
          method: 'GET',
          mode: 'no-cors'
        });
        
        if (response.ok || response.type === 'opaque') {
          // Si fetch réussit, créer le script manuellement
          const script = document.createElement('script');
          script.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JFFJ466DW5');
          `;
          document.head.appendChild(script);
          
          analyticsLoaded = true;
          processQueue();
          resolve(true);
        } else {
          throw new Error('Fetch failed');
        }
      } catch (error) {
        reject(error);
      }
    };

    // Essayer d'abord le chargement direct
    loadDirect().catch((error) => {
      // Si échec, essayer la méthode alternative
      loadAlternative().catch((altError) => {
        reject(new Error('All loading methods failed'));
      });
    });
  });
};

// Fonction pour traiter la queue d'événements
const processQueue = () => {
  analyticsQueue.forEach(event => {
    try {
      if (window.gtag) {
        window.gtag(...event);
      }
    } catch (error) {
      console.error('Erreur lors du traitement de l\'événement:', error);
    }
  });
  analyticsQueue = [];
};

// Fonction pour ajouter un événement à la queue
const queueEvent = (...args) => {
  analyticsQueue.push(args);
};

// Fonction pour vérifier si Analytics est disponible
export const isAnalyticsAvailable = () => {
  return analyticsLoaded && typeof window.gtag === 'function';
};

// Fonction pour tracker un événement (avec queue si nécessaire)
export const trackEventOptimized = (eventName, parameters = {}) => {
  if (isAnalyticsAvailable()) {
    try {
      window.gtag('event', eventName, parameters);
    } catch (error) {
      console.error('Erreur lors du tracking:', error);
    }
  } else {
    queueEvent('event', eventName, parameters);
  }
};

// Fonction pour définir les propriétés utilisateur
export const setUserPropertiesOptimized = (userId, userName, userRank, serverId) => {
  if (isAnalyticsAvailable()) {
    try {
      window.gtag('config', 'G-JFFJ466DW5', {
        user_id: userId,
        custom_map: {
          user_name: userName,
          user_rank: userRank,
          server_id: serverId
        }
      });
    } catch (error) {
      console.error('Erreur lors de la définition des propriétés:', error);
    }
  } else {
    queueEvent('config', 'G-JFFJ466DW5', {
      user_id: userId,
      custom_map: {
        user_name: userName,
        user_rank: userRank,
        server_id: serverId
      }
    });
  }
};

// Fonction pour tracker une page
export const trackPageViewOptimized = (pageName, pageTitle) => {
  if (isAnalyticsAvailable()) {
    try {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_name: pageName
      });
    } catch (error) {
      console.error('Erreur lors du tracking de page:', error);
    }
  } else {
    queueEvent('event', 'page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_name: pageName
    });
  }
};

// Fonction pour tracker une conversion
export const trackConversionOptimized = (conversionType, value) => {
  if (isAnalyticsAvailable()) {
    try {
      window.gtag('event', 'conversion', {
        event_category: 'engagement',
        event_label: conversionType,
        value: value
      });
    } catch (error) {
      console.error('Erreur lors du tracking de conversion:', error);
    }
  } else {
    queueEvent('event', 'conversion', {
      event_category: 'engagement',
      event_label: conversionType,
      value: value
    });
  }
};

export default {
  loadAnalyticsOptimized,
  isAnalyticsAvailable,
  trackEventOptimized,
  setUserPropertiesOptimized,
  trackPageViewOptimized,
  trackConversionOptimized
};
