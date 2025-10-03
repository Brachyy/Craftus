import React, { useEffect, useRef, useState } from "react";
import { colors } from "./theme/colors";
import SearchBar from "./components/SearchBar";
import JobSelect from "./components/JobSelect";
import ItemCard from "./components/ItemCard";
import ComparisonTable from "./components/ComparisonTable";
import ShoppingList from "./components/ShoppingList";

// Analytics
import { analytics, initAnalytics, setUserProperties } from "./lib/analytics";

import { itemAnkamaId, itemImage, itemLevel, itemName } from "./lib/utils";
import {
  apiGET,
  searchItems,
  fetchRecipeEntriesForItem,
  fetchItemsByIds,
  fetchRecipeMetaForItem,
  tryFetchRecipesForItem,
} from "./lib/api";

// Firebase (auth + sessions)
import { auth, onAuthStateChanged, signInWithGoogle } from "./lib/firebase";
import AuthBar from "./auth/AuthBar";
import SaveDialog from "./sessions/SaveDialog";
import LoadDialog from "./sessions/LoadDialog";
import PriceComparisonModal from "./components/PriceComparisonModal";
import SearchSuggestions from "./components/SearchSuggestions";
import FavoritesModal from "./components/FavoritesModal";
import HelpModal from "./components/HelpModal";
import MainMenu from "./components/MainMenu";
import AuthRequired from "./components/AuthRequired";
import AuthLoading from "./components/AuthLoading";
import FloatingNav from "./components/FloatingNav";
import CommunityCallToAction from "./components/CommunityCallToAction";
import CommunityReward from "./components/CommunityReward";
import UserRankDisplay from "./components/UserRankDisplay";
import { updateUserRank } from "./lib/userRanks";
import UsernameModal from "./components/UsernameModal";
import Footer from "./components/Footer";
import SharePromotion from "./components/SharePromotion";
import SiteAlert from "./components/SiteAlert";
import AnalyticsTest from "./components/AnalyticsTest";

// Favoris Firebase
import { 
  addToFavorites, 
  removeFromFavorites, 
  getUserFavorites, 
  isItemFavorite,
  rebuildFavoriteItems
} from "./lib/favorites";

// Métadonnées (types & classes)
import { loadItemTypes, loadBreeds, extractItemTypeMeta } from "./lib/meta";

// Prix communautaires
import {
  getCommunityPrice,
  pushCommunityPrice,
  PRICE_KIND,
} from "./lib/communityPrices";
import { getUserName, setUserName } from "./lib/userNames";
import { saveUserProfile } from "./lib/userProfiles";

// Logos
import craftusLogo from "./assets/craftus.png";
import craftusLogoNew from "./assets/craftus_logo.png";

const TAX_RATE = 0.02;

// ---- calculs (net = revenu brut - taxe 2%) ----
function computeInvestment(it) {
  const perUnit = (it.ingredients || []).reduce((sum, ing) => {
    if (ing.farmed) return sum;
    return sum + (ing.unitPrice ?? 0) * ing.qty;
  }, 0);
  return perUnit * (it.craftCount || 1);
}
function computeGrossRevenue(it) {
  return (it.sellPrice ?? 0) * (it.craftCount || 1);
}
function computeTax(it) {
  return computeGrossRevenue(it) * TAX_RATE;
}
function computeNetRevenue(it) {
  return computeGrossRevenue(it) - computeTax(it);
}
function computeGain(it) {
  return computeNetRevenue(it) - computeInvestment(it);
}
function computeCoeff(it) {
  const inv = computeInvestment(it);
  const net = computeNetRevenue(it);
  if (!inv) return null;
  return net / inv;
}

