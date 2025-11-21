# Tâche 2 - Guide de Test Manuel

## Vue d'ensemble

Cette tâche implémente le modèle User, l'intégration complète du callback OAuth Discogs, et l'endpoint `/api/me` pour exposer les informations utilisateur au frontend.

## Modifications apportées

### Nouveaux fichiers créés

1. **`server/types/user.ts`**
   - Interface `DiscogsAuth` : Structure pour stocker les credentials OAuth Discogs
   - Interface `User` : Modèle utilisateur complet
   - Interface `PublicUserData` : Données publiques sécurisées (sans tokens)

2. **`server/services/userService.ts`**
   - Service singleton pour gérer les utilisateurs
   - Stockage en mémoire (Map) - facilement remplaçable par une DB réelle
   - Utilisateur démo créé par défaut
   - Méthodes : `updateDiscogsAuth()`, `removeDiscogsAuth()`, `toPublicData()`

3. **`server/routes/user.ts`**
   - Endpoint `GET /api/me` : Retourne les données publiques de l'utilisateur
   - Endpoint `POST /api/me/discogs/unlink` : Déconnecte le compte Discogs
   - **SÉCURITÉ** : Aucun token n'est jamais exposé

### Fichiers modifiés

4. **`server/routes/authDiscogs.ts`**
   - Import du `userService`
   - Vérification de l'utilisateur dans `/request`
   - Callback OAuth complet avec enregistrement des tokens
   - Redirection vers le frontend avec paramètre `discogs_connected=1`

5. **`server/server.ts`**
   - Import et montage du router `userRouter` sur `/api`

## Tests manuels

### Prérequis

```bash
# Assurez-vous d'avoir les credentials OAuth dans server/.env
DISCOGS_CONSUMER_KEY=votre_consumer_key
DISCOGS_CONSUMER_SECRET=votre_consumer_secret
VITE_CLIENT_URL=http://localhost:5173
```

### Test 1 : Vérifier le statut initial de l'utilisateur

```bash
# Démarrer le serveur
cd server
npm run dev

# Dans un autre terminal, appeler /api/me
curl http://localhost:3000/api/me
```

**Résultat attendu :**
```json
{
  "id": "uuid-généré",
  "email": "demo@spaceistheplace.local",
  "discogs": {
    "isLinked": false,
    "username": null
  }
}
```

✅ **Vérification** :
- L'endpoint retourne un JSON valide
- `isLinked` est `false` car aucun compte Discogs n'est lié
- Aucun token n'est visible dans la réponse

---

### Test 2 : Lier un compte Discogs via OAuth

```bash
# Étape 1 : Initier le flux OAuth
curl -X POST http://localhost:3000/api/auth/discogs/request

# Résultat : Vous obtenez une authorizeUrl et un stateId
{
  "authorizeUrl": "https://www.discogs.com/oauth/authorize?oauth_token=...",
  "stateId": "..."
}
```

**Étape 2 : Autorisation manuelle**
1. Copiez l'`authorizeUrl` dans votre navigateur
2. Connectez-vous à Discogs et autorisez l'application
3. Vous serez redirigé vers : `http://localhost:5173/collection?discogs_connected=1`

**Étape 3 : Vérifier l'enregistrement**
```bash
# Appeler à nouveau /api/me
curl http://localhost:3000/api/me
```

**Résultat attendu :**
```json
{
  "id": "uuid-généré",
  "email": "demo@spaceistheplace.local",
  "discogs": {
    "isLinked": true,
    "username": "votre-username-discogs"
  }
}
```

✅ **Vérifications critiques** :
- `isLinked` est maintenant `true`
- `username` contient votre username Discogs
- **SÉCURITÉ** : Les tokens (`accessToken`, `accessTokenSecret`) ne sont **JAMAIS** visibles dans la réponse
- **SÉCURITÉ** : Les credentials (`consumerKey`, `consumerSecret`) ne sont **JAMAIS** exposés

---

### Test 3 : Vérifier que les tokens sont bien stockés

```bash
# Examiner les logs du serveur (pas de logs de tokens sensibles !)
# Vérifier que le callback a bien stocké les tokens

# Dans le code, vous pouvez ajouter temporairement ce log dans authDiscogs.ts
# ATTENTION : À NE PAS COMMITTER !
console.log('✓ Tokens stored for user:', discogsIdentity.username)
```

