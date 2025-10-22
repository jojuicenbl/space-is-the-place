# Performance Baseline - Avant Optimisations

**Date** : 2025-10-22
**Branch** : `feature/performance-optimizations`

## 📊 Bundle Analysis (AVANT)

### Build Output
```
Total dist size: ~7.2 MB

JavaScript:
  index-B1zI5Pr8.js        344.20 kB (gzip: 119.91 kB)
  ReleaseView-Bf_9BRwv.js   10.67 kB (gzip:   4.25 kB)
  AboutView-Bk7VxYP2.js      2.43 kB (gzip:   1.07 kB)
  ContactView-Dpc3CSXS.js    2.24 kB (gzip:   1.07 kB)

CSS:
  index-CMZi5Fb3.css       671.67 kB (gzip:  98.25 kB) ⚠️ ÉNORME
  ReleaseView-6SUkNdmh.css    7.26 kB (gzip:   1.86 kB)
  AboutView-Bfr6tzza.css      4.77 kB (gzip:   1.42 kB)
  ContactView-BtsylJXM.css    2.45 kB (gzip:   0.83 kB)

Fonts (Material Design Icons):
  materialdesignicons-webfont.woff2    403.22 kB ⚠️
  materialdesignicons-webfont.woff     587.98 kB ⚠️
  materialdesignicons-webfont.ttf    1,307.66 kB ⚠️
  materialdesignicons-webfont.eot    1,307.88 kB ⚠️
  TOTAL FONTS:                       3,606.74 kB (3.5 MB!) 🔴
```

## 🔴 Problèmes Identifiés

### 1. Vuetify Material Design Icons (CRITIQUE)
- **Impact** : 3.5 MB de fonts chargées
- **Cause** : Vuetify importe TOUS les icônes MDI (7000+ icônes)
- **Solution** : Migrer vers Tailwind + icônes sélectives

### 2. CSS Bundle Énorme
- **Impact** : 672 KB de CSS (98 KB gzippé)
- **Cause** : Vuetify génère du CSS pour TOUS ses composants
- **Solution** : Tailwind génère uniquement le CSS utilisé (tree-shaking)

### 3. JavaScript Bundle
- **Impact** : 344 KB (120 KB gzippé)
- **Cause** : Vuetify + dépendances
- **Amélioration possible** : Code-splitting, lazy-loading

### 4. Aucun Code-Splitting
- Toutes les routes chargées d'un coup
- Pas de lazy-loading des composants

### 5. Images Non Optimisées
- Pas de formats modernes (WebP/AVIF)
- Pas de lazy-loading
- Pas de responsive images

## 🎯 Objectifs d'Optimisation

| Métrique | Avant | Objectif | Amélioration |
|----------|-------|----------|--------------|
| **JS Total** | 344 KB | ~100 KB | -71% |
| **CSS Total** | 672 KB | ~20 KB | -97% |
| **Fonts** | 3.5 MB | ~50 KB | -99% |
| **Total dist** | 7.2 MB | ~1 MB | -86% |
| **Lighthouse Performance** | ~50? | ≥80 | +60% |

## 📋 Plan d'Action

### Phase 2.1 : Migration Tailwind (PRIORITÉ 1)
- [ ] Installer Tailwind CSS
- [ ] Configurer design tokens
- [ ] Migrer composants UI un par un
- [ ] Supprimer Vuetify

**Impact estimé** : -95% CSS, -3.5 MB fonts

### Phase 2.2 : Code-Splitting
- [ ] Lazy-loading des routes
- [ ] Lazy-loading des composants lourds
- [ ] Dynamic imports

**Impact estimé** : -50% initial JS bundle

### Phase 2.3 : Optimisation Images
- [ ] Formats modernes (WebP)
- [ ] Lazy-loading
- [ ] Responsive images

**Impact estimé** : +30% Lighthouse Performance

### Phase 2.4 : Optimisation Fonts
- [ ] Subset fonts
- [ ] font-display: swap
- [ ] Preload critical fonts

**Impact estimé** : +10% Lighthouse Performance

## 📊 Métriques à Suivre

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Bundle size (gzip)

---

**Next Step** : Installer Tailwind CSS et commencer la migration
