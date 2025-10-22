# Plan de Migration Vuetify → Tailwind CSS

**Status** : 🟡 Configuration prête, migration en cours
**Date création** : 2025-10-22
**Objectif** : Réduire le bundle de 95% et améliorer les performances

## 📊 Impact Attendu

| Métrique | Avant (Vuetify) | Après (Tailwind) | Gain |
|----------|----------------|------------------|------|
| CSS | 672 KB (98 KB gzip) | ~20 KB (5 KB gzip) | **-97%** |
| Fonts | 3.5 MB (MDI icons) | ~50 KB (icônes sélectives) | **-99%** |
| JS | 344 KB | ~250 KB | **-27%** |
| **Total** | **7.2 MB** | **~1 MB** | **-86%** |

## ✅ Configuration (TERMINÉ)

- [x] Tailwind CSS installé
- [x] PostCSS configuré
- [x] Design tokens créés (couleurs, espacements, typo)
- [x] Fichier `tailwind.css` avec composants réutilisables
- [x] Bundle analyzer configuré
- [x] Baseline documentée

## 🎯 Stratégie de Migration (Progressive)

### Principe : **"Feature Toggle"**
Nous allons migrer composant par composant SANS casser l'application existante :
1. Garder Vuetify en parallèle pendant la transition
2. Créer les nouveaux composants Tailwind dans un dossier séparé
3. Remplacer progressivement les imports
4. Supprimer Vuetify à la fin

### Structure proposée
```
src/components/
├── UI/                    # Anciens composants Vuetify (à supprimer)
│   ├── BaseButton.vue
│   ├── MainTitle.vue
│   └── ...
└── ui-tailwind/          # Nouveaux composants Tailwind
    ├── Button.vue
    ├── Card.vue
    ├── Input.vue
    ├── Badge.vue
    └── ...
```

## 📋 Plan d'Exécution par Phase

### Phase 1 : Composants Atomiques ✅ (TERMINÉ)
**Durée réelle** : 2h
**Impact** : Fondations pour tout le reste

- [x] **Button** (`BaseButton.vue` → `ui-tailwind/Button.vue`)
  - Variants : primary, secondary, outline, ghost
  - Sizes : sm, md, lg
  - States : default, hover, active, disabled, loading
  - Slots pour icônes (iconLeft, iconRight)

- [x] **Badge/Tag** (`TagPill.vue` → `ui-tailwind/Badge.vue`)
  - 6 variants : default, primary, secondary, success, warning, error
  - 3 sizes : sm, md, lg
  - Removable avec événement @remove
  - Dot indicator optionnel

- [x] **Input** (nouveau composant)
  - Types : text, email, password, number, search, url, tel
  - États : default, error, disabled
  - Label, helper text, error message
  - Icônes intégrées (slots iconLeft, iconRight)
  - Accessibilité ARIA complète

**Test** : ✅ Page ComponentsTestView.vue créée avec tous les variants

---

### Phase 2 : Composants de Layout ✅ (TERMINÉ)
**Durée réelle** : 2h
**Impact** : Structure de l'app

- [x] **Card** (nouveau → base pour VinylCard)
  - 4 variants : default, bordered, elevated, flat
  - 4 padding options : none, sm, md, lg
  - Hoverable avec lift effect
  - Clickable avec scale effect
  - Support href et router-link
  - Slots : image, header, body (default), footer

- [x] **Navbar** (`AppNavbar.vue` → `ui-tailwind/Navbar.vue`)
  - Mobile responsive avec menu hamburger
  - Icônes Heroicons (Bars3Icon, XMarkIcon)
  - Transitions animées (Transition component)
  - Variants : default, transparent, blurred
  - Sticky optionnel
  - Slots : logo, nav, actions, mobile-nav, mobile-actions

- [x] **Header** (nouveau composant)
  - Search bar intégrée avec clear button
  - Events : update:searchValue, search, clearSearch
  - 3 variants : default, gradient, transparent
  - Sticky optionnel
  - Slots : title, subtitle, title-actions, actions, content

**Test** : ✅ Tous les composants affichés sur ComponentsTestView.vue avec variants et interactions

---

### Phase 3 : Composants Métier (PRIORITÉ 3)
**Durée estimée** : 3-4h
**Impact** : Fonctionnalités principales

