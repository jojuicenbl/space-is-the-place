# Skill: Update Migration Plan

Met à jour le fichier `client/MIGRATION_TAILWIND.md` avec la progression de la migration Vuetify → Tailwind.

## Contexte

- **Fichier**: `client/MIGRATION_TAILWIND.md`
- **Structure**: 5 phases de migration + configuration
- **Format**: Markdown avec checkboxes `[ ]` / `[x]`
- **Objectif**: Tracking précis de l'avancement

## Tâches à effectuer

### 1. Questions à poser à l'utilisateur

Avant de commencer:
- Quelle phase mettre à jour (Configuration / Phase 1-5)?
- Quels composants/tâches ont été terminés?
- Quelle est la durée réelle de travail (en heures)?
- Y a-t-il des problèmes/blocages à documenter?
- Y a-t-il des détails techniques importants à ajouter?

### 2. Lire le fichier actuel

Lire `client/MIGRATION_TAILWIND.md` pour:
- Identifier la section à mettre à jour
- Vérifier l'état actuel des checkboxes
- Préserver le formatage existant

### 3. Mettre à jour les checkboxes

Pour chaque composant/tâche terminé(e):

```markdown
<!-- AVANT -->
- [ ] **Button** (`BaseButton.vue` → `ui-tailwind/Button.vue`)
  - Variants : primary, secondary, outline, ghost
  - Sizes : sm, md, lg

<!-- APRÈS -->
- [x] **Button** (`BaseButton.vue` → `ui-tailwind/Button.vue`)
  - Variants : primary, secondary, outline, ghost
  - Sizes : sm, md, lg
  - States : default, hover, active, disabled, loading
  - Slots pour icônes (iconLeft, iconRight)
```

Ajouter détails importants:
- Features implémentées au-delà du plan initial
- Slots créés
- Events émis
- Particularités techniques

### 4. Mettre à jour le titre de phase

Si phase complète, marquer comme ✅ (TERMINÉ):

```markdown
<!-- AVANT -->
### Phase 1 : Composants Atomiques (PRIORITÉ 1)
**Durée estimée** : 2-3h
**Impact** : Fondations pour tout le reste

<!-- APRÈS -->
### Phase 1 : Composants Atomiques ✅ (TERMINÉ)
**Durée réelle** : 2h
**Impact** : Fondations pour tout le reste
```

### 5. Mettre à jour les tests

Si des tests ont été effectués, cocher les sections concernées:

```markdown
### Tests Visuels
- [x] Desktop (1920x1080)
- [x] Tablet (768x1024)
- [x] Mobile (375x667)
- [ ] Dark mode (si implémenté)

### Tests Fonctionnels
- [x] Toutes les interactions boutons/inputs
- [x] Navigation complète
- [ ] Filtres collection
```

### 6. Documenter les problèmes rencontrés (optionnel)

Si des problèmes ont été rencontrés, ajouter une section:

```markdown
### Phase X : Composants ... ✅ (TERMINÉ)

**Problèmes rencontrés**:
- Tailwind v4 incompatibilité → downgrade v3 ✅
- PostCSS plugin error → install @tailwindcss/postcss ✅

**Solutions appliquées**:
- Utilisation Tailwind CSS v3.4.17 (stable)
- Configuration postcss.config.js avec tailwindcss: {}
```

### 7. Mettre à jour les métriques (si disponibles)

Si tests de performance effectués:

```markdown
## 📊 Impact Attendu → Impact Réel

| Métrique | Avant | Après | Gain Réel |
|----------|-------|-------|-----------|
| CSS | 672 KB | 45 KB | **-93%** ✅ |
| Fonts | 3.5 MB | 52 KB | **-98%** ✅ |
| Bundle | 7.2 MB | 1.2 MB | **-83%** ✅ |
```

### 8. Ajouter notes de progression

En fin de fichier ou dans section dédiée:

```markdown
## 📝 Notes de Progression

### 2025-10-22
- ✅ Phase 1 terminée (2h) - 3 composants atomiques
- ✅ Phase 2 terminée (2h) - 3 composants layout
- 🔄 Phase 3 en cours - VinylCard migration

### Prochaines étapes
1. Migrer VinylCard avec Card.vue comme base
2. Refactorer CollectionFilters avec Input.vue
3. Migrer Pager.vue (pagination)
```

## Exemples de mise à jour par phase

### Configuration (déjà terminée)

```markdown
## ✅ Configuration (TERMINÉ)

- [x] Tailwind CSS installé (v3.4.17)
- [x] PostCSS configuré
- [x] Design tokens créés (couleurs, espacements, typo)
- [x] Fichier `tailwind.css` avec composants réutilisables
- [x] Bundle analyzer configuré
- [x] Baseline documentée (PERFORMANCE_BASELINE.md)
- [x] Heroicons installé (@heroicons/vue)
```

### Phase 1 - Exemple complet

```markdown
### Phase 1 : Composants Atomiques ✅ (TERMINÉ)
**Durée réelle** : 2h (estimée : 2-3h)
**Impact** : Fondations pour tout le reste

- [x] **Button** (`BaseButton.vue` → `ui-tailwind/Button.vue`)
  - 4 variants : primary, secondary, outline, ghost
  - 3 sizes : sm, md, lg
  - States : default, hover, active, disabled, loading
  - Slots : iconLeft, iconRight
  - Full TypeScript avec interface Props
  - Support dark mode complet

- [x] **Badge/Tag** (`TagPill.vue` → `ui-tailwind/Badge.vue`)
  - 6 variants : default, primary, secondary, success, warning, error
  - 3 sizes : sm, md, lg
  - Removable avec événement @remove
  - Dot indicator optionnel
  - Support genres vinyl collection

- [x] **Input** (nouveau composant)
  - Types : text, email, password, number, search, url, tel
  - États : default, error, disabled
  - Label, helper text, error message
  - Icônes intégrées (slots iconLeft, iconRight)
  - Accessibilité ARIA complète
  - v-model support

**Test** : ✅ Page ComponentsTestView.vue créée avec tous les variants
**Commit** : `feat(ui): add Phase 1 atomic components` (a1b2c3d)
```

