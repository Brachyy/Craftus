# 🔧 Configuration Google Sign-In depuis Firebase Console UNIQUEMENT

## Problème actuel
```
Invalid audience value: server:client_id:Your Web Client Key
```

Le Web Client ID n'est pas correctement configuré.

## ✅ Solution : Tout depuis Firebase Console

### Étape 1 : Ouvrir les paramètres du projet

1. Allez sur Firebase Console : https://console.firebase.google.com/
2. Sélectionnez votre projet : **craftus-69b09**
3. Cliquez sur l'icône **⚙️ (Paramètres)** en haut à gauche → **Project settings**

### Étape 2 : Accéder à Google Cloud Platform

Dans les **Project settings**, vous verrez en haut un lien :
- **"Google Cloud Platform (GCP) Resource Location"**
- Ou un bouton **"Manage service accounts"** / **"Manage credentials"**

**OU** cliquez directement sur ce lien (il vous connectera automatiquement) :
```
https://console.cloud.google.com/apis/credentials?project=craftus-69b09
```

### Étape 3 : Configurer Authentication Google

#### Option A : Via Firebase Authentication (plus simple)

1. Dans Firebase Console, allez dans **"Authentication"** (menu gauche)
2. Cliquez sur l'onglet **"Sign-in method"**
3. Cliquez sur **"Google"**
4. Vous devriez voir :
   - **Web SDK configuration**
   - **Web Client ID** : vérifiez qu'il affiche `397850525521-jn28irio01k8kc57dbncuslnb8qi7tq3.apps.googleusercontent.com`
   - **Web Client Secret**

5. Si vous voyez "Your Web Client Key" ou un champ vide, cliquez sur **"Web SDK configuration"** pour le configurer

#### Option B : Créer un nouveau Web Client ID

Si le Web Client ID n'existe pas ou est mal configuré :

1. Dans Firebase Console → **Authentication** → **Sign-in method** → **Google**
2. Cliquez sur le bouton **"Edit"** (icône crayon)
3. Dans la section **"Web SDK configuration"**, vous verrez un menu déroulant
4. Sélectionnez ou créez un nouveau Web Client ID
5. **Sauvegardez**

### Étape 4 : Vérifier les SHA-1

1. Dans Firebase Console → **Project Settings** (⚙️)
2. Descendez jusqu'à **"Your apps"**
3. Cliquez sur votre application Android (com.craftus.app)
4. Vérifiez que vous avez bien **2 SHA-1 fingerprints** :
   ```
   Debug:   92:74:3E:78:87:38:9C:91:61:20:65:60:41:AD:24:C3:61:B7:A6:C4
   Release: 87:42:27:AE:B5:69:CB:5A:3C:38:F8:1E:B6:40:90:74:0E:89:F5:97
   ```

5. Si l'un manque, cliquez sur **"Add fingerprint"** et ajoutez-le

### Étape 5 : Re-télécharger google-services.json

**APRÈS avoir ajouté/vérifié tous les SHA-1** :

1. Dans **Project Settings** → **Your apps** → Android app
2. Cliquez sur le bouton **"Download google-services.json"**
3. Remplacez le fichier dans votre projet

### Étape 6 : Rebuild

Revenez sur le terminal et je vous aiderai à rebuild.

## 🎯 Checklist complète

- [ ] Google Sign-In est activé dans Authentication
- [ ] Web Client ID est configuré (pas "Your Web Client Key")
- [ ] Les 2 SHA-1 (debug + release) sont ajoutés
- [ ] google-services.json est re-téléchargé et remplacé
- [ ] Application rebuild et réinstallée

## 💡 Note importante

Firebase Console ET Google Cloud Console sont le **même compte** et le **même projet**. Le lien depuis Firebase vous connecte automatiquement à Google Cloud Console sans avoir besoin de créer un nouveau compte.

