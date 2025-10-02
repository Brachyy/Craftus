# 🔧 FIX : Configuration du Web Client ID dans Firebase Console

## ❌ Problème actuel

L'erreur indique :
```
Invalid audience value: server:client_id:Your Web Client Key
```

Cela signifie que Firebase Console utilise encore le placeholder "Your Web Client Key" au lieu du vrai Web Client ID.

## ✅ Solution : Configuration dans Google Cloud Console

### Étape 1 : Aller dans Google Cloud Console

1. Allez sur : https://console.cloud.google.com/
2. Sélectionnez votre projet : **craftus-69b09**
3. Dans le menu de gauche, cherchez **"APIs & Services"** → **"Credentials"**
   ou allez directement sur : https://console.cloud.google.com/apis/credentials?project=craftus-69b09

### Étape 2 : Vérifier les OAuth 2.0 Client IDs

Vous devriez voir plusieurs Client IDs :

1. **Web client (auto created by Google Service)** - Type : Web application
   - C'est celui qui pose problème
   - Client ID devrait être : `397850525521-jn28irio01k8kc57dbncuslnb8qi7tq3.apps.googleusercontent.com`

2. **Web client (created by Firebase)** - Type : Web application

3. **Android client** - Type : Android

### Étape 3 : Configurer le Web Client ID

1. Cliquez sur le **Web client (auto created by Google Service)**
2. Dans la section **"Authorized JavaScript origins"**, ajoutez :
   ```
   https://craftus-69b09.firebaseapp.com
   https://craftus-69b09.web.app
   http://localhost
   http://localhost:5173
   ```

3. Dans la section **"Authorized redirect URIs"**, ajoutez :
   ```
   https://craftus-69b09.firebaseapp.com/__/auth/handler
   https://craftus-69b09.web.app/__/auth/handler
   http://localhost
   http://localhost:5173/__/auth/handler
   ```

4. Cliquez sur **"Save"**

### Étape 4 : Vérifier dans Firebase Authentication

1. Retournez sur Firebase Console : https://console.firebase.google.com/
2. Sélectionnez votre projet **craftus-69b09**
3. Allez dans **"Authentication"** → **"Sign-in method"**
4. Cliquez sur **"Google"**
5. Vérifiez que :
   - **Status** : Activé (Enabled)
   - **Web SDK configuration** → **Web Client ID** : `397850525521-jn28irio01k8kc57dbncuslnb8qi7tq3.apps.googleusercontent.com`
   - **Authorized domains** : contient `localhost` et vos domaines Firebase

### Étape 5 : Re-télécharger google-services.json

1. Dans Firebase Console, allez dans **"Project settings"** (⚙️)
2. Descendez à **"Your apps"**
3. Cliquez sur votre application Android
4. Cliquez sur **"Download google-services.json"**
5. Remplacez le fichier `android/app/google-services.json`

### Étape 6 : Rebuild l'application

```bash
cd /home/etud/Documents/Perso/Craftus
npm run cap:sync
cd android && ./gradlew clean assembleDebug
cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.craftus.app/.MainActivity
```

## 🔍 Alternative : Vérifier le SHA-1 dans Firebase

Si le problème persiste, vérifiez que les SHA-1 sont bien enregistrés :

1. Dans Firebase Console → **Project Settings** → **Your apps** → Android app
2. Vérifiez que vous avez bien **2 SHA-1** :
   - Debug SHA-1 : `92:74:3E:78:87:38:9C:91:61:20:65:60:41:AD:24:C3:61:B7:A6:C4`
   - Release SHA-1 : `87:42:27:AE:B5:69:CB:5A:3C:38:F8:1E:B6:40:90:74:0E:89:F5:97`

3. Si l'un des deux manque, ajoutez-le et re-téléchargez `google-services.json`

## 📞 Support

Si le problème persiste après ces étapes, partagez :
- Screenshot de la page Google Cloud Console → Credentials
- Screenshot de Firebase Authentication → Google Sign-In configuration