// --------- outils partage (Base64URL) ----------
function toBase64Url(json) {
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function fromBase64Url(b64url) {
  const b64 = b64url.replaceAll("-", "+").replaceAll("_", "/") + "===".slice(0, (4 - (b64url.length % 4)) % 4);
  const s = atob(b64);
  return decodeURIComponent(escape(s));
}

export default function App() {
  // Recherche
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // Fil d'objets
  const [items, setItems] = useState([]);
  const [showLimitMessage, setShowLimitMessage] = useState(false);

  // Connexion Google
  const handleSignInWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      // Sauvegarder le profil utilisateur
      await saveUserProfile(user);
      
      // Vérifier si l'utilisateur a déjà un nom d'utilisateur
      const existingUserName = await getUserName(user.uid);
      
      if (existingUserName) {
        setUserNameState(existingUserName);
      } else {
        // Première connexion - demander un nom d'utilisateur
        setShowUsernameModal(true);
      }
      
      setUser(user);
    } catch (error) {
      console.error("Erreur de connexion:", error);
    }
  };

  // Gestion du nom d'utilisateur défini
  const handleUsernameSet = (username) => {
    setUserNameState(username);
    setShowUsernameModal(false);
  };

  // Authentification
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [userName, setUserNameState] = useState(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [rankUpdateTrigger, setRankUpdateTrigger] = useState(0);

  // Filtres visibles
  const [equipmentOnly, setEquipmentOnly] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");

  // Multi-serveur (segmentation des prix)
  const [serverId, setServerId] = useState(() => {
    // Restaurer le serveur sauvegardé ou utiliser "Brial" par défaut
    const savedServer = localStorage.getItem('craftus_selected_server');
    return savedServer || "Brial";
  });

  // Comparaison de prix
  const [selectedForComparison, setSelectedForComparison] = useState(new Set());
  const [openComparison, setOpenComparison] = useState(false);
  const [openFavorites, setOpenFavorites] = useState(false);

  // Favoris Firebase
  const [favorites, setFavorites] = useState(new Set());
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("craftus_search_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debug (facultatif)
  const [debugUrl, setDebugUrl] = useState("");
  const [debugErr, setDebugErr] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  // Tri comparatif
  const [sort, setSort] = useState({ key: "gain", dir: "desc" });

  // Sauvegarder le serveur sélectionné
  useEffect(() => {
    localStorage.setItem('craftus_selected_server', serverId);
  }, [serverId]);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false); // Fin du chargement d'authentification
      if (u) {
        loadFavorites(u.uid);
        // Charger le nom d'utilisateur si connecté
        try {
          const existingUserName = await getUserName(u.uid);
          if (existingUserName) {
            setUserNameState(existingUserName);
            // Analytics : Utilisateur connecté
            setUserProperties(u.uid, existingUserName, 'unknown', serverId);
            analytics.userSignIn('google');
          }
        } catch (error) {
          console.error("Erreur lors du chargement du nom d'utilisateur:", error);
          analytics.errorOccurred('username_load', error.message);
        }
      } else {
        // Utilisateur déconnecté, nettoyer les favoris et le nom
        setFavorites(new Set());
        setUserNameState(null);
        setFavoriteItems([]);
        // Analytics : Utilisateur déconnecté
        analytics.userSignOut();
      }
    });
    return () => unsub();
  }, []);

  // Modales sessions
  const [openSave, setOpenSave] = useState(false);
  const [openLoad, setOpenLoad] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  
  // Alerte intégrée
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '', type: 'info' });
  
  // Ouvrir automatiquement le helper pour les utilisateurs non connectés (à chaque actualisation)
  useEffect(() => {
    // Attendre que l'authentification soit terminée
    if (authLoading) return;
    
    // Afficher le helper à chaque fois pour les utilisateurs non connectés
    if (!user) {
      setOpenHelp(true);
    }
  }, [user, authLoading]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Icône de la session courante
  const [sessionIconUrl, setSessionIconUrl] = useState(null);
  const [sessionName, setSessionName] = useState(null);

  // Types d'objet & classes
  const [itemTypesMap, setItemTypesMap] = useState({});
  const [breeds, setBreeds] = useState([]);

  // Recharger les favoris quand les métadonnées sont disponibles ET qu'un utilisateur est connecté
  useEffect(() => {
    if (user && Object.keys(itemTypesMap).length > 0 && breeds.length > 0) {
      loadFavorites(user.uid);
    }
  }, [itemTypesMap, breeds, user]);

  // Pré-remplissage différé (après restauration / ouverture lien)
  const [pendingPrefill, setPendingPrefill] = useState(false);

  // Initialiser Analytics
  useEffect(() => {
    initAnalytics();
  }, []);

  // Charger types + classes
  useEffect(() => {
    (async () => {
      const [typesMap, breedsArr] = await Promise.all([
        loadItemTypes(setDebugUrl, setDebugErr),
        loadBreeds(setDebugUrl, setDebugErr),
      ]);
      setItemTypesMap(typesMap || {});
      setBreeds(Array.isArray(breedsArr) ? breedsArr : []);
    })();
  }, []);

  // Charger métiers
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGET(`/jobs?$limit=100`, setDebugUrl, setDebugErr);
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        const norm = arr
          .map((j) => {
            const id = j?.id ?? j?._id ?? j?.ankamaId ?? j?.ankama_id;
            if (id == null) return null;
            const name = j?.name?.fr || j?.name || `Job ${id}`;
            const iconUrl =
              j?.iconUrl ||
              j?.imgUrl ||
              j?.icon ||
              j?.imageUrl ||
              (j?.icon?.url ? j.icon.url : undefined) ||
              (j?.iconId ? `https://api.dofusdb.fr/img/jobs/${j.iconId}.png` : undefined) ||
              (id ? `https://dofusdb.fr/assets/jobs/${id}.png` : undefined);
            return { id, name, iconUrl };
          })
          .filter(Boolean);
        setJobs(norm);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // Recherche live (debounce)
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggest(true);
    const filters = {
      equipmentOnly,
      craftableOnly: true, // ⬅️ FORCÉ
      jobId: jobId || null,
      jobName: null,
    };
    debounceRef.current = setTimeout(async () => {
      // Recherche segmentée : favoris d'abord, puis DofusDB
      
      // 1. Rechercher dans les favoris (rapide)
      const favoriteResults = favoriteItems.filter(item => {
        const name = item.displayName || item.name?.fr || "";
        return name.toLowerCase().includes(query.trim().toLowerCase());
      });
      
      // 2. Rechercher dans DofusDB (plus lent)
      const arr = await searchItems({
        query: query.trim(),
        filters,
        setDebugUrl,
        setDebugErr,
      });
      
      // Garder les résultats séparés pour l'affichage
      setSuggestions(arr);
      setLoadingSuggest(false);
      setShowSuggestions(true);
    }, 300);
  }, [query, equipmentOnly, jobId]);

  // Ajouter un item depuis une suggestion (avec pré-remplissage des prix communautaires)
  async function addItem(raw) {
    const id = itemAnkamaId(raw);
    if (!id) return alert("ID Ankama introuvable pour cet objet.");

    // Si l'item existe déjà dans la liste, on incrémente simplement la quantité
    const already = items.find((x) => x.ankamaId === id);
    if (already) {
      setItems((prev) =>
        prev.map((it) =>
          it.ankamaId === id
            ? { ...it, craftCount: Math.max(1, Math.floor(Number(it.craftCount || 1)) + 1) }
            : it
        )
      );
      setQuery("");
      setSuggestions([]);
      addToSearchHistory(raw.displayName || raw.name?.fr || "");
      return;
    }

    const entries = await fetchRecipeEntriesForItem(id, setDebugUrl, setDebugErr);
    if (!entries.length) return alert("Recette introuvable (objet non craftable ?).");

    // Récupérer les données de métier depuis DofusDB (comme dans la recherche)
    const recs = await tryFetchRecipesForItem(id, setDebugUrl, setDebugErr);
    const jobName = recs[0]?.jobName || recs[0]?.job?.name?.fr || recs[0]?.job?.name || undefined;
    const jobId = recs[0]?.jobId ?? recs[0]?.job?.id;

    const ids = [...new Set(entries.map((e) => e.itemId))];
    const map = await fetchItemsByIds(ids, setDebugUrl, setDebugErr);

    const ingredients = entries.map((e) => {
      const rit = map[e.itemId];
      return {
        ankamaId: e.itemId,
        name: itemName(rit) || `#${e.itemId}`,
        img: itemImage(rit),
        qty: e.quantity,
        unitPrice: undefined,
        farmed: false,
      };
    });

    const { typeId, typeName } = extractItemTypeMeta(raw);

    // Récupérer les données complètes de type et métier
    const typeInfo = typeId && itemTypesMap[typeId] ? itemTypesMap[typeId] : null;
    const breedInfo = jobId ? breeds.find(b => b.id === jobId) : null;
    
    // Utiliser le nom du métier depuis les recettes plutôt que depuis les breeds
    const finalJobName = jobName || breedInfo?.name?.fr || null;
    // Utiliser l'image des jobs avec .png au lieu de .jpg
    let finalJobIconUrl = recs[0]?.job?.img || recs[0]?.job?.iconUrl || breedInfo?.img || breedInfo?.iconUrl || null;
    // Forcer .png au lieu de .jpg
    if (finalJobIconUrl && finalJobIconUrl.includes('.jpg')) {
      finalJobIconUrl = finalJobIconUrl.replace('.jpg', '.png');
    }
    
    // Créer un objet breed même si breedInfo est undefined
    const breed = breedInfo || (finalJobName ? {
      name: { fr: finalJobName },
      img: finalJobIconUrl,
      iconUrl: finalJobIconUrl
    } : null);

    const base = {
      key: `${id}-${Date.now()}`,
      ankamaId: id,
      displayName: itemName(raw) || `Item ${id}`,
      level: itemLevel(raw),
      img: itemImage(raw),
      craftCount: 1,
      ingredients,
      sellPrice: undefined,
      typeId: typeId ?? null,
      typeName: typeName ?? null,
      type: typeInfo,
      breed: breed,
      job: raw.job || null,
      jobId: jobId,
      jobName: finalJobName,
      jobLevel: recs[0]?.jobLevel || recs[0]?.level || null,
      jobIconUrl: finalJobIconUrl,
      tags: { classId: "" },
    };

    
    // Pré-remplir avec les prix communautaires (si existants)
    try {
      const [sellDoc, ...ingDocs] = await Promise.all([
        getCommunityPrice(PRICE_KIND.SELL, id, serverId),
        ...ingredients.map((ing) => getCommunityPrice(PRICE_KIND.ING, ing.ankamaId, serverId)),
      ]);
      if (sellDoc?.lastPrice != null) base.sellPrice = Number(sellDoc.lastPrice);
      base.ingredients = base.ingredients.map((ing, idx) => {
        const d = ingDocs[idx];
        return d?.lastPrice != null ? { ...ing, unitPrice: Number(d.lastPrice) } : ing;
      });
    } catch (e) {
      console.warn("[prefill] community price fetch failed", e);
    }

    setItems((prev) => {
      // Limiter selon le statut de connexion
      const maxItems = user ? 20 : 4;
      if (prev.length >= maxItems) {
        if (!user && prev.length >= 4) {
          // Ouvrir la page d'authentification pour les utilisateurs non connectés
          setShowAuthRequired(true);
          return prev;
        } else if (user && prev.length >= 20) {
          setShowLimitMessage(true);
          // Masquer le message après 3 secondes
          setTimeout(() => setShowLimitMessage(false), 3000);
          return prev; // Ne pas ajouter si déjà 20 items
        }
      }
      return [...prev, base];
    });
    setQuery("");
    setSuggestions([]);
    addToSearchHistory(raw.displayName || raw.name?.fr || "");
    
    // Analytics : Item ajouté
    analytics.itemAdded(raw.displayName || raw.name?.fr || "", serverId);
  }

  // Fonction pour forcer le rechargement des données communautaires
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Fonction pour changer de serveur avec confirmation
  const handleServerChange = (newServerId) => {
    if (newServerId === serverId) return; // Pas de changement
    
    const previousServerId = serverId;
    
    setAlertData({
      title: 'Changer de serveur',
      message: `Changer de serveur va actualiser tous les prix avec ceux du serveur ${newServerId}. Vos prix locaux seront écrasés. Continuer ?`,
      type: 'warning',
      onConfirm: async () => {
        setServerId(newServerId);
        setShowAlert(false);
        
        // Analytics : Serveur changé
        analytics.serverChanged(previousServerId, newServerId);
        
        // Actualiser directement les prix après confirmation
        if (items.length > 0) {
          await executeRefresh();
        }
      },
      onCancel: () => {
        // Revenir au serveur précédent
        setShowAlert(false);
      }
    });
    setShowAlert(true);
  };

  // Fonction pour confirmer l'actualisation des prix
  const handleConfirmRefresh = () => {
    setShowAlert(false);
    // Exécuter l'actualisation des prix
    executeRefresh();
  };

  const executeRefresh = async () => {
    try {
      const refreshed = await Promise.all(
        items.map(async (it) => {
          const copy = { ...it, ingredients: it.ingredients.map((x) => ({ ...x })) };

          try {
            const d = await getCommunityPrice(PRICE_KIND.SELL, copy.ankamaId, serverId);
            if (d?.lastPrice != null) {
              copy.sellPrice = Number(d.lastPrice);
            } else {
              copy.sellPrice = null; // Vider le prix s'il n'existe pas sur ce serveur
            }
          } catch (e) {
            console.warn("[refresh] sell", { itemId: copy.ankamaId, e });
            copy.sellPrice = null; // Vider le prix en cas d'erreur
          }

          for (let i = 0; i < copy.ingredients.length; i++) {
            const ing = copy.ingredients[i];
            try {
              const d = await getCommunityPrice(PRICE_KIND.ING, ing.ankamaId, serverId);
              if (d?.lastPrice != null) {
                ing.unitPrice = Number(d.lastPrice);
              } else {
                ing.unitPrice = null; // Vider le prix s'il n'existe pas sur ce serveur
              }
            } catch (e) {
              console.warn("[refresh] ing", { ingId: ing.ankamaId, e });
              ing.unitPrice = null; // Vider le prix en cas d'erreur
            }
          }
          return copy;
        })
      );
      
      setItems(refreshed);
      
      // Déclencher un rechargement des données communautaires
      setTimeout(() => {
        triggerRefresh();
      }, 500);
    } catch (e) {
      console.error("[refreshCommunityPricesForAll] failed", e);
    }
  };

  // Rafraîchir tous les prix depuis la BDD communautaire (DESTRUCTIF après confirmation)
  async function refreshCommunityPricesForAll() {
    if (!items.length) return;
    
    // Utiliser notre alerte intégrée au lieu de window.confirm
    setAlertData({
      title: 'Actualiser les prix communautaires',
      message: 'Cette action va écraser vos prix saisis localement avec les derniers prix communautaires. Continuer ?',
      type: 'warning'
    });
    setShowAlert(true);
  }

  // Mises à jour inputs
  const updateIngredientPrice = async (itemKey, ingId, price) => {
    const val = price === "" || price == null ? undefined : Number(price);
    setItems((prev) =>
      prev.map((it) =>
        it.key !== itemKey
          ? it
          : {
              ...it,
              ingredients: it.ingredients.map((ing) =>
                ing.ankamaId === ingId ? { ...ing, unitPrice: val } : ing
              ),
            }
      )
    );

    // Incrémenter les participations si l'utilisateur est connecté et renseigne un prix valide
    if (user && userName && val && val > 0) {
      try {
        await updateUserRank(user.uid, userName, 1);
        // Déclencher le rechargement du rank dans CommunityReward
        setRankUpdateTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rang:', error);
      }
    }
  };
  const updateSellPrice = async (itemKey, price) => {
    const val = price === "" || price == null ? undefined : Number(price);
    setItems((prev) =>
      prev.map((it) =>
        it.key !== itemKey ? it : { ...it, sellPrice: val }
      )
    );

    // Incrémenter les participations si l'utilisateur est connecté et renseigne un prix valide
    if (user && userName && val && val > 0) {
      try {
        await updateUserRank(user.uid, userName, 1);
        // Déclencher le rechargement du rank dans CommunityReward
        setRankUpdateTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rang:', error);
      }
    }
  };
  const updateCraftCount = (itemKey, count) =>
    setItems((prev) =>
      prev.map((it) =>
        it.key !== itemKey
          ? it
          : { ...it, craftCount: Math.max(1, Math.floor(Number(count) || 1)) }
      )
    );

  const removeItem = (itemKey) => {
    const item = items.find(it => it.key === itemKey);
    setItems((prev) => prev.filter((it) => it.key !== itemKey));
    
    // Analytics : Item supprimé
    if (item) {
      analytics.itemRemoved(item.displayName || `Item ${item.ankamaId}`);
    }
  };
  const clearAll = () => {
    setItems([]);
    setCurrentSessionId(null);
    setSessionIconUrl(null);
    setSessionName(null);
    setSelectedForComparison(new Set());
    // Ne pas nettoyer les favoris - ils doivent persister
  };

  // Gestion de la sélection pour comparaison
  const toggleComparison = (itemKey) => {
    setSelectedForComparison(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  // Gestion des favoris
  // Charger les favoris depuis Firebase
  const loadFavorites = async (uid) => {
    if (!uid) return;
    
    setFavoritesLoading(true);
    try {
      const favoritesData = await getUserFavorites(uid);
      const favoriteKeys = new Set(favoritesData.map(fav => fav.itemId));
      
      // Charger les items complets pour la searchbar
      const favoriteItemsData = await rebuildFavoriteItems([...favoriteKeys]);
      
      setFavorites(favoriteKeys);
      setFavoriteItems(favoriteItemsData);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Charger les items complets des favoris (pour le modal)
  const loadFavoriteItems = async () => {
    if (!user || favorites.size === 0) return;
    
    // Ne pas recharger si on a déjà les items
    if (favoriteItems.length === favorites.size) return;
    
    setFavoritesLoading(true);
    try {
      const favoriteItemsData = await rebuildFavoriteItems([...favorites]);
      setFavoriteItems(favoriteItemsData);
    } catch (error) {
      console.error("Error loading favorite items:", error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Supprimer un favori depuis le modal
  const removeFavorite = async (ankamaId) => {
    if (!user) return;
    
    try {
      await removeFromFavorites(user.uid, ankamaId);
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(ankamaId);
        return newSet;
      });
      setFavoriteItems(prev => prev.filter(fav => fav.ankamaId !== ankamaId));
      // Recharger les favoris pour synchroniser
      await loadFavorites(user.uid);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // Gestion des favoris Firebase
  const toggleFavorite = async (itemKey) => {
    const item = items.find(it => it.key === itemKey);
    if (!item) return;

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setShowAuthRequired(true);
      return;
    }

    try {
      if (favorites.has(item.ankamaId)) {
        // Retirer des favoris
        await removeFromFavorites(user.uid, item.ankamaId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.ankamaId);
          return newSet;
        });
        setFavoriteItems(prev => prev.filter(fav => fav.ankamaId !== item.ankamaId));
        // Recharger les favoris pour synchroniser
        await loadFavorites(user.uid);
      } else {
        // Ajouter aux favoris
        await addToFavorites(user.uid, item.ankamaId);
        setFavorites(prev => new Set([...prev, item.ankamaId]));
        // Recharger les favoris pour avoir des données fraîches
        await loadFavorites(user.uid);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Gestion de l'historique de recherche
  const addToSearchHistory = (query) => {
    if (!query || query.length < 2) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q !== query);
      const newHistory = [query, ...filtered].slice(0, 10); // Garder seulement 10 recherches
      localStorage.setItem("craftus_search_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Commit vers BDD communautaire au blur
  async function commitIngredientPrice(itemKey, ingId, previousValue) {
    const it = items.find((x) => x.key === itemKey);
    if (!it) return;
    const ing = it.ingredients.find((g) => g.ankamaId === ingId);
    if (!ing) return;
    const v = Number(ing.unitPrice);
    
    // Vérifications d'optimisation
    if (!Number.isFinite(v) || v < 0) return;
    if (v === 0) return; // Ne pas enregistrer les prix à zéro
    if (previousValue !== undefined && v === previousValue) return; // Pas de changement
    
    if (!auth.currentUser) {
      console.warn("[commit] ignoré: utilisateur non connecté");
      return;
    }
    
    try {
      await pushCommunityPrice(PRICE_KIND.ING, ingId, v, auth.currentUser.uid, serverId);
      
      // Déclencher un rechargement des données communautaires
      setTimeout(() => {
        triggerRefresh();
      }, 1000);
    } catch (error) {
      console.error("Erreur lors du commit du prix ingrédient:", error);
    }
  }
  
  async function commitSellPrice(itemKey, previousValue) {
    const it = items.find((x) => x.key === itemKey);
    if (!it) return;
    const v = Number(it.sellPrice);
    
    // Vérifications d'optimisation
    if (!Number.isFinite(v) || v < 0) return;
    if (v === 0) return; // Ne pas enregistrer les prix à zéro
    if (previousValue !== undefined && v === previousValue) return; // Pas de changement
    
    if (!auth.currentUser) {
      console.warn("[commit] ignoré: utilisateur non connecté");
      return;
    }
    
    try {
      await pushCommunityPrice(PRICE_KIND.SELL, it.ankamaId, v, auth.currentUser.uid, serverId);
      
      // Déclencher un rechargement des données communautaires
      setTimeout(() => {
        triggerRefresh();
      }, 1000);
    } catch (error) {
      console.error("Erreur lors du commit du prix de vente:", error);
    }
  }

  // Snapshot / restore sessions (on ne sauvegarde plus les prix : ils viennent de la BDD)
  function buildSnapshot() {
    const strippedItems = items.map((it) => ({
      ...it,
      sellPrice: undefined,
      ingredients: it.ingredients.map((ing) => ({ ...ing, unitPrice: undefined })),
    }));
    return {
      version: 4,
      when: new Date().toISOString(),
      filters: { equipmentOnly, craftableOnly: true, jobId },
      serverId,
      sort,
      items: strippedItems,
    };
  }
  function restoreFromSnapshot(snap) {
    const its = Array.isArray(snap.items) ? snap.items : [];
    its.forEach((i) => {
      i.tags = i.tags || {};
      if (i.tags.classId == null) i.tags.classId = "";
      i.sellPrice = undefined;
      i.ingredients = (i.ingredients || []).map((ing) => ({ ...ing, unitPrice: undefined }));
    });
    setItems(its);
    setSort(snap.sort || { key: "gain", dir: "desc" });
    setJobId(snap.filters?.jobId || "");
    setEquipmentOnly(!!snap.filters?.equipmentOnly);
    if (snap.serverId) setServerId(snap.serverId);
    // Demande un pré-remplissage juste après montage des items
    setPendingPrefill(true);
  }

  // --------- Partage via lien & JSON ----------
  useEffect(() => {
    const url = new URL(window.location.href);
    const data = url.searchParams.get("data");
    if (!data) return;
    try {
      const json = fromBase64Url(data);
      const snap = JSON.parse(json);
      restoreFromSnapshot(snap);
    } catch (e) {
      console.warn("Lien de partage invalide.", e);
    }
  }, []);

  // Effect qui déclenche le pré-remplissage communautaire une fois les items posés
  useEffect(() => {
    if (!pendingPrefill) return;
    (async () => {
      await Promise.resolve(); // laisse React appliquer setItems
      await refreshCommunityPricesForAll();
      setPendingPrefill(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrefill]);

  async function shareByLink() {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setShowAuthRequired(true);
      return;
    }

    try {
      const snap = buildSnapshot();
      const json = JSON.stringify(snap);
      const b64url = toBase64Url(json);
      const url = `${location.origin}${location.pathname}?data=${b64url}`;
      await navigator.clipboard.writeText(url);
      alert("Lien copié dans le presse-papiers !");
      
      // Analytics : Lien partagé
      analytics.linkShared('clipboard');
    } catch (e) {
      alert("Impossible de copier le lien. Voir console.");
      console.error(e);
      analytics.errorOccurred('share_link', e.message);
    }
  }
  function exportJSON() {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setShowAuthRequired(true);
      return;
    }

    const snap = buildSnapshot();
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `craftus-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    
    // Analytics : JSON exporté
    analytics.jsonExported();
  }
  function importJSON() {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setShowAuthRequired(true);
      return;
    }

    const txt = prompt("Collez ici le JSON de session :");
    if (!txt) return;
    try {
      const snap = JSON.parse(txt);
      restoreFromSnapshot(snap);
      alert("Session chargée !");
      
      // Analytics : JSON importé
      analytics.jsonImported();
    } catch {
      alert("JSON invalide.");
      analytics.errorOccurred('json_import', 'Invalid JSON format');
    }
  }

  function computeSuggestedLogo() {
    if (items.length > 0) {
      const it = items[0];
      const t = it.typeId && itemTypesMap[it.typeId];
      if (t?.iconUrl) return { kind: "type", id: t.id, name: t.name, url: t.iconUrl };
    }
    if (jobId) {
      const j = jobs.find((x) => String(x.id) === String(jobId));
      if (j?.iconUrl) return { kind: "job", id: j.id, name: j.name, url: j.iconUrl };
    }
    return null;
  }

  // Fonctions de navigation flottante
  const scrollToShoppingList = () => {
    const element = document.getElementById('shopping-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToComparison = () => {
    const element = document.getElementById('comparison-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Affichage conditionnel selon l'authentification
  if (authLoading) {
    return <AuthLoading />;
  }

  // Afficher AuthRequired si demandé
  if (showAuthRequired) {
        return <AuthRequired onSignIn={() => {
          handleSignInWithGoogle();
          setShowAuthRequired(false);
        }} onGoBack={() => setShowAuthRequired(false)} />;
  }

  return (
    <div className={`${colors.bg} text-slate-100 min-h-screen p-4 md:p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header avec logos */}
        <header className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Logo original */}
            <img
              src={craftusLogo}
              alt="Craftus"
              className="h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 w-auto select-none"
            />
            {/* Nouveau logo */}
            <img
              src={craftusLogoNew}
              alt="Craftus Logo"
              className="h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 w-auto select-none"
            />
            {sessionIconUrl && (
              <img
                src={sessionIconUrl}
                alt=""
                title={sessionName || "Session"}
                className="h-6 w-6 rounded ml-2"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setOpenHelp(true);
                analytics.helpOpened();
              }}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Aide et guide d'utilisation"
            >
              ❓
            </button>
            {user ? (
              <AuthBar 
                user={user} 
                userName={userName} 
                onShowUsernameModal={() => setShowUsernameModal(true)} 
              />
            ) : (
              <button
                onClick={handleSignInWithGoogle}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
                title="Se connecter pour accéder à toutes les fonctionnalités"
              >
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                Se connecter
              </button>
            )}
          </div>
        </header>

        {/* Debug */}
        {showDebug && (
          <div className={`mb-4 text-xs text-slate-400 rounded-xl ${colors.panel} border ${colors.border} p-3`}>
            <div className="font-semibold mb-1">Debug réseau</div>
            <div className="break-all">
              <div><span className="opacity-70">Dernière URL :</span> {debugUrl || "—"}</div>
              <div><span className="opacity-70">Dernière erreur :</span> {debugErr || "—"}</div>
            </div>
          </div>
        )}

        {/* Menu principal réorganisé */}
        <MainMenu
          // Configuration
          serverId={serverId}
          setServerId={handleServerChange}
          showDebug={showDebug}
          setShowDebug={showDebug}
          
          // Actions principales
          onClearAll={clearAll}
          onSave={() => setOpenSave(true)}
          onLoad={() => setOpenLoad(true)}
          user={user}
          onShowAuthRequired={() => setShowAuthRequired(true)}
          
          // Données
          onRefreshPrices={refreshCommunityPricesForAll}
          itemsCount={items.length}
          onOpenComparison={() => setOpenComparison(true)}
          selectedForComparison={selectedForComparison}
          onOpenFavorites={() => setOpenFavorites(true)}
          favoritesCount={favorites.size}
          favoritesLoading={favoritesLoading}
          
          // Export/Partage
          onShareByLink={shareByLink}
          onExportJSON={exportJSON}
          onImportJSON={importJSON}
        />

        {/* Appel à l'action communautaire pour les utilisateurs non connectés */}
        {!user && (
          <CommunityCallToAction onSignIn={handleSignInWithGoogle} />
        )}

        {/* Récompense communautaire pour les utilisateurs connectés qui ont contribué */}
        {user && (
          <CommunityReward user={user} userName={userName} rankUpdateTrigger={rankUpdateTrigger} />
        )}

        {/* Filtres (on enlève le checkbox “craftables”) */}
        <div className={`mb-4 rounded-2xl border ${colors.border} ${colors.panel} p-3`}>
          <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
  <span className="relative inline-flex w-10 h-6">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={equipmentOnly}
      onChange={(e) => setEquipmentOnly(e.target.checked)}
    />
    {/* Track */}
    <span
      className="
        block w-10 h-6 rounded-full
        bg-[#1b1f26] border border-white/10
        transition-colors duration-300
        peer-checked:bg-emerald-600
      "
    />
    {/* Knob */}
    <span
      className="
        absolute top-0.5 left-0.5
        h-5 w-5 rounded-full
        bg-[#0b0f14] border border-white/10
        transition-transform duration-200
        peer-checked:translate-x-4
      "
    />
  </span>
  <span>Uniquement les équipements</span>
</label>

            <div className="flex items-center gap-2 text-sm">
              <JobSelect jobs={jobs} value={jobId} onChange={setJobId} />
              <span className="text-slate-400 text-xs">(filtre optionnel)</span>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <SearchBar
            query={query}
            setQuery={setQuery}
            loading={loadingSuggest}
            onFocus={() => {
              if (searchHistory.length > 0 || favoriteItems.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          
          {/* Message de limite d'items */}
          {showLimitMessage && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-orange-500/90 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
              ⚠️ Limite atteinte : Maximum 20 items autorisés. Supprimez un item pour en ajouter un nouveau.
            </div>
          )}
          
          {showSuggestions && (
            <SearchSuggestions
              suggestions={suggestions}
              searchHistory={searchHistory}
              favorites={favorites}
              items={favoriteItems}
              query={query}
              onSelectItem={(item) => {
                addItem(item);
                setShowSuggestions(false);
              }}
              onSelectHistory={(query) => {
                setQuery(query);
                setShowSuggestions(false);
              }}
              onSelectFavorite={(item) => {
                addItem(item);
                setShowSuggestions(false);
              }}
              loading={loadingSuggest}
              onClose={() => setShowSuggestions(false)}
            />
          )}
        </div>

        {/* Compteur d'items */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full text-sm text-slate-300">
            <span className="text-emerald-400 font-semibold">{items.length}</span>
            <span>/ 20 items</span>
            {!user && items.length >= 4 && (
              <span className="text-orange-400 text-xs">⚠️ Connexion requise pour plus d'items</span>
            )}
            {user && items.length >= 20 && (
              <span className="text-orange-400 text-xs">⚠️ Limite atteinte</span>
            )}
          </div>
        </div>

        {/* FIL d'objets */}
        <div id="items-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
          {items.map((it) => (
            <ItemCard
              key={it.key}
              it={it}
              onRemove={(k) => removeItem(k)}
              onUpdateSellPrice={updateSellPrice}
              onCommitSellPrice={commitSellPrice}
              onUpdateCraftCount={updateCraftCount}
              onUpdateIngredientPrice={updateIngredientPrice}
              onCommitIngredientPrice={commitIngredientPrice}
              onToggleComparison={toggleComparison}
              isSelectedForComparison={selectedForComparison.has(it.key)}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.has(it.ankamaId)}
              serverId={serverId}
              refreshTrigger={refreshTrigger}
              taxRate={TAX_RATE}
              computeInvestment={computeInvestment}
              computeNetRevenue={computeNetRevenue}
              computeGain={computeGain}
              computeCoeff={computeCoeff}
            />
          ))}
        </div>

        {/* 🛒 Shopping list — entre le fil et le comparatif */}
        {items.length > 0 && (
          <div id="shopping-section" className="mt-6">
            <ShoppingList
              items={items}
              onUpdateIngredientPrice={updateIngredientPrice}
              onCommitIngredientPrice={commitIngredientPrice}
              serverId={serverId}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {/* Comparatif — maintenant dès 1 item */}
        {items.length >= 1 && (
          <div id="comparison-section">
            <ComparisonTable
            items={items}
            sort={sort}
            setSort={setSort}
            onRemove={(k) => removeItem(k)}
            taxRate={TAX_RATE}
            computeInvestment={computeInvestment}
            computeGrossRevenue={computeGrossRevenue}
            computeTax={computeTax}
            computeNetRevenue={computeNetRevenue}
          />
          </div>
        )}
      </div>

      {/* Navigation flottante */}
      <FloatingNav
        onScrollToShoppingList={scrollToShoppingList}
        onScrollToComparison={scrollToComparison}
        onOpenGraphComparison={() => setOpenComparison(true)}
        itemsCount={items.length}
        comparisonCount={selectedForComparison.size}
        selectedForComparisonCount={selectedForComparison.size}
      />

      {/* Modales */}
      <SaveDialog
        open={openSave}
        onClose={() => setOpenSave(false)}
        user={user}
        currentSessionId={currentSessionId}
        buildSnapshot={buildSnapshot}
        onSaved={(id, name, icon) => {
          setCurrentSessionId(id);
          if (name) setSessionName(name);
          if (icon?.url) setSessionIconUrl(icon.url);
        }}
        jobs={jobs}
        itemTypesMap={itemTypesMap}
        breeds={breeds}
        suggestedLogo={computeSuggestedLogo()}
      />
      <LoadDialog
        open={openLoad}
        onClose={() => setOpenLoad(false)}
        user={user}
        onLoaded={({ id, name, data, icon }) => {
          setCurrentSessionId(id);
          setSessionName(name || null);
          setSessionIconUrl(icon?.url || null);
          restoreFromSnapshot(data); // => pendingPrefill = true -> fetch communautaire auto
        }}
      />
      
      {/* Modal nom d'utilisateur */}
      {showUsernameModal && user && (
        <UsernameModal
          isOpen={showUsernameModal}
          onClose={() => setShowUsernameModal(false)}
          user={user}
          onUsernameSet={handleUsernameSet}
        />
      )}
      
      {/* Modal des favoris */}
      <FavoritesModal
        open={openFavorites}
        onClose={() => setOpenFavorites(false)}
        favorites={favorites}
        items={favoriteItems}
        onAddItem={addItem}
        onRemoveFavorite={removeFavorite}
        itemTypes={Object.values(itemTypesMap)}
        breeds={breeds}
        onLoadFavoriteItems={loadFavoriteItems}
      />
      
      {/* Modal d'aide */}
      <HelpModal
        isOpen={openHelp}
        onClose={() => {
          setOpenHelp(false);
          analytics.helpClosed();
        }}
      />
      
      {/* Footer */}
      <Footer />
      
      {/* Messages de promotion et rappels */}
      <SharePromotion user={user} selectedServer={serverId} isHelperOpen={openHelp} />
      
      {/* Alerte intégrée */}
      <SiteAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        onConfirm={alertData.onConfirm || handleConfirmRefresh}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />
      
      {/* Composant de test Analytics (développement seulement) */}
      {process.env.NODE_ENV === 'development' && <AnalyticsTest />}
    </div>
  );
}
