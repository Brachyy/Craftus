# Guide de Déploiement Google Play Store - Craftus

Ce guide explique comment déployer l'application Craftus sur le Google Play Store.

## 🏗️ Architecture du Projet

- **Framework** : React + Vite + Capacitor 6
- **Type** : Application hybride (Web + Native)
- **Build** : Production vers dossier `dist/`
- **Plateforme** : Android (Google Play Store)

## 📱 Configuration de l'Application

### Identifiants de l'Application
- **Package Name** : `com.craftus.app`
- **App Name** : `Craftus`
- **Version Code** : `1`
- **Version Name** : `1.0.0`

### Configuration Capacitor
```typescript
// capacitor.config.ts
appId: 'com.craftus.app'
appName: 'Craftus'
webDir: 'dist'
```

### Configuration Android
- **Compile SDK** : 35
- **Target SDK** : 35
- **Min SDK** : 23
- **Java Version** : 17

## 🔐 Configuration de Signature

### Fichier de Configuration
Le fichier `android/key.properties` contient :
```
storeFile=craftus-release-key.keystore
storePassword=craftus2025
keyAlias=craftus-key
keyPassword=craftus2025
```

### Keystore
- **Fichier** : `android/app/craftus-release-key.keystore`
- **Mot de passe** : `craftus2025` (stocké dans `android/keystore_password.txt`)
- **⚠️ IMPORTANT** : Sauvegardez ces fichiers en lieu sûr !

## 🔥 Configuration Firebase

### Configuration Web (actuelle)
Firebase est déjà configuré pour la version web via des variables d'environnement dans `src/lib/firebase.js`.

### Configuration Android
Pour ajouter le support Android à Firebase :

1. **Allez sur Firebase Console** : https://console.firebase.google.com
2. **Sélectionnez votre projet Craftus**
3. **Ajoutez une application Android** :
   - Package name : `com.craftus.app`
   - App nickname : `Craftus Android`
4. **Téléchargez `google-services.json`**
5. **Placez-le dans** : `android/app/google-services.json`

#### Pour Google Sign-In (SHA-1)
Récupérez le SHA-1 de votre keystore :
```bash
keytool -list -v -keystore android/app/craftus-release-key.keystore -alias craftus-key -storepass craftus2025
```

Ajoutez-le dans Firebase Console → Paramètres du projet → Empreintes de certificat.

## 🚀 Processus de Déploiement

### Prérequis
- Node.js installé
- Java 17 installé
- Variables d'environnement Firebase configurées

### 1. Build de Production Web
```bash
# Installation des dépendances (première fois)
npm install

# Build de l'application React
npm run build
```

### 2. Synchronisation Capacitor
```bash
# Copie les fichiers web vers Android
npm run cap:sync
```

### 3. Build Android

#### Option A : APK (pour tests)
```bash
cd android
./gradlew assembleRelease
```
**Fichier généré** : `android/app/build/outputs/apk/release/app-release.apk` (3.4 MB)

#### Option B : AAB (pour Play Store) ✅
```bash
cd android
./gradlew bundleRelease
```
**Fichier généré** : `android/app/build/outputs/bundle/release/app-release.aab` (3.2 MB)

### 4. Upload sur Google Play Console

