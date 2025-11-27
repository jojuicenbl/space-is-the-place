# 📊 Monitoring Guide

Ce guide explique comment surveiller la santé et les performances de votre application.

---

## 🎯 Vue d'ensemble

Le système de monitoring track automatiquement :
- ✅ Statistiques OAuth (requests, succès, échecs)
- ✅ Sessions actives
- ✅ Requêtes API et erreurs
- ✅ Utilisation mémoire
- ✅ Uptime du serveur

---

## 📡 Endpoints Monitoring

### 1. `/api/health` - Vue d'ensemble

**Utilisation** :
```bash
curl http://localhost:3000/api/health
```

**Réponse** :
```json
{
  "status": "healthy",  // "healthy" | "warning" | "critical"
  "checks": {
    "memoryOk": true,
    "oauthStatesReasonable": true,
    "oauthResultsReasonable": true,
    "errorsLow": true
  },
  "metrics": {
    "oauthRequestsTotal": 42,
    "oauthSuccessTotal": 40,
    "oauthFailuresTotal": 2,
    "oauthActiveStates": 3,
    "oauthPendingResults": 1,
    "activeSessions": 0,
    "apiRequestsLast5Min": 156,
    "apiErrorsLast5Min": 2,
    "memoryUsageMB": 85,
    "uptimeSeconds": 3600,
    "nodeVersion": "v20.x.x",
    "environment": "development",
    "lastUpdated": "2025-11-27T14:30:00.000Z",
    "serverStartedAt": "2025-11-27T13:30:00.000Z"
  }
}
```

**Status codes** :
- `200` : Healthy ou Warning
- `503` : Critical (problèmes détectés)

---

### 2. `/api/health/metrics` - Métriques détaillées

**Utilisation** :
```bash
curl http://localhost:3000/api/health/metrics
```

**Réponse** : Objet `metrics` complet (voir ci-dessus)

---

## 🖥️ Monitoring Console

Les métriques sont **automatiquement loguées dans la console** :

### À quel moment ?
- ✅ **30 secondes** après le démarrage du serveur (metrics initiales)
- ✅ **Toutes les 5 minutes** ensuite

### Exemple de log :

```
============================================================
📊 APPLICATION METRICS
============================================================
🔐 OAuth Statistics:
   Total requests:     42
   Successful:         40
   Failed:             2
   Active states:      3
   Pending results:    1

🔗 Sessions:
   Active sessions:    15

📡 API (last 5 min):
   Requests:           1,240
   Errors:             8

💾 System:
   Memory (heap):      85.23 MB / 150.00 MB
   Memory (RSS):       120.45 MB
   Uptime:             2h 15m
   Node version:       v20.11.0
   Environment:        development
============================================================
```

---

## 🚨 Alertes

Le système détecte automatiquement les problèmes :

| Check | Seuil | Action recommandée |
|-------|-------|-------------------|
| **Memory** | > 90% heap utilisé | Redémarrer le serveur ou upgrader vers Redis |
| **OAuth states** | > 1000 états actifs | Vérifier cleanup automatique ou augmenter TTL |
| **OAuth results** | > 100 résultats pending | Problème de claim, vérifier logs frontend |
| **Errors** | > 50 erreurs / 5 min | Investiguer les logs d'erreurs |

---

## 📈 Utilisation en Production

### 1. Monitoring externe (recommandé)

Configurez un health check externe qui ping `/api/health` :

**Uptim Robot** (gratuit) :
```
URL: https://votre-app.com/api/health
Interval: 5 minutes
Alert: Si status != 200 ou response.status != "healthy"
```

**Better Uptime** :
```
Monitor type: HTTP
URL: https://votre-app.com/api/health
Expected response: { "status": "healthy" }
```

### 2. Logs structurés

Les métriques console peuvent être parsées pour monitoring :

```bash
# Exemple: extraire les métriques avec grep
npm run start | grep "OAuth Statistics" -A 5
```

### 3. Alertes personnalisées

Créez un script qui vérifie `/api/health` :

```bash
#!/bin/bash
# check-health.sh

HEALTH=$(curl -s http://localhost:3000/api/health)
STATUS=$(echo $HEALTH | jq -r '.status')

if [ "$STATUS" != "healthy" ]; then
  echo "⚠️  ALERT: Application unhealthy!"
  echo $HEALTH | jq '.'
  # Envoyer email/Slack/etc.
fi
```

**Cron** (toutes les 5 minutes) :
```bash
*/5 * * * * /path/to/check-health.sh
```

---

## 🔍 Débugger avec les Métriques

### Problème : OAuth échoue souvent

**1. Vérifier les métriques** :
```bash
curl http://localhost:3000/api/health/metrics | jq '.oauthFailuresTotal'
```

**2. Ratio de succès** :
```
Succès / Total = 40 / 42 = 95% ✅ (bon)
Succès / Total = 10 / 50 = 20% ❌ (problème)
```

**3. Si ratio faible** :
- Vérifier les logs serveur pour les erreurs
- Vérifier les credentials Discogs
- Vérifier la connectivité réseau

---

### Problème : Sessions multiples

**Vérifier** :
```bash
curl http://localhost:3000/api/health/metrics | jq '.activeSessions'
```

**Normal** : 0-50 sessions actives
**Suspect** : > 1000 sessions
**Action** : Upgrader vers Redis

---

### Problème : Memory leak

**Surveiller** :
```bash
watch -n 5 'curl -s http://localhost:3000/api/health/metrics | jq ".memoryUsageMB"'
```

**Si croissance constante** :
- Redémarrer le serveur
- Investiguer les OAuth state stores
- Considérer Redis

---

## 🎯 Métriques Clés à Surveiller

### Pour démarrage / petit traffic :
1. **oauthSuccessTotal / oauthRequestsTotal** : Doit être > 95%
2. **memoryUsageMB** : Doit rester stable
3. **apiErrorsLast5Min** : Doit être proche de 0

### Pour scaling (> 10k users/jour) :
1. **oauthActiveStates** : Si > 500, passer à Redis
2. **activeSessions** : Si > 1000, passer à Redis
3. **uptimeSeconds** : Surveiller les redémarrages

---

## 💡 Tips

1. **Bookmark** `http://localhost:3000/api/health` pendant le développement
2. **Monitorer** les logs console toutes les 5 minutes
3. **Créer un dashboard** simple avec les métriques JSON
4. **Documenter** les valeurs normales pour votre app

---

## 🚀 Prochaines Étapes (Scaling)

Quand upgrader le monitoring :

1. **> 5k users/jour** : Ajouter Redis + monitoring externe
2. **> 50k users/jour** : APM (Application Performance Monitoring) comme New Relic/Datadog
3. **> 100k users/jour** : Distributed tracing + Infrastructure monitoring

---

**Bon monitoring ! 📊**