### Phase 2 - Exemple complet

```markdown
### Phase 2 : Composants de Layout ✅ (TERMINÉ)
**Durée réelle** : 2h (estimée : 2-3h)
**Impact** : Structure de l'app

- [x] **Card** (nouveau → base pour VinylCard)
  - 4 variants : default, bordered, elevated, flat
  - 4 padding options : none, sm, md, lg
  - Hoverable avec lift effect (-translate-y-1)
  - Clickable avec scale effect (active:scale-[0.98])
  - Support href et router-link
  - Slots : image, header, body (default), footer

- [x] **Navbar** (`AppNavbar.vue` → `ui-tailwind/Navbar.vue`)
  - Mobile responsive avec menu hamburger
  - Heroicons : Bars3Icon, XMarkIcon
  - Transitions animées (Vue Transition component)
  - 3 variants : default, transparent, blurred
  - Sticky optionnel
  - Slots : logo, nav, actions, mobile-nav, mobile-actions

- [x] **Header** (nouveau composant)
  - Search bar intégrée avec MagnifyingGlassIcon
  - Clear button (XMarkIcon) conditionnel
  - Events : update:searchValue, search, clearSearch
  - 3 variants : default, gradient, transparent
  - Sticky et bordered optionnels
  - Slots : title, subtitle, title-actions, actions, content

**Test** : ✅ Tous composants affichés sur ComponentsTestView.vue
**Commit** : `feat(ui): add Phase 2 layout components` (92692c9)
```

### Phase 3 - En cours (exemple)

```markdown
### Phase 3 : Composants Métier 🔄 (EN COURS)
**Durée estimée** : 3-4h
**Impact** : Fonctionnalités principales

- [x] **VinylCard** (refonte complète)
  - Utilise `ui-tailwind/Card.vue` comme base
  - Lazy-loading images avec Intersection Observer
  - Animations hover optimisées
  - Props: variant, hoverable, clickable
  - Slots: image, genres, actions

- [ ] **CollectionFilters** (refonte)
  - Utilise `ui-tailwind/Input.vue` + composant Select à créer
  - Mobile-first avec drawer pour filtres

- [ ] **Pagination** (`Pager.vue` refactoré)
  - Navigation fluide
  - Accessible (keyboard nav)

**Test** : En cours - VinylCard testé ✅
```

## Format des commits à documenter

Quand un commit est fait, documenter sa référence:

```markdown
**Commit** : `{type}(scope): {message}` ({hash court})
```

Exemples:
- `feat(ui): add Button component` (a1b2c3d)
- `refactor(ui): migrate VinylCard to Tailwind` (e4f5g6h)
- `perf(ui): optimize bundle size` (i7j8k9l)

## Checklist de mise à jour

Avant de finaliser:
- [ ] Checkboxes mises à jour correctement
- [ ] Durée réelle indiquée (si phase terminée)
- [ ] Détails techniques ajoutés
- [ ] Tests documentés
- [ ] Commit référencé (hash + message)
- [ ] Formatage Markdown préservé
- [ ] Aucune régression sur autres sections
- [ ] Fichier sauvegardé

## Commit de la mise à jour

Après mise à jour, commiter le fichier:

```bash
git add client/MIGRATION_TAILWIND.md
git commit -m "docs(migration): update Phase X progress

- Marked {composant1}, {composant2} as completed
- Updated duration: {X}h actual vs {Y}h estimated
- Documented technical details and tests
- Added commit reference {hash}"
```

## Cas spéciaux

### Phase partiellement terminée

```markdown
### Phase 3 : Composants Métier 🔄 (EN COURS - 2/3)
**Progression** : 67%
**Temps écoulé** : 3h / 4h estimées

- [x] VinylCard ✅
- [x] CollectionFilters ✅
- [ ] Pagination (en cours...)
```

### Phase avec blocage

```markdown
### Phase 4 : Vues & Intégration ⚠️ (BLOQUÉ)
**Blocage** : Attente migration Phase 3 complète

Raison: CollectionView dépend de VinylCard, CollectionFilters, Pagination
Prochaine action: Terminer Phase 3 puis reprendre
```

### Ajout de nouvelle phase (si nécessaire)

Si une phase non prévue est ajoutée:

```markdown
### Phase 2.5 : Composants Formulaires (AJOUTÉ)
**Ajouté le** : 2025-10-23
**Raison** : Besoin de Select, Checkbox, Radio pour CollectionFilters
**Durée estimée** : 2h

- [ ] **Select** (nouveau)
- [ ] **Checkbox** (nouveau)
- [ ] **Radio** (nouveau)
```

## Après mise à jour

Suggérer à l'utilisateur:
1. Vérifier que le fichier est bien formaté
2. Commit la mise à jour
3. Continuer avec prochaine tâche/composant
4. Utiliser `/commit-phase` si phase complète

## Métriques de succès

Le fichier MIGRATION_TAILWIND.md doit toujours refléter:
- ✅ État actuel précis (X/Y composants terminés)
- ✅ Temps réel vs estimé
- ✅ Problèmes et solutions documentés
- ✅ Commits référencés
- ✅ Prochaines étapes claires
