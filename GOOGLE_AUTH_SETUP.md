# Configuration Google Sign-In pour Android

## ⚠️ IMPORTANT : Configuration Requise

Pour que l'authentification Google fonctionne sur Android, vous devez configurer Firebase et obtenir votre **Client ID OAuth Web**.

## 📋 Étapes de Configuration

### 1. Obtenir votre Client ID OAuth Web

1. **Allez sur Firebase Console** : https://console.firebase.google.com
2. **Sélectionnez votre projet Craftus**
3. **Authentication** > **Sign-in method**
4. **Google** > Cliquez sur l'icône de modification
5. **Développer "Configuration du SDK Web"**
6. **Copiez le "Web client ID"** (format: `123456789-abc...xyz.apps.googleusercontent.com`)

### 2. Configurer le Client ID dans Capacitor

Éditez le fichier `capacitor.config.ts` et ajoutez :

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.craftus.app',
  appName: 'Craftus',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'VOTRE_WEB_CLIENT_ID_ICI.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    }
  },
  android: {
    buildOptions: {
      keystorePath: 'app/craftus-release-key.keystore',
      keystoreAlias: 'craftus-key',
    }
  }
};

export default config;
```

### 3. Obtenir et Ajouter le SHA-1

#### Pour la version Debug (tests)

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

#### Pour la version Release (production)

```bash
keytool -list -v -keystore android/app/craftus-release-key.keystore -alias craftus-key -storepass craftus2025 | grep SHA1
```

### 4. Ajouter le SHA-1 à Firebase

1. **Firebase Console** > **Paramètres du projet** > **Vos applications**
2. Sélectionnez votre application Android (`com.craftus.app`)
3. Si elle n'existe pas, ajoutez-la avec **Ajouter une application** > **Android**
4. Dans **Empreintes de certificat**, cliquez **Ajouter une empreinte**
5. Collez votre SHA-1 (debug ET release)
6. **Téléchargez le nouveau `google-services.json`**
7. Remplacez `android/app/google-services.json` avec le nouveau fichier

### 5. Rebuild et Test

```bash
# Rebuild l'application
npm run build
npx cap sync

# Recompiler l'APK
cd android
./gradlew clean
./gradlew assembleDebug

# Réinstaller sur l'émulateur
cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Lancer l'app
adb shell am start -n com.craftus.app/.MainActivity
```

## 🔍 Vérification

Après la configuration :
1. Lancez l'application
2. Cliquez sur "Se connecter avec Google"
3. Une fenêtre native Android devrait apparaître (pas un navigateur web)
4. Sélectionnez votre compte Google
5. L'authentification devrait fonctionner !

## 🐛 Dépannage

### Erreur : "The requested action is invalid"
- ✅ **RÉSOLU** : Vous utilisez maintenant l'authentification native

### Erreur : "Developer error" ou "Error 10"
- Vérifiez que le SHA-1 est bien ajouté dans Firebase Console
- Vérifiez que le package name est correct (`com.craftus.app`)
- Re-téléchargez `google-services.json` après avoir ajouté le SHA-1

### L'authentification ne fait rien
- Vérifiez que le `serverClientId` est correct dans `capacitor.config.ts`
- Vérifiez les logs : `adb logcat | grep -i google`

## 📝 Checklist

- [ ] Client ID OAuth Web copié depuis Firebase Console
- [ ] `capacitor.config.ts` mis à jour avec le Client ID
- [ ] SHA-1 debug récupéré
- [ ] SHA-1 release récupéré
- [ ] SHA-1 ajoutés dans Firebase Console
- [ ] `google-services.json` téléchargé et placé dans `android/app/`
- [ ] Application rebuild et réinstallée
- [ ] Test d'authentification fonctionnel

---

## 🎯 Résumé Rapide

1. **Obtenir** : Client ID Web OAuth depuis Firebase
2. **Configurer** : Ajouter dans `capacitor.config.ts`
3. **SHA-1** : Récupérer et ajouter dans Firebase Console
4. **google-services.json** : Télécharger et remplacer
5. **Rebuild** : `npm run build && npx cap sync && cd android && ./gradlew assembleDebug`
6. **Tester** : Réinstaller et tester l'authentification


