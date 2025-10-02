# 🐛 Debug de l'Authentification Google - Craftus

## ✅ Corrections Appliquées

### Problème identifié
L'authentification Google native s'ouvrait, l'utilisateur sélectionnait son compte, mais rien ne se passait après.

**Cause** : GoogleAuth était initialisé avec un mauvais `clientId` (le project number au lieu du Web Client ID).

### Corrections effectuées

1. **Suppression de la mauvaise initialisation**
   - Retiré l'initialisation avec `firebaseConfig.appId.split(':')[1]`
   - Le plugin utilise maintenant le `serverClientId` de `capacitor.config.ts`

2. **Ajout de logs détaillés**
   - Logs à chaque étape de l'authentification
   - Vérification que le idToken est présent
   - Alerte utilisateur en cas d'erreur

3. **Initialisation correcte**
   - Appel de `GoogleAuth.initialize()` sans paramètres
   - La configuration vient automatiquement de `capacitor.config.ts`

## 🔍 Comment Vérifier les Logs

### Voir les logs en temps réel

```bash
cd /home/etud/Documents/Perso/Craftus
adb logcat | grep -i "firebase\|google\|craftus"
```

### Logs attendus lors d'une authentification réussie

```
[Firebase] GoogleAuth initialisé pour plateforme native
[Firebase] Authentification Google native (Android/iOS)
[Firebase] Appel de GoogleAuth.signIn()...
[Firebase] GoogleAuth.signIn() réussi: {email: "user@example.com", name: "User Name", hasIdToken: true}
[Firebase] Credential créé, connexion à Firebase...
[Firebase] Authentification Firebase réussie: user@example.com
```

### Si l'authentification échoue

Vous verrez :
- Les détails de l'erreur dans la console
- Une alerte sur l'application avec le message d'erreur
- Les logs d'erreur complets dans logcat

## 🧪 Test de l'Authentification

1. **Lancez l'application** sur l'émulateur Pixel 9
2. **Cliquez sur "Se connecter avec Google"**
3. **Observez** :
   - ✅ Popup Google native apparaît
   - ✅ Sélectionnez votre compte
   - ✅ L'authentification devrait fonctionner
   - ✅ Vous devriez être redirigé vers l'application principale

## 📊 Vérifications de Configuration

### 1. Vérifier capacitor.config.ts

```typescript
plugins: {
  GoogleAuth: {
    scopes: ['profile', 'email'],
    serverClientId: '397850525521-jn28irio01k8kc57dbncuslnb8qi7tq3.apps.googleusercontent.com',
    forceCodeForRefreshToken: true,
  }
}
```

✅ Le `serverClientId` doit être votre **Web Client ID OAuth** (format `xxxxx.apps.googleusercontent.com`)

### 2. Vérifier google-services.json

```bash
cat android/app/google-services.json | grep client_id
```

Devrait afficher plusieurs client_id incluant celui configuré dans capacitor.config.ts.

### 3. Vérifier les SHA-1 dans Firebase

Firebase Console → Paramètres → Empreintes de certificat :
- ✅ SHA-1 Debug : `87:42:27:AE:B5:69:CB:5A:3C:38:F8:1E:B6:40:90:74:0E:89:F5:97`
- ✅ SHA-1 Release : `92:74:3E:78:87:38:9C:91:61:20:65:60:41:AD:24:C3:61:B7:A6:C4`

## 🔧 Si ça ne marche toujours pas

### Erreur: "Developer error" ou "Error 10"

**Cause** : Le `serverClientId` ne correspond pas ou les SHA-1 sont incorrects.

**Solution** :
1. Vérifiez que le Web Client ID dans `capacitor.config.ts` est correct
2. Vérifiez que les SHA-1 sont bien dans Firebase Console
3. Re-téléchargez `google-services.json` et remplacez-le
4. Rebuild : `npm run build && npx cap sync && cd android && ./gradlew assembleDebug`

### Erreur: "Aucun ID token reçu de Google"

**Cause** : L'authentification Google ne renvoie pas de token.

**Solution** :
1. Vérifiez que Google Sign-In est activé dans Firebase Console
2. Vérifiez que l'app Android est bien enregistrée dans Firebase
3. Vérifiez les logs avec `adb logcat`

### L'application reste sur la page de connexion

**Cause** : L'authentification se fait mais Firebase ne détecte pas l'utilisateur.

**Solution** :
1. Vérifiez les logs : `adb logcat | grep Firebase`
2. Regardez si une erreur apparaît après "GoogleAuth.signIn() réussi"
3. Vérifiez que `onAuthStateChanged` est bien appelé dans `App.jsx`

## 📱 Commandes Utiles

### Réinstaller rapidement l'application

```bash
cd /home/etud/Documents/Perso/Craftus
npm run build && npx cap sync
cd android && ./gradlew assembleDebug && cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.craftus.app/.MainActivity
```

### Voir les logs en continu

```bash
adb logcat -c  # Nettoyer les logs
adb logcat | grep -i "firebase\|google"
```

### Forcer l'arrêt de l'application

```bash
adb shell am force-stop com.craftus.app
```

## ✨ Ce qui a changé dans le code

### Avant (src/lib/firebase.js)

```javascript
// ❌ MAUVAIS - utilisait le project number
GoogleAuth.initialize({
  clientId: firebaseConfig.appId.split(':')[1],
  scopes: ['profile', 'email'],
});
```

### Après (src/lib/firebase.js)

```javascript
// ✅ BON - utilise la config de capacitor.config.ts
GoogleAuth.initialize();

// Avec logs détaillés et vérifications
const googleUser = await GoogleAuth.signIn();
if (!googleUser.authentication?.idToken) {
  throw new Error('Aucun ID token reçu de Google');
}
```

---

## 🎯 Résumé

**Problème** : Mauvaise initialisation du clientId  
**Solution** : Utiliser la configuration de capacitor.config.ts  
**Résultat attendu** : Authentification Google fonctionnelle ✨

**En cas de problème** : Consultez les logs avec `adb logcat | grep Firebase`

