// src/components/AdBlockDetector.jsx
import React, { useEffect, useRef } from 'react';

export default function AdBlockDetector({ onAdBlockDetected, onAdBlockResolved }) {
  const adBlockDetectedRef = useRef(false);


  // Test basé sur la logique du diagnostic qui fonctionne bien
  useEffect(() => {
    const testAdBlock = async () => {
      try {
        // Utiliser la même logique que le diagnostic : mode 'no-cors'
        const response = await fetch('https://www.google-analytics.com/analytics.js', { 
          mode: 'no-cors' 
        });
        
        // Si on arrive ici, la ressource est accessible
        return false; // Pas de bloqueur
      } catch (error) {
        // Si erreur, c'est probablement un bloqueur
        return true; // Bloqueur détecté
      }
    };

    // Attendre un peu que Analytics soit chargé, puis tester
    const timer = setTimeout(async () => {
      const isBlocked = await testAdBlock();
      
      if (isBlocked) {
        adBlockDetectedRef.current = true;
        onAdBlockDetected?.();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [onAdBlockDetected]);

  // Vérification finale simple (une seule fois)
  useEffect(() => {
    const finalCheck = setTimeout(() => {
      // Seulement si aucun bloqueur n'a été détecté ET que gtag est disponible
      if (!adBlockDetectedRef.current && typeof window.gtag !== 'undefined') {
        onAdBlockResolved?.();
      }
    }, 5000);

    return () => clearTimeout(finalCheck);
  }, []); // Dépendance vide = une seule fois


  return null;
}
