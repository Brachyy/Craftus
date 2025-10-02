# Guide de Déploiement Google Play Store - PopRank

Ce guide explique comment déployer l'application PopRank sur le Google Play Store et comment adapter cette configuration pour une nouvelle application.

## 🏗️ Architecture du Projet

- **Framework** : Ionic + Angular 20 + Capacitor 7
- **Type** : Application hybride (Web + Native)
- **Build** : Production vers dossier `www/`
- **Plateforme** : Android (Google Play Store)

## 📱 Configuration Actuelle

### Identifiants de l'Application
- **Package Name** : `com.poprank.app`
- **App Name** : `PopRank`
- **Version Code** : `7`
- **Version Name** : `1.2.2`

### Configuration Capacitor
```typescript
// capacitor.config.ts
appId: 'com.poprank.app'
appName: 'PopRank'
webDir: 'www'
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
storeFile=poprank-release-key.keystore
storePassword=poprank123
keyAlias=poprank-key
keyPassword=poprank123
```

### Keystore
- **Fichier** : `android/app/poprank-release-key.keystore`
- **Mot de passe** : `poprank123` (stocké dans `keystore_password.txt`)

## 🔥 Configuration Firebase

- **Project ID** : `poprank-88860`
- **Package Name** : `com.poprank.app`
- **Fichier de config** : `android/app/google-services.json`
- **Services activés** : Analytics, Auth, Google Sign-In

## 🚀 Processus de Déploiement

### 1. Build de Production
```bash
# Build de l'application
npm run build

# Synchronisation Capacitor
npm run cap:sync
```

### 2. Build Android
```bash
# Aller dans le dossier Android
cd android

# Build de l'APK
./gradlew assembleRelease

# Build de l'Android App Bundle (recommandé)
./gradlew bundleRelease
```

### 3. Fichiers Générés
- **APK** : `android/app/build/outputs/apk/release/app-release.apk`
- **AAB** : `android/app/build/outputs/bundle/release/app-release.aab`

### 4. Upload sur Google Play Console
1. Se connecter à [Google Play Console](https://play.google.com/console)
2. Sélectionner l'application PopRank
3. Aller dans "Production" > "Créer une nouvelle version"
4. Uploader le fichier AAB généré
5. Remplir les notes de version
6. Publier l'application

## 📋 Déploiement d'une Nouvelle Application

### 1. Préparation du Projet
```bash
# Cloner ou créer le nouveau projet
git clone [nouveau-projet]
cd [nouveau-projet]

# Installer les dépendances
npm install

# Build de production
npm run build
```

### 2. Configuration des Identifiants

#### Capacitor (`capacitor.config.ts`)
```typescript
const config: CapacitorConfig = {
  appId: 'com.votrenom.app',  // Changer ici
  appName: 'VotreApp',        // Changer ici
  webDir: 'www'
};
```

#### Android (`android/app/build.gradle`)
```gradle
android {
    namespace "com.votrenom.app"  // Changer ici
    defaultConfig {
        applicationId "com.votrenom.app"  // Changer ici
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### AndroidManifest (`android/app/src/main/AndroidManifest.xml`)
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name">
        <!-- ... -->
    </application>
</manifest>
```

### 3. Configuration de Signature

#### Créer un Nouveau Keystore
```bash
keytool -genkey -v -keystore votre-app-release-key.keystore -alias votre-app-key -keyalg RSA -keysize 2048 -validity 10000
```

#### Mettre à Jour `android/key.properties`
```
storeFile=votre-app-release-key.keystore
storePassword=VOTRE_MOT_DE_PASSE
keyAlias=votre-app-key
keyPassword=VOTRE_MOT_DE_PASSE
```

### 4. Configuration Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Créer un nouveau projet
3. Ajouter une application Android
4. Utiliser le nouveau package name
5. Télécharger le `google-services.json`
6. Remplacer le fichier dans `android/app/`

### 5. Build et Déploiement
```bash
# Build de production
npm run build

# Synchronisation Capacitor
npm run cap:sync

# Build Android
cd android
./gradlew bundleRelease
```

### 6. Upload sur Google Play Console
1. Créer une nouvelle application dans Google Play Console
2. Uploader l'AAB généré
3. Configurer les métadonnées
4. Publier l'application

## 🎯 Paramètres Recommandés à Conserver

### Structure de Build
- Architecture Ionic + Capacitor
- Configuration Gradle identique (SDK 35, Java 17)
- Structure de dossiers maintenue
- Scripts npm conservés

### Configuration de Signature
- Système de keystore identique
- Fichier `key.properties` dans le même format
- Même processus de build

### Configuration Firebase
- Même structure de services
- Même processus d'intégration
- Même configuration dans `build.gradle`

## ⚠️ Points d'Attention

### Sécurité
- **Changer les mots de passe** du keystore
- **Sauvegarder le keystore** en lieu sûr
- **Ne pas commiter** les fichiers de configuration sensibles

### Identifiants Uniques
- **Package name unique** sur le Play Store
- **App ID unique** dans Capacitor
- **Project ID unique** dans Firebase

### Versions
- **Incrémenter le versionCode** à chaque déploiement
- **Mettre à jour la versionName** selon la convention
- **Tester** avant chaque publication

### Permissions
- Vérifier les permissions dans `AndroidManifest.xml`
- Adapter selon les besoins de l'application
- Documenter les permissions utilisées

## 📁 Structure des Fichiers Importants

```
android/
├── app/
│   ├── build.gradle              # Configuration principale
│   ├── google-services.json      # Configuration Firebase
│   ├── poprank-release-key.keystore  # Keystore de signature
│   └── src/main/
│       └── AndroidManifest.xml   # Manifeste Android
├── key.properties               # Configuration de signature
├── variables.gradle             # Variables de version
└── build.gradle                 # Configuration Gradle principale

capacitor.config.ts              # Configuration Capacitor
package.json                     # Dépendances et scripts
```

## 🔧 Commandes Utiles

```bash
# Build complet
npm run build && npm run cap:sync

# Ouvrir Android Studio
npm run android

# Build Android uniquement
cd android && ./gradlew assembleRelease

# Nettoyer le build
cd android && ./gradlew clean

# Vérifier la signature
keytool -list -v -keystore android/app/poprank-release-key.keystore
```

## 📞 Support

Pour toute question concernant le déploiement :
1. Vérifier la documentation [Capacitor](https://capacitorjs.com/docs)
2. Consulter la documentation [Ionic](https://ionicframework.com/docs)
3. Référencer la documentation [Google Play Console](https://support.google.com/googleplay/android-developer)

---

**Note** : Ce guide est basé sur la configuration actuelle de PopRank. Adaptez les identifiants et configurations selon vos besoins spécifiques.
