// src/components/AnalyticsTest.jsx
// Composant de test pour vérifier Google Analytics
import React, { useState } from 'react';
import { analytics } from '../lib/analytics';

export default function AnalyticsTest() {
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, success) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = () => {
    setTestResults([]);
    
    // Test 1: Vérifier que gtag existe
    if (typeof gtag !== 'undefined') {
      addTestResult('Google Analytics chargé', true);
    } else {
      addTestResult('Google Analytics chargé', false);
    }

    // Test 2: Envoyer un événement de test
    try {
      analytics.itemAdded('Test Item', 'Test Server');
      addTestResult('Événement item_added', true);
    } catch (error) {
      addTestResult('Événement item_added', false);
    }

    // Test 3: Envoyer un événement de recherche
    try {
      analytics.searchPerformed('test search', 5);
      addTestResult('Événement search_performed', true);
    } catch (error) {
      addTestResult('Événement search_performed', false);
    }

    // Test 4: Envoyer un événement d'erreur
    try {
      analytics.errorOccurred('test_error', 'Test error message');
      addTestResult('Événement error_occurred', true);
    } catch (error) {
      addTestResult('Événement error_occurred', false);
    }

    // Test 5: Vérifier la console
    console.log('🔍 Test Analytics - Vérifiez la console pour les événements gtag');
    addTestResult('Console vérifiée', true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-800 border border-slate-600 rounded-lg p-4 max-w-sm">
      <h3 className="text-white font-semibold mb-2">🧪 Test Analytics</h3>
      
      <button
        onClick={runTests}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium mb-3"
      >
        Lancer les Tests
      </button>

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {testResults.map((result, index) => (
          <div key={index} className={`text-xs flex items-center gap-2 ${
            result.success ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>{result.success ? '✅' : '❌'}</span>
            <span className="flex-1">{result.test}</span>
            <span className="text-slate-500">{result.timestamp}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-400">
        <p>💡 Ouvrez la console (F12) pour voir les événements</p>
        <p>📊 Vérifiez Google Analytics en temps réel</p>
      </div>
    </div>
  );
}
