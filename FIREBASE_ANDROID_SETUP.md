# Configuration Firebase pour Android - Craftus

## 📋 Étapes pour obtenir google-services.json

1. **Allez sur Firebase Console** : https://console.firebase.google.com

2. **Sélectionnez votre projet** (celui utilisé actuellement pour Craftus)

3. **Ajoutez une application Android** :
   - Cliquez sur l'icône Android ou "Ajouter une application"
   - Package name : `com.craftus.app`
   - App nickname (optionnel) : `Craftus Android`
   - Debug signing certificate SHA-1 : laissez vide pour l'instant

4. **Téléchargez google-services.json** :
   - Firebase va générer le fichier
   - Téléchargez-le

5. **Placez le fichier** :
   - Copiez `google-services.json` dans : `android/app/google-services.json`
   - Remplacez le fichier template

## 🔐 Obtenir le SHA-1 (pour Google Sign-In)

Si vous utilisez Google Sign-In (comme dans votre app), vous devrez ajouter le SHA-1 :

```bash
# Pour le keystore de debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Pour votre keystore de release
keytool -list -v -keystore android/app/craftus-release-key.keystore -alias craftus-key -storepass craftus2025
```

Copiez le SHA-1 et ajoutez-le dans Firebase Console :
- Paramètres du projet > Vos applications > Craftus Android
- Ajoutez le SHA-1 dans "Empreintes de certificat"

## ✅ Vérification

Après avoir placé le fichier, vérifiez qu'il est bien à cet emplacement :
```
android/app/google-services.json
```

Le fichier devrait contenir votre vrai project_id et api_key (pas les placeholders du template).