1. Connectez-vous à [Google Play Console](https://play.google.com/console)
2. Créez une nouvelle application ou sélectionnez Craftus
3. Allez dans **Production** > **Créer une nouvelle version**
4. Uploadez le fichier `app-release.aab`
5. Remplissez les informations requises :
   - Description de l'application
   - Captures d'écran
   - Icône de l'application
   - Notes de version
6. Soumettez pour révision
7. Une fois approuvé, publiez l'application

## 📋 Commandes Utiles

### Build Complet
```bash
# Build web + sync + build Android
npm run build && npm run cap:sync && cd android && ./gradlew bundleRelease
```

### Ouvrir Android Studio
```bash
npm run cap:android
```

### Nettoyer le Build Android
```bash
cd android && ./gradlew clean
```

### Vérifier la Signature du Keystore
```bash
keytool -list -v -keystore android/app/craftus-release-key.keystore -alias craftus-key
```

### Installer l'APK sur un Appareil
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## 🔄 Mise à Jour de l'Application

Pour publier une nouvelle version :

1. **Mettre à jour les versions** dans `android/app/build.gradle` :
```gradle
versionCode 2        // Incrémenter à chaque publication
versionName "1.1.0"  // Version sémantique
```

2. **Rebuild l'application** :
```bash
npm run build
npm run cap:sync
cd android
./gradlew clean
./gradlew bundleRelease
```

3. **Upload sur Play Console** avec les nouvelles notes de version

## 📁 Structure des Fichiers Importants

```
Craftus/
├── src/                                    # Code source React
├── dist/                                   # Build web (généré)
├── android/
│   ├── app/
│   │   ├── build.gradle                   # Config app Android
│   │   ├── craftus-release-key.keystore   # Keystore de signature ⚠️
│   │   ├── google-services.json           # Config Firebase (à ajouter) ⚠️
│   │   └── src/main/
│   │       └── AndroidManifest.xml        # Manifeste Android
│   ├── key.properties                     # Credentials de signature ⚠️
│   ├── keystore_password.txt              # Mots de passe ⚠️
│   ├── variables.gradle                   # Variables SDK
│   ├── gradle.properties                  # Config Gradle
│   └── build.gradle                       # Config Gradle principale
├── capacitor.config.ts                    # Config Capacitor
└── package.json                           # Dépendances et scripts
```

⚠️ = Fichiers sensibles (déjà dans .gitignore)

## 🔧 Dépannage

### Erreur : "invalid source release"
- Vérifiez que Java 17 est installé : `java -version`
- Vérifiez `android/gradle.properties` pour la config Java

### Erreur : "Keystore not found"
- Vérifiez que `android/app/craftus-release-key.keystore` existe
- Vérifiez le chemin dans `android/key.properties`

### Erreur de build Capacitor
```bash
# Réinstallez les dépendances
rm -rf node_modules
npm install
npm run cap:sync
```

### L'application ne se lance pas
- Vérifiez que Firebase est correctement configuré
- Testez d'abord l'APK localement avec `adb install`

## ⚠️ Points d'Attention

### Sécurité
- ✅ Le keystore et les mots de passe sont dans `.gitignore`
- ✅ Sauvegardez `android/app/craftus-release-key.keystore` en lieu sûr
- ✅ Sauvegardez `android/keystore_password.txt` de façon sécurisée
- ⚠️ Sans le keystore, vous ne pourrez JAMAIS mettre à jour l'app sur le Play Store !

### Identifiants Uniques
- Package name `com.craftus.app` est unique sur le Play Store
- Ne changez jamais le package name après la publication

### Versions
- Incrémentez `versionCode` à **chaque** déploiement
- Suivez la convention sémantique pour `versionName` (1.0.0, 1.1.0, 2.0.0, etc.)

### Tests Avant Publication
1. Testez l'APK sur plusieurs appareils physiques
2. Vérifiez que Firebase fonctionne (Auth, Firestore)
3. Testez les fonctionnalités critiques
4. Vérifiez les permissions dans l'AndroidManifest.xml

## 📊 Informations des Builds

### Build Actuel (v1.0.0)
- **APK** : 3.4 MB
- **AAB** : 3.2 MB
- **Java** : Version 17
- **Capacitor** : Version 6
- **Date** : 2 octobre 2025

## 📞 Support

- **Documentation Capacitor** : https://capacitorjs.com/docs
- **Documentation React** : https://react.dev
- **Documentation Vite** : https://vite.dev
- **Google Play Console** : https://support.google.com/googleplay/android-developer
- **Firebase Console** : https://console.firebase.google.com

---

## ✅ Checklist de Publication

Avant de publier sur le Play Store :

- [ ] Build web réussi (`npm run build`)
- [ ] Sync Capacitor réussi (`npm run cap:sync`)
- [ ] AAB généré (`./gradlew bundleRelease`)
- [ ] APK testé localement sur appareil physique
- [ ] Firebase configuré pour Android (google-services.json)
- [ ] SHA-1 ajouté dans Firebase (pour Google Sign-In)
- [ ] Keystore sauvegardé en lieu sûr
- [ ] Mots de passe du keystore sauvegardés
- [ ] Versions incrémentées (versionCode et versionName)
- [ ] Captures d'écran préparées pour le Play Store
- [ ] Description de l'application rédigée
- [ ] Icône de l'application créée (512x512 px)
- [ ] Politique de confidentialité disponible (si collecte de données)
- [ ] Notes de version rédigées

---

**Note** : Ce guide est spécifique à Craftus. Pour adapter à une autre application, modifiez les identifiants (package name, app name) et régénérez un nouveau keystore.

