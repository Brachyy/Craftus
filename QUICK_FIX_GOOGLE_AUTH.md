# 🔧 Fix Rapide : "The requested action is invalid"

## ✅ Ce qui a été fait

1. ✅ Plugin Google Auth natif installé (`@codetrix-studio/capacitor-google-auth`)
2. ✅ Code Firebase modifié pour utiliser l'authentification native sur Android
3. ✅ SHA-1 récupérés (debug et release)
4. ✅ Configuration Capacitor préparée

## ⚠️ Actions Requises de Votre Part

### Étape 1 : Récupérer votre Web Client ID (2 min)

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet Craftus
3. **Authentication** > **Sign-in method**
4. Cliquez sur **Google** (ligne avec Google)
5. Développez **"Configuration du SDK Web"**
6. **Copiez le "Web client ID"** (format: `123456789-xxx.apps.googleusercontent.com`)

### Étape 2 : Configurer Capacitor (1 min)

Éditez `capacitor.config.ts` et remplacez :
```typescript
serverClientId: 'VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com',
```

Par votre vrai Client ID (celui copié à l'étape 1)

### Étape 3 : Ajouter les SHA-1 à Firebase (3 min)

Dans Firebase Console :
1. **Paramètres du projet** > **Vos applications**
2. Si pas d'app Android : **Ajoutez une application** > **Android**
   - Package : `com.craftus.app`
   - Nom : `Craftus`
3. Dans **Empreintes de certificat** :
   - Cliquez **Ajouter une empreinte**
   - Ajoutez : `87:42:27:AE:B5:69:CB:5A:3C:38:F8:1E:B6:40:90:74:0E:89:F5:97` (DEBUG)
   - Cliquez à nouveau **Ajouter une empreinte**
   - Ajoutez : `92:74:3E:78:87:38:9C:91:61:20:65:60:41:AD:24:C3:61:B7:A6:C4` (RELEASE)

### Étape 4 : Télécharger google-services.json (1 min)

1. Après avoir ajouté les SHA-1, cliquez sur **Télécharger google-services.json**
2. Remplacez le fichier : `android/app/google-services.json`

### Étape 5 : Rebuild et tester (2 min)

```bash
cd /home/etud/Documents/Perso/Craftus

# Rebuild l'application
npm run build
npx cap sync

# Recompiler l'APK
cd android
./gradlew assembleDebug

# Réinstaller sur l'émulateur
cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Lancer l'app
adb shell am start -n com.craftus.app/.MainActivity
```

### Étape 6 : Tester ✨

1. Cliquez sur "Se connecter avec Google"
2. **Une fenêtre NATIVE Android** devrait apparaître (plus de navigateur web !)
3. Sélectionnez votre compte
4. ✅ Authentification réussie !

---

## 📋 Fichiers Importants

- `SHA1_INFO.txt` - Tous les SHA-1 et instructions détaillées
- `GOOGLE_AUTH_SETUP.md` - Guide complet
- `capacitor.config.ts` - À modifier avec votre Client ID

---

## 🐛 Si ça ne marche toujours pas

Vérifiez :
- [ ] Le `serverClientId` dans `capacitor.config.ts` est correct
- [ ] Les 2 SHA-1 sont bien dans Firebase Console
- [ ] `google-services.json` est à jour dans `android/app/`
- [ ] L'app a été rebuild après les changements

Logs pour debug :
```bash
adb logcat | grep -i "google\|firebase"
```

---

## 📊 Résumé

**Avant** : Authentification web (popup) → ❌ "invalid action"  
**Après** : Authentification native Android → ✅ Fonctionne !

**Temps total** : ~10 minutes  
**Difficulté** : Facile (copier-coller principalement)