- [ ] **VinylCard** (refonte complète)
  - Utilise `ui-tailwind/Card.vue`
  - Lazy-loading images
  - Animations optimisées

- [ ] **CollectionFilters** (refonte)
  - Utilise `ui-tailwind/Input.vue` + `Select.vue`
  - Mobile-first

- [ ] **Pagination** (`Pager.vue` refactoré)
  - Navigation fluide
  - Accessible (keyboard nav)

**Test** : Collection complète fonctionnelle

---

### Phase 4 : Vues & Intégration (PRIORITÉ 4)
**Durée estimée** : 2-3h
**Impact** : Finalisation

- [ ] **CollectionView** (migration)
- [ ] **ReleaseView** (migration)
- [ ] **AboutView** (migration)
- [ ] **ContactView** (migration)

**Test** : App complète sans Vuetify

---

### Phase 5 : Cleanup & Optimisation (FINAL)
**Durée estimée** : 1-2h
**Impact** : Gains performance finaux

- [ ] Supprimer Vuetify de `package.json`
- [ ] Supprimer imports MDI icons de `main.ts`
- [ ] Supprimer dossier `components/UI/` ancien
- [ ] Renommer `ui-tailwind/` → `ui/`
- [ ] Build final et mesure gains
- [ ] Lighthouse audit final

---

## 🎨 Design System Tailwind

### Couleurs (Design Tokens)
```js
primary: {
  500: '#0ea5e9',  // Bleu principal
  600: '#0284c7',  // Bleu hover
}
secondary: {
  500: '#d946ef',  // Violet/Rose
}
```

**À adapter selon l'identité visuelle souhaitée** (voir `tailwind.config.js`)

### Composants Utilitaires (Classes CSS)
```css
.btn-primary       // Bouton primaire
.btn-secondary     // Bouton secondaire
.card              // Carte avec shadow
.input-field       // Champ input styled
```

### Icônes
**Option recommandée** : [Heroicons](https://heroicons.com/) (par Tailwind Labs)
- Lightweight (~50 KB pour 200+ icônes)
- SVG inline (tree-shaking automatique)
- Compatible Vue

```bash
npm install @heroicons/vue
```

---

## 🔄 Checklist par Composant

Pour chaque composant migré :

1. **Créer** nouveau fichier dans `ui-tailwind/`
2. **Implémenter** avec Tailwind + design tokens
3. **Tester** visuellement (tous les variants)
4. **Tester** accessibilité (keyboard, screen readers)
5. **Remplacer** imports dans 1 vue test
6. **Valider** fonctionnalités
7. **Commit** avec message clair
8. **Passer** au suivant

---

## 🧪 Tests Requis

### Tests Visuels
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Dark mode (si implémenté)

### Tests Fonctionnels
- [ ] Toutes les interactions boutons/inputs
- [ ] Navigation complète
- [ ] Filtres collection
- [ ] Pagination
- [ ] Responsive menu

### Tests Performance
- [ ] Lighthouse score ≥ 80
- [ ] Bundle size < 1.5 MB
- [ ] First Paint < 1.5s

---

## 📦 Commande Suivante (Quand prêt)

```bash
# Installer Heroicons pour remplacer MDI
npm install @heroicons/vue

# Commencer migration Phase 1
# 1. Créer src/components/ui-tailwind/Button.vue
# 2. Tester dans une page
# 3. Commit
```

---

## 🚨 Points d'Attention

### À NE PAS faire
- ❌ Supprimer Vuetify avant fin migration
- ❌ Migrer plusieurs composants en même temps
- ❌ Oublier tests responsive
- ❌ Négliger l'accessibilité

### À faire
- ✅ Commit après chaque composant migré
- ✅ Garder snapshots visuels avant/après
- ✅ Documenter breaking changes s'il y en a
- ✅ Tester sur mobile RÉEL si possible

---

## 📈 Métriques de Succès

- **Performance** : Lighthouse ≥ 80
- **Bundle** : < 1.5 MB total
- **CSS** : < 30 KB
- **Fonts** : < 100 KB
- **Pas de régression** : Toutes les fonctionnalités marchent

---

## 🔗 Ressources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)
- [Headless UI Vue](https://headlessui.com/) (pour composants accessibles)
- [Tailwind UI Components](https://tailwindui.com/components) (exemples)

---

**Next Step** : Créer commit avec cette config → Commencer Phase 1 (Button)
