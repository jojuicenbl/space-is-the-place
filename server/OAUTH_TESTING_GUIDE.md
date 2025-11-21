# Guide de Test - OAuth 1.0a Discogs

Ce guide décrit comment tester l'infrastructure OAuth implémentée dans cette tâche.

## Configuration Préalable

### 1. Obtenir les Credentials OAuth Discogs

1. Allez sur https://www.discogs.com/settings/developers
2. Créez une nouvelle application OAuth
3. Notez les valeurs suivantes :
   - **Consumer Key**
   - **Consumer Secret**

### 2. Configurer les Variables d'Environnement

Éditez le fichier `server/.env` et remplacez les valeurs placeholder :

```env
DISCOGS_CONSUMER_KEY=votre_consumer_key_ici
DISCOGS_CONSUMER_SECRET=votre_consumer_secret_ici
DISCOGS_USER_AGENT=SpaceIsThePlace/1.0
```

### 3. Démarrer le Serveur

```bash
cd server
npm install
npm run dev
```

Le serveur devrait démarrer sur http://localhost:3000

## Tests Manuels

### Test 1 : Vérifier le Statut OAuth

Vérifiez que OAuth est correctement configuré :

```bash
curl http://localhost:3000/api/auth/discogs/status
```

**Réponse attendue :**
```json
{
  "configured": true,
  "activeStates": 0,
  "message": "OAuth is configured and ready"
}
```

Si `configured` est `false`, vérifiez vos variables d'environnement.

---

### Test 2 : Initier le Flow OAuth (Request Token)

Démarrez le flow OAuth pour obtenir l'URL d'autorisation :

```bash
curl -X POST http://localhost:3000/api/auth/discogs/request \
  -H "Content-Type: application/json"
```

**Réponse attendue :**
```json
{
  "authorizeUrl": "https://www.discogs.com/oauth/authorize?oauth_token=...",
  "stateId": "abc123..."
}
```

**Note :** Sauvegardez le `stateId` pour les logs (non utilisé dans ce flow simplifié mais utile pour déboguer).

---

### Test 3 : Autoriser l'Application sur Discogs

1. Copiez l'URL `authorizeUrl` retournée dans l'étape précédente
2. Ouvrez-la dans un navigateur
3. Connectez-vous à Discogs (si nécessaire)
4. Cliquez sur **"Authorize"** pour autoriser l'application

Discogs va rediriger vers :
```
http://localhost:3000/api/auth/discogs/callback?oauth_token=XXX&oauth_verifier=YYY
```

---

### Test 4 : Compléter le Flow OAuth (Callback)

Le navigateur va automatiquement appeler le callback. Vous devriez voir une réponse JSON :

**Réponse attendue :**
```json
{
  "success": true,
  "discogsIdentity": {
    "username": "votre_username",
    "id": 12345678,
    "resource_url": "https://api.discogs.com/users/votre_username"
  },
  "message": "OAuth flow completed successfully"
}
```

---

## Test Complet avec un Outil HTTP (Alternative)

Vous pouvez aussi tester avec Postman, Insomnia, ou un script :

### Étape 1 : Request Token
```bash
RESPONSE=$(curl -X POST http://localhost:3000/api/auth/discogs/request)
AUTHORIZE_URL=$(echo $RESPONSE | jq -r '.authorizeUrl')
echo "Ouvrez cette URL : $AUTHORIZE_URL"
```

### Étape 2 : Autoriser manuellement dans le navigateur

### Étape 3 : Le callback s'exécute automatiquement

---

## Tests de Cas d'Erreur

### Test : Callback sans Paramètres
```bash
curl "http://localhost:3000/api/auth/discogs/callback"
```

**Réponse attendue :**
```json
{
  "error": "Missing OAuth parameters",
  "message": "oauth_token and oauth_verifier are required"
}
```

### Test : Callback avec Token Invalide
```bash
curl "http://localhost:3000/api/auth/discogs/callback?oauth_token=invalid&oauth_verifier=invalid"
```

**Réponse attendue :**
```json
{
  "error": "Invalid or expired OAuth state",
  "message": "OAuth token not found or expired. Please restart the authorization flow."
}
```

---

## Vérifications de Sécurité

### ✅ Secrets Non Exposés
Vérifiez que les logs ne contiennent jamais :
- `DISCOGS_CONSUMER_SECRET`
- `oauth_token_secret`
- `access_token_secret`

Recherchez dans les logs :
```bash
# Démarrez le serveur et faites un flow complet, puis :
grep -i "secret" server.log  # Ne devrait rien retourner
```

### ✅ User-Agent Présent
Toutes les requêtes vers Discogs doivent inclure le User-Agent custom.

### ✅ État Temporaire Expiré
Après 15 minutes, l'état OAuth devrait être nettoyé automatiquement.

---

## Résumé des Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/discogs/request` | Initie le flow OAuth et retourne l'URL d'autorisation |
| GET | `/api/auth/discogs/callback` | Callback après autorisation, complète le flow |
| GET | `/api/auth/discogs/status` | Vérifie la configuration OAuth |

---

## Prochaines Étapes (Tâche 2)

Cette implémentation est **autonome et fonctionnelle**, mais ne persiste pas encore les données utilisateur :
- Les tokens d'accès ne sont pas sauvegardés (TODO dans le code)
- Aucun modèle User n'est impacté
- Le DiscogsClient actuel continue de fonctionner normalement

La Tâche 2 intégrera cette infrastructure dans le système d'utilisateurs.

---

## Dépannage

### Erreur : "OAuth credentials not configured"
- Vérifiez que `DISCOGS_CONSUMER_KEY` et `DISCOGS_CONSUMER_SECRET` sont définis dans `.env`
- Redémarrez le serveur après modification

### Erreur : "Failed to get request token: 401"
- Vérifiez que vos credentials OAuth sont valides
- Vérifiez que l'application est activée sur Discogs

### Erreur : "Invalid or expired OAuth state"
- L'état OAuth expire après 15 minutes
- Recommencez le flow depuis l'étape 1

---

## Architecture

```
Client (Browser/curl)
  │
  ├──[POST]──> /api/auth/discogs/request
  │              │
  │              └──> DiscogsOAuthClient.getRequestToken()
  │                     │
  │                     └──> Discogs API (/oauth/request_token)
  │
  ├──[USER]──> Ouvre authorizeUrl dans navigateur
  │              │
  │              └──> Discogs.com (autorisation)
  │
  └──[GET]───> /api/auth/discogs/callback?oauth_token=X&oauth_verifier=Y
                 │
                 ├──> DiscogsOAuthClient.getAccessToken()
                 │      └──> Discogs API (/oauth/access_token)
                 │
                 └──> DiscogsOAuthClient.getIdentity()
                        └──> Discogs API (/oauth/identity)
```

---

Bon test ! 🚀
