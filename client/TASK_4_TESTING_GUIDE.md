# Tâche 4 - Guide de Test Manuel
## Frontend : Intégration complète du mode utilisateur Discogs

Ce guide décrit comment tester manuellement toutes les fonctionnalités implémentées dans la Tâche 4.

---

## Pré-requis

1. **Backend démarré** : `cd server && npm run dev`
2. **Frontend démarré** : `cd client && npm run dev`
3. **Base de données** : MongoDB en cours d'exécution
4. **Variables d'environnement** : Fichiers `.env` correctement configurés

---

## Tests à Effectuer

### 1. Test du chargement de l'état utilisateur au démarrage

**Objectif** : Vérifier que `/api/me` est appelé au démarrage de l'application.

**Étapes** :
1. Ouvrir les DevTools (F12) et aller dans l'onglet Network
2. Rafraîchir la page d'accueil (`http://localhost:5173`)
3. Vérifier qu'une requête GET `/api/me` est effectuée
4. Observer la réponse :
   - Si l'utilisateur est connecté : `{ user: {...}, discogsAuth?: {...} }`
   - Si non connecté : erreur 401 (c'est normal)

**Résultat attendu** :
- Le userStore charge correctement l'état utilisateur
- Si Discogs est lié : `userStore.discogsIsLinked = true`
- Si Discogs n'est pas lié : `userStore.discogsIsLinked = false`

---

### 2. Test de la WelcomePage avec boutons Discogs

**Objectif** : Vérifier que la WelcomePage affiche les bons boutons selon l'état de connexion.

**Scénario A : Utilisateur non connecté à Discogs**
1. Aller sur `http://localhost:5173`
2. Vérifier la présence de :
   - Bouton "Connect Your Discogs Account" (activé)
   - Bouton "Explore the Demo Collection" (activé)
3. Cliquer sur "Connect Your Discogs Account"
4. Vérifier la redirection vers l'URL Discogs OAuth

**Scénario B : Utilisateur connecté à Discogs**
1. Se connecter à Discogs (compléter le flow OAuth)
2. Retourner sur `http://localhost:5173`
3. Vérifier la présence de :
   - Bouton "Discogs Connected" (désactivé)
   - Bouton "Explore the Demo Collection" (activé)
   - Bouton "View My Collection" (activé)

**Scénario C : Retour après connexion OAuth**
1. Compléter le flow OAuth Discogs
2. Vérifier qu'on est redirigé vers `/?discogs_connected=1`
3. Vérifier qu'un message de succès s'affiche brièvement
4. Vérifier que le paramètre `discogs_connected=1` est supprimé de l'URL

**Résultat attendu** :
- Les boutons s'affichent correctement selon l'état
- Le flow OAuth démarre correctement
- Le message de succès s'affiche après connexion

---

### 3. Test du toggle Demo / User dans CollectionView

**Objectif** : Vérifier que le toggle fonctionne et charge les bonnes collections.

**Scénario A : Utilisateur non connecté à Discogs**
1. Aller sur `/collection`
2. Vérifier la présence du toggle :
   - "My Collection" (désactivé, avec tooltip)
   - "Demo Collection" (actif)
3. Survoler "My Collection" et vérifier le tooltip : "Connect your Discogs account to enable this"
4. Vérifier qu'un bandeau bleu s'affiche : "You are exploring a demo collection. Connect your Discogs account"

**Scénario B : Utilisateur connecté à Discogs**
1. Se connecter à Discogs
2. Aller sur `/collection`
3. Vérifier que les deux boutons du toggle sont activés
4. Cliquer sur "My Collection"
5. Vérifier que :
   - La collection personnelle se charge (appel `/api/collection?mode=user`)
   - Le bandeau bleu n'est plus affiché
   - L'URL contient `?mode=user`
6. Cliquer sur "Demo Collection"
7. Vérifier que :
   - La collection demo se charge (appel `/api/collection?mode=demo`)
   - Le bandeau bleu s'affiche à nouveau
   - L'URL contient `?mode=demo`

**Résultat attendu** :
- Le toggle fonctionne correctement
- Les appels API incluent le paramètre `mode=demo` ou `mode=user`
- Le bandeau demo s'affiche uniquement en mode demo

---

### 4. Test des Empty States

**Objectif** : Vérifier que les bons messages s'affichent selon l'état de la collection.

**État A : Unlinked (mode=user sans compte Discogs lié)**
1. Se déconnecter de Discogs (ou utiliser un compte sans Discogs)
2. Aller sur `/collection?mode=user`
3. Vérifier l'affichage de :
   - Titre : "Connect Your Discogs Account"
   - Message : "To view your personal vinyl collection, you need to connect your Discogs account."
   - Bouton : "Connect to Discogs"
4. Cliquer sur le bouton et vérifier la redirection OAuth

**État B : Empty (mode=user avec compte Discogs lié mais collection vide)**
1. Se connecter avec un compte Discogs ayant 0 releases
2. Aller sur `/collection?mode=user`
3. Vérifier l'affichage de :
   - Titre : "Your Collection is Empty"
   - Message : "Start building your vinyl collection on Discogs to see it here."
   - Bouton : "Add Releases on Discogs" (lien vers Discogs)

**État C : Demo (mode=demo)**
1. Aller sur `/collection?mode=demo`
2. Vérifier que la collection demo s'affiche normalement
3. Vérifier la présence du bandeau : "You are exploring a demo collection."

**État D : Regular Empty (recherche sans résultats)**
1. Aller sur `/collection?mode=demo`
2. Effectuer une recherche ne retournant aucun résultat (ex: "xyzabc123")
3. Vérifier l'affichage de :
   - "No releases found"
   - "Try adjusting your search terms or filters."

**Résultat attendu** :
- Chaque état affiche le bon message et les bons boutons
- Les boutons fonctionnent correctement

---

### 5. Test de la persistance du mode

**Objectif** : Vérifier que le mode choisi persiste dans l'URL et le userStore.

**Étapes** :
1. Se connecter à Discogs
2. Aller sur `/collection` (mode demo par défaut)
3. Basculer sur "My Collection"
4. Vérifier que l'URL devient `/collection?mode=user`
5. Rafraîchir la page (F5)
6. Vérifier que :
   - Le mode reste "user"
   - La collection personnelle se charge
   - Le toggle affiche "My Collection" comme actif

**Résultat attendu** :
- Le mode persiste dans l'URL
- Au refresh, le mode est restauré correctement

---

### 6. Test de sécurité : pas de tokens exposés

**Objectif** : Vérifier qu'aucun token Discogs n'est exposé côté frontend.

**Étapes** :
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet Network
3. Effectuer plusieurs actions (connexion, toggle, recherche)
4. Inspecter toutes les requêtes et réponses
5. Vérifier que :
   - Aucun `oauth_token` ou `oauth_token_secret` n'apparaît
   - Les tokens ne sont jamais renvoyés par `/api/me` ou `/api/collection`

**Résultat attendu** :
- Aucun token Discogs n'est exposé dans le frontend
- Seul le `username` Discogs est visible

---

### 7. Test des appels API avec le paramètre mode

**Objectif** : Vérifier que tous les appels API incluent le paramètre `mode`.

**Étapes** :
1. Ouvrir les DevTools Network
2. Basculer entre Demo et My Collection
3. Pour chaque action (changement de page, recherche, tri, filtre), vérifier que :
   - `/api/collection` inclut `?mode=demo` ou `?mode=user`
   - `/api/collection/search` inclut `?mode=demo` ou `?mode=user`
4. Vérifier les réponses incluent :
   - `mode: 'demo' | 'user' | 'unlinked' | 'empty'`
   - `discogsUsername` (si applicable)

**Résultat attendu** :
- Tous les appels API incluent le mode
- Les réponses renvoient le mode et le username

---

## Tests Négatifs

### 1. Forcer le mode user sans compte Discogs
1. Aller sur `/collection?mode=user` sans être connecté à Discogs
2. Vérifier que l'état "unlinked" s'affiche

### 2. Désactiver le backend
1. Arrêter le serveur backend
2. Rafraîchir la page
3. Vérifier que l'app ne plante pas
4. Vérifier qu'un message d'erreur approprié s'affiche

### 3. Mauvais paramètre mode
1. Aller sur `/collection?mode=invalid`
2. Vérifier que l'app utilise le mode par défaut (demo)

---

## Checklist Finale

- [ ] `/api/me` est appelé au démarrage
- [ ] WelcomePage affiche les bons boutons selon l'état
- [ ] Bouton "Connect Your Discogs account" redirige vers Discogs OAuth
- [ ] Message de succès après connexion OAuth
- [ ] Toggle Demo/User fonctionne correctement
- [ ] Mode "My Collection" désactivé si pas de compte Discogs lié
- [ ] Bandeau demo s'affiche uniquement en mode demo
- [ ] Empty state "unlinked" s'affiche correctement
- [ ] Empty state "empty" s'affiche correctement
- [ ] Empty state "demo" fonctionne
- [ ] Empty state "recherche sans résultat" fonctionne
- [ ] Mode persiste dans l'URL et au refresh
- [ ] Aucun token Discogs exposé dans le frontend
- [ ] Tous les appels API incluent le paramètre `mode`
- [ ] Les réponses API incluent `mode` et `discogsUsername`

---

## Bugs Connus / Limitations

- Le rate limit Discogs n'est pas encore géré (Tâche 5)
- Pas de gestion d'erreur avancée pour les échecs OAuth
- Pas de spinner/loader pendant l'initialisation du userStore

---

## Notes pour les Développeurs

- Le `userStore` est initialisé dans `App.vue` via `onMounted`
- Le mode est passé au composable `useCollection` via un `computed(() => userStore.collectionMode)`
- Les empty states sont gérés dans `CollectionView.vue` via `v-if` sur `isUnlinked`, `isEmpty`, `isDemo`
- Le toggle est un simple bouton qui appelle `userStore.setCollectionMode()` puis `fetchCollection(true)`
