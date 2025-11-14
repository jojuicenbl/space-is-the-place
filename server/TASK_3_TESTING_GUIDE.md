# Tâche 3 - Guide de Test Manuel

## Prérequis

Avant de commencer les tests, assurez-vous que :

1. Les variables d'environnement sont configurées dans `.env` :
   ```bash
   # Demo mode (token app)
   DISCOGS_TOKEN=your_app_token
   DISCOGS_APP_DEMO_USERNAME=your_demo_username

   # OAuth (pour user mode)
   DISCOGS_CONSUMER_KEY=your_consumer_key
   DISCOGS_CONSUMER_SECRET=your_consumer_secret
   DISCOGS_USER_AGENT=SpaceIsThePlace/1.0
   ```

2. Le serveur est démarré :
   ```bash
   cd server
   npm run dev
   ```

3. Vous avez un outil pour tester les APIs (curl, Postman, Insomnia, ou simplement votre navigateur)

---

## Test 1 : Mode Demo (sans utilisateur connecté)

### Objectif
Vérifier que le mode demo fonctionne et retourne la collection de démo

### Étapes

1. **Requête GET vers `/api/collection?mode=demo`**
   ```bash
   curl "http://localhost:3000/api/collection?mode=demo&page=1&perPage=10"
   ```

2. **Vérifications attendues :**
   - Status HTTP : `200 OK`
   - Réponse JSON avec :
     ```json
     {
       "mode": "demo",
       "discogsUsername": "your_demo_username",
       "page": 1,
       "perPage": 10,
       "totalItems": <number>,
       "totalPages": <number>,
       "releases": [...],
       "folders": [...]
     }
     ```
   - `mode` doit être `"demo"`
   - `discogsUsername` doit correspondre à `DISCOGS_APP_DEMO_USERNAME`
   - `releases` doit contenir des items de la collection démo

3. **Test de pagination :**
   ```bash
   curl "http://localhost:3000/api/collection?mode=demo&page=2&perPage=10"
   ```
   - Vérifier que `page` est bien `2`
   - Vérifier que les releases sont différents de la page 1

4. **Test de recherche (mode demo) :**
   ```bash
   curl "http://localhost:3000/api/collection?mode=demo&search=jazz"
   ```
   - Vérifier que seuls les releases contenant "jazz" sont retournés

---

## Test 2 : Mode User sans compte Discogs lié (unlinked)

### Objectif
Vérifier que le mode user sans authentification Discogs retourne un état "unlinked"

### Étapes

1. **S'assurer qu'aucun utilisateur n'a lié Discogs**
   - Par défaut, l'utilisateur démo n'a pas de compte Discogs lié
   - Vérifier via :
     ```bash
     curl "http://localhost:3000/api/me"
     ```
   - Réponse attendue :
     ```json
     {
       "id": "...",
       "email": "demo@spaceistheplace.local",
       "discogs": {
         "isLinked": false,
         "username": null
       }
     }
     ```

2. **Requête GET vers `/api/collection?mode=user`**
   ```bash
   curl "http://localhost:3000/api/collection?mode=user"
   ```

3. **Vérifications attendues :**
   - Status HTTP : `200 OK`
   - Réponse JSON avec :
     ```json
     {
       "mode": "unlinked",
       "discogsUsername": null,
       "page": 1,
       "perPage": 50,
       "totalItems": 0,
       "totalPages": 0,
       "releases": [],
       "folders": []
     }
     ```
   - `mode` doit être `"unlinked"`
   - `releases` et `folders` doivent être vides

---

## Test 3 : Mode User avec compte Discogs lié (authentification OAuth)

### Objectif
Tester le flux complet OAuth et vérifier que la collection utilisateur est récupérée

### Étapes

1. **Démarrer le flux OAuth**
   ```bash
   curl "http://localhost:3000/api/auth/discogs/request?callbackUrl=http://localhost:3000/api/auth/discogs/callback"
   ```

   - Réponse attendue :
     ```json
     {
       "success": true,
       "authorizeUrl": "https://www.discogs.com/oauth/authorize?oauth_token=..."
     }
     ```

2. **Autoriser l'application**
   - Ouvrir l'URL `authorizeUrl` dans un navigateur
   - Se connecter à Discogs et autoriser l'application
   - Vous serez redirigé vers le callback avec `oauth_token` et `oauth_verifier`

3. **Compléter le callback**
   - Le callback devrait se faire automatiquement
   - Vérifier les logs du serveur pour :
     ```
     ✓ Tokens stored for user: <votre_username_discogs>
     ```

4. **Vérifier que le compte est lié**
   ```bash
   curl "http://localhost:3000/api/me"
   ```
   - Réponse attendue :
     ```json
     {
       "id": "...",
       "email": "demo@spaceistheplace.local",
       "discogs": {
         "isLinked": true,
         "username": "votre_username_discogs"
       }
     }
     ```

5. **Récupérer la collection utilisateur**
   ```bash
   curl "http://localhost:3000/api/collection?mode=user"
   ```

6. **Vérifications attendues :**
   - Status HTTP : `200 OK`
   - Réponse JSON avec :
     - `mode` : `"user"` (si collection non vide) ou `"empty"` (si collection vide)
     - `discogsUsername` : votre username Discogs
     - `releases` : les releases de VOTRE collection Discogs
     - `folders` : vos folders Discogs

7. **Test de pagination (mode user) :**
   ```bash
   curl "http://localhost:3000/api/collection?mode=user&page=2"
   ```

---

## Test 4 : Mode User avec collection vide

### Objectif
Vérifier que le mode "empty" est bien retourné quand l'utilisateur a un compte lié mais une collection vide

