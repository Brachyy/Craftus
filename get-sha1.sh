#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "   Récupération des SHA-1 pour Firebase - Craftus"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "📱 SHA-1 de la clé DEBUG (pour les tests sur émulateur) :"
echo "─────────────────────────────────────────────────────────"
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep SHA1 || echo "❌ Clé debug non trouvée"
echo ""

echo "🔐 SHA-1 de la clé RELEASE (pour la production) :"
echo "─────────────────────────────────────────────────────────"
keytool -list -v -keystore android/app/craftus-release-key.keystore -alias craftus-key -storepass craftus2025 2>/dev/null | grep SHA1 || echo "❌ Clé release non trouvée"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "📋 PROCHAINES ÉTAPES :"
echo "═══════════════════════════════════════════════════════"
echo "1. Copiez les SHA-1 ci-dessus"
echo "2. Allez sur Firebase Console : https://console.firebase.google.com"
echo "3. Paramètres du projet > Vos applications > Android"
echo "4. Ajoutez ces SHA-1 dans 'Empreintes de certificat'"
echo "5. Téléchargez le nouveau google-services.json"
echo "6. Remplacez android/app/google-services.json"
echo ""