✅ **Vérification** :
- Les logs ne doivent **JAMAIS** afficher les tokens en clair
- Seul le username peut être loggé pour debug

---

### Test 4 : Délier le compte Discogs

```bash
# Appeler l'endpoint de déconnexion
curl -X POST http://localhost:3000/api/me/discogs/unlink
```

**Résultat attendu :**
```json
{
  "success": true,
  "user": {
    "id": "uuid-généré",
    "email": "demo@spaceistheplace.local",
    "discogs": {
      "isLinked": false,
      "username": null
    }
  },
  "message": "Discogs account unlinked successfully"
}
```

✅ **Vérification** :
- `isLinked` est redevenu `false`
- `username` est `null`
- Les tokens ont été supprimés de l'utilisateur

---

### Test 5 : Redirection après callback OAuth

**Test avec navigateur** :
1. Ouvrir http://localhost:5173 (frontend)
2. Initier le flux OAuth depuis le frontend (si implémenté)
3. Après autorisation Discogs, vérifier la redirection vers :
   ```
   http://localhost:5173/collection?discogs_connected=1
   ```

✅ **Vérification** :
- La redirection fonctionne correctement
- Le paramètre `discogs_connected=1` est présent
- Le frontend peut appeler `/api/me` pour récupérer les données utilisateur

---

## Vérifications de sécurité

### ❌ Ces données NE DOIVENT JAMAIS être exposées :

```typescript
// INTERDIT de retourner ça dans une API !
{
  "accessToken": "...",           // ❌
  "accessTokenSecret": "...",     // ❌
  "consumerKey": "...",           // ❌
  "consumerSecret": "..."         // ❌
}
```

### ✅ Seules ces données peuvent être exposées :

```typescript
{
  "id": "...",                    // ✅
  "email": "...",                 // ✅
  "discogs": {
    "isLinked": true/false,       // ✅
    "username": "..."             // ✅
  }
}
```

---

## Tests automatisés recommandés (Tâche future)

```typescript
// Tests à implémenter dans server/__tests__/routes/user.test.ts

describe('GET /api/me', () => {
  it('should return public user data without tokens', async () => {
    const res = await request(app).get('/api/me')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('discogs')
    expect(res.body).not.toHaveProperty('accessToken')
  })
})

describe('OAuth callback', () => {
  it('should store tokens without exposing them', async () => {
    // Mock OAuth flow
    // Verify tokens are stored but not returned
  })
})
```

---

## Prochaines étapes (Tâche 3)

Une fois cette Tâche 2 validée :
- ✅ Le User model est en place
- ✅ Les tokens OAuth sont stockés de manière sécurisée
- ✅ L'endpoint `/api/me` fournit les données au frontend
- 🔜 Le frontend peut maintenant utiliser ces données pour afficher l'état de connexion
- 🔜 La collection peut être chargée avec les tokens utilisateur (au lieu du token démo)

---

## Troubleshooting

### Erreur "No user found"
- **Cause** : Le userService n'a pas créé l'utilisateur par défaut
- **Solution** : Redémarrer le serveur (`npm run dev`)

### Redirection ne fonctionne pas
- **Cause** : Variable `VITE_CLIENT_URL` non définie dans `.env`
- **Solution** : Ajouter `VITE_CLIENT_URL=http://localhost:5173` dans `server/.env`

### Tokens non stockés après callback
- **Cause** : Erreur dans le flux OAuth ou userService
- **Solution** : Vérifier les logs du serveur pour les erreurs

---

## Notes importantes

1. **Stockage temporaire** : Les utilisateurs sont actuellement stockés en mémoire (Map). Lors d'un redémarrage du serveur, les données sont perdues. Pour la production, implémenter une vraie base de données (PostgreSQL, MongoDB, etc.).

2. **Authentification simplifiée** : Pour l'instant, on utilise un utilisateur par défaut (`getDefaultUser()`). Dans la Tâche 3+, il faudra implémenter un vrai système de sessions/JWT pour identifier l'utilisateur courant via `req.user`.

3. **Sécurité** : Les tokens OAuth ne sont JAMAIS exposés dans les API responses. Seules les données publiques (`PublicUserData`) sont retournées.

4. **Extension future** : Le code est structuré pour faciliter l'ajout d'une vraie DB :
   ```typescript
   // Remplacer Map par Prisma/TypeORM/Mongoose
   class UserService {
     async getUserById(id: string) {
       return await prisma.user.findUnique({ where: { id } })
     }
   }
   ```