### Étapes

1. **Utiliser un compte Discogs avec collection vide**
   - Créer un nouveau compte Discogs temporaire sans collection
   - Suivre les étapes du Test 3 pour lier ce compte

2. **Requête GET vers `/api/collection?mode=user`**
   ```bash
   curl "http://localhost:3000/api/collection?mode=user"
   ```

3. **Vérifications attendues :**
   - Status HTTP : `200 OK`
   - Réponse JSON avec :
     ```json
     {
       "mode": "empty",
       "discogsUsername": "votre_username",
       "page": 1,
       "perPage": 50,
       "totalItems": 0,
       "totalPages": 0,
       "releases": [],
       "folders": [...]
     }
     ```
   - `mode` doit être `"empty"`
   - `releases` doit être vide
   - `folders` peut contenir des folders même si vides

---

## Test 5 : Vérifier que le cache est utilisé

### Objectif
S'assurer que les clés de cache sont propres par mode/utilisateur et que le cache fonctionne

### Étapes

1. **Test cache mode demo :**
   ```bash
   # Première requête (sans cache)
   time curl "http://localhost:3000/api/collection?mode=demo&search=jazz"
   # Noter le temps de réponse

   # Deuxième requête (avec cache)
   time curl "http://localhost:3000/api/collection?mode=demo&search=jazz"
   # Le temps doit être significativement plus court
   ```

2. **Vérifier les logs du serveur :**
   - Première requête : doit afficher "Search initiated - loading full collection for demo mode..."
   - Deuxième requête : ne doit PAS afficher ce message (cache hit)

3. **Test cache mode user :**
   - Répéter les mêmes étapes avec `mode=user`
   - Vérifier que les deux caches (demo et user) sont séparés :
     ```bash
     # Cache demo
     curl "http://localhost:3000/api/collection?mode=demo&search=jazz"

     # Cache user (ne doit PAS utiliser le cache demo)
     curl "http://localhost:3000/api/collection?mode=user&search=jazz"
     ```
   - Les deux requêtes doivent déclencher un fetch initial séparé

4. **Vérifier les clés de cache dans les logs :**
   - Demo : `discogs:demo:collection:folder:0`
   - User : `discogs:user:<userId>:collection:folder:0`

---

## Test 6 : Vérification de la sécurité

### Objectif
S'assurer qu'aucun token/secret n'est exposé

### Étapes

1. **Vérifier la réponse de `/api/me` :**
   ```bash
   curl "http://localhost:3000/api/me"
   ```
   - **NE DOIT PAS** contenir :
     - `accessToken`
     - `accessTokenSecret`
     - `consumerKey`
     - `consumerSecret`

2. **Vérifier la réponse de `/api/collection?mode=user` :**
   ```bash
   curl "http://localhost:3000/api/collection?mode=user"
   ```
   - **NE DOIT PAS** contenir de tokens OAuth

3. **Vérifier les logs du serveur :**
   - Les logs **NE DOIVENT PAS** afficher :
     - Les tokens complets (accessToken, accessTokenSecret)
     - Les secrets (consumerSecret)

---

## Test 7 : Tests de rétrocompatibilité

### Objectif
S'assurer que les anciens endpoints continuent de fonctionner

### Étapes

1. **Test de l'ancien endpoint `/api/folders` :**
   ```bash
   curl "http://localhost:3000/api/folders"
   ```
   - Doit rediriger vers `/api/collection/folders` (status 302)

2. **Test de l'ancien endpoint `/api/collection/search` :**
   ```bash
   curl "http://localhost:3000/api/collection/search?q=jazz"
   ```
   - Doit fonctionner en mode demo
   - Doit retourner les résultats de recherche

---

## Résumé des Résultats Attendus

| Cas de test | Mode retourné | discogsUsername | releases |
|-------------|---------------|-----------------|----------|
| Demo mode | `demo` | Username démo | Collection démo |
| User non lié | `unlinked` | `null` | `[]` |
| User lié, collection vide | `empty` | Username user | `[]` |
| User lié, collection non vide | `user` | Username user | Collection user |

---

## Dépannage

### Problème : "DISCOGS_TOKEN not configured for demo mode"
- Vérifier que `DISCOGS_TOKEN` et `DISCOGS_APP_DEMO_USERNAME` sont définis dans `.env`

### Problème : "OAuth credentials not configured"
- Vérifier que `DISCOGS_CONSUMER_KEY` et `DISCOGS_CONSUMER_SECRET` sont définis dans `.env`

### Problème : "Failed to get user identity"
- Vérifier que le flux OAuth a bien été complété
- Vérifier les tokens dans les logs (sans les afficher en entier)

### Problème : Cache ne fonctionne pas
- Vérifier que les requêtes successives utilisent bien les mêmes paramètres
- Vérifier le TTL du cache (15 minutes par défaut)
- Relancer le serveur pour réinitialiser le cache

---

## Notes Importantes

1. **Aucun code frontend ne doit être modifié** dans cette tâche
2. **Les tokens ne doivent jamais être loggés** en entier (seulement les 4 premiers caractères si nécessaire)
3. **Le User-Agent custom** doit être utilisé pour tous les appels Discogs
4. **Les clés de cache** doivent être différentes pour demo/user/userId

---

## Prochaines Étapes (Tâche 4)

Une fois cette tâche validée, la Tâche 4 consistera à :
- Adapter le frontend pour utiliser le nouveau endpoint `/api/collection?mode=...`
- Implémenter le switch demo/user dans l'UI
- Gérer les états unlinked/empty dans l'interface
