# Skill: Commit Phase

Crée un commit standardisé et propre pour une phase de migration terminée ou un ensemble cohérent de changements.

## Contexte

- **Projet**: space-is-the-place (Vue 3 + Tailwind migration)
- **Convention**: Conventional Commits (type(scope): message)
- **Contrainte utilisateur**: JAMAIS mentionner Claude Code ou AI co-author
- **Branche**: `feature/performance-optimizations` (migration Tailwind)

## Tâches à effectuer

### 1. Questions à poser à l'utilisateur

Avant de commencer:
- Quelle phase/tâche est terminée (ex: "Phase 2", "VinylCard migration")?
- Y a-t-il des breaking changes à documenter?
- Tous les tests passent-ils?
- Dois-je push immédiatement après commit?

### 2. Vérifier l'état Git

```bash
git status
git diff --stat
```

Analyser:
- Fichiers modifiés
- Fichiers ajoutés
- Fichiers supprimés
- S'assurer qu'il n'y a pas de fichiers non désirés (node_modules, .env, etc.)

### 3. Identifier le type de commit

Selon les changements:

| Type | Utilisation | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | Nouveau composant Tailwind |
| `refactor` | Refactorisation (pas de nouvelle feature) | Migration composant Vuetify→Tailwind |
| `perf` | Amélioration performance | Bundle optimization |
| `fix` | Correction bug | Fix responsive layout |
| `docs` | Documentation uniquement | Update MIGRATION_TAILWIND.md |
| `test` | Ajout/modification tests | Add visual tests |
| `style` | Formatage code (pas CSS) | Prettier formatting |
| `chore` | Maintenance (deps, config) | Update Tailwind config |

**Scope** pour ce projet: `ui` (composants interface)

### 4. Analyser les changements pour le message

Catégoriser les changements:

#### Composants créés
```
Nouveaux fichiers:
- src/components/ui-tailwind/Card.vue
- src/components/ui-tailwind/Navbar.vue
- src/components/ui-tailwind/Header.vue
```

#### Composants modifiés/migrés
```
Fichiers modifiés:
- src/components/VinylCard.vue (migration Tailwind)
- src/views/CollectionView.vue (update imports)
```

#### Documentation mise à jour
```
Documentation:
- MIGRATION_TAILWIND.md (Phase 2 marked complete)
- README.md (updated setup instructions)
```

#### Tests ajoutés
```
Tests:
- src/views/ComponentsTestView.vue (added Card, Navbar, Header sections)
```

### 5. Construire le message de commit

Format standard (sans AI attribution):

```
{type}({scope}): {description courte}

{corps détaillé avec bullet points}

{footer optionnel: breaking changes, refs}
```

#### Titre (ligne 1)
- **Max 72 caractères**
- **Impératif** ("add" pas "added", "fix" pas "fixed")
- **Pas de point final**
- **Commence par minuscule après le scope**

Exemples:
- ✅ `feat(ui): add Phase 2 layout components`
- ✅ `refactor(ui): migrate VinylCard to Tailwind`
- ❌ `feat(ui): Added new components.` (passé + point)
- ❌ `Add components` (pas de type/scope)

#### Corps (lignes suivantes)
- **Ligne vide** après le titre
- **Bullet points** pour lister changements
- **Détails techniques** importants
- **Contexte** si nécessaire

Template:

```
{type}({scope}): {titre court}

Created/Modified/Migrated {N} components for {objectif}:

{NomComposant1}:
- Feature 1
- Feature 2
- Technical detail

{NomComposant2}:
- Feature 1
- Feature 2

Updated {fichier1}, {fichier2}:
- Change description

Tests: {description des tests effectués}
Ref: {référence à doc si pertinent}
```

#### Footer (optionnel)
- **Breaking changes**: Si applicable
- **Refs**: Référence à issues, docs, etc.

```
BREAKING CHANGE: {description du breaking change}

Ref: MIGRATION_TAILWIND.md Phase 2
```

### 6. Exemples de messages complets

#### Phase 2 - Composants Layout

```
feat(ui): add Phase 2 layout components (Card, Navbar, Header)

Created three new Tailwind layout components with full responsive support:

Card component:
- 4 variants (default, bordered, elevated, flat)
- 4 padding options (none, sm, md, lg)
- Hoverable and clickable states with smooth transitions
- Support for href and router-link navigation
- Slots for image, header, body, and footer

Navbar component:
- Responsive design with mobile hamburger menu
- Heroicons integration (Bars3Icon, XMarkIcon)
- Animated transitions for mobile menu
- 3 variants (default, transparent, blurred)
- Sticky positioning option
- Slots for logo, nav items, actions, and mobile variants

Header component:
- Integrated search bar with clear functionality
- Events: update:searchValue, search, clearSearch
- 3 variants (default, gradient, transparent)
- Sticky and bordered options
- Slots for title, subtitle, actions, and content

Updated ComponentsTestView to showcase all Phase 2 components.
Updated MIGRATION_TAILWIND.md to mark Phase 1 and Phase 2 as completed.

Tests: ✅ Visual, responsive, dark mode
Ref: MIGRATION_TAILWIND.md Phase 2
```

#### Migration VinylCard

```
refactor(ui): migrate VinylCard from Vuetify to Tailwind

Migrated VinylCard component to use Tailwind CSS Card component as base.

Changes:
- Replaced v-card with Card component from ui-tailwind
- Converted MDI icons to Heroicons (mdi-heart → HeartIcon)
- Preserved all props: album, artist, year, genres, imageUrl
- Preserved all events: @click, @favorite
- Added hoverable prop for lift effect
- Improved lazy-loading with Intersection Observer
- Enhanced dark mode support

Updated imports in:
- src/views/CollectionView.vue
- src/views/ReleaseView.vue

Breaking changes: none
All functionality preserved and tested.

Tests: ✅ Visual rendering, interactions, responsive
Ref: MIGRATION_TAILWIND.md Phase 3
```

#### Mise à jour documentation seule

```
docs(migration): update Phase 2 progress

Marked Card, Navbar, Header components as completed in migration plan.
Updated duration: 2h actual vs 2-3h estimated.
Documented technical details and visual test results.

Ref: MIGRATION_TAILWIND.md
```

#### Fix après tests

```
fix(ui): correct Card component padding in no-padding variant

Fixed padding calculation when padding="none" was still applying margins
from slot wrappers. Removed default margins from image, header, footer
slot containers when padding is set to "none".

Impact: VinylCard layout now correctly uses full Card width.
```

### 7. Staging des fichiers

Ajouter seulement les fichiers pertinents:

```bash
# Bonne pratique: ajouter par catégorie
git add client/src/components/ui-tailwind/

# Vérifier ce qui sera commité
git diff --staged

# Si fichiers de doc aussi modifiés
git add client/MIGRATION_TAILWIND.md

# Si tests modifiés
git add client/src/views/ComponentsTestView.vue
```

**Exclure**:
- Fichiers temporaires
- Logs
- node_modules
- .env
- Changements non liés

### 8. Créer le commit

Utiliser heredoc pour message multiligne:

```bash
git commit -m "$(cat <<'EOF'
feat(ui): add Phase 2 layout components

Created three new Tailwind layout components with full responsive support:

Card component:
- 4 variants (default, bordered, elevated, flat)
- 4 padding options (none, sm, md, lg)
- Hoverable and clickable states
- Slots for image, header, body, footer

Navbar component:
- Responsive mobile hamburger menu
- Heroicons integration
- 3 variants with animations

Header component:
- Integrated search bar
- 3 variants, sticky option
- Multiple slots for flexibility

Updated ComponentsTestView and MIGRATION_TAILWIND.md.

Tests: ✅ Visual, responsive, dark mode
Ref: MIGRATION_TAILWIND.md Phase 2
EOF
)"
```

**IMPORTANT**:
- ✅ Utiliser heredoc `<<'EOF'` avec quotes pour éviter interpolation
- ✅ Fermer avec `EOF` seul sur sa ligne
- ❌ JAMAIS mentionner "Claude Code" ou "Generated with AI"
- ❌ JAMAIS ajouter "Co-Authored-By: Claude"

### 9. Vérifier le commit

```bash
# Voir le dernier commit créé
git log -1

# Voir le diff du commit
git show HEAD

# Vérifier le message
git log -1 --pretty=format:"%B"
```

S'assurer:
- [ ] Message formaté correctement
- [ ] Pas de mention AI/Claude
- [ ] Tous les changements importants mentionnés
- [ ] Type/scope corrects
- [ ] Pas de typos

### 10. Push (si demandé)

```bash
# Push vers origin
git push origin feature/performance-optimizations

# Vérifier que le push a réussi
git status
```

## Checklist complète

Avant de finaliser:
- [ ] `git status` vérifié (aucun fichier indésirable)
- [ ] Type de commit identifié correctement
- [ ] Message suit format Conventional Commits
- [ ] Titre ≤ 72 caractères
- [ ] Corps avec bullet points clairs
- [ ] Tous les composants/fichiers mentionnés
- [ ] Tests documentés
- [ ] Référence à docs si pertinent
- [ ] **AUCUNE mention Claude Code/AI**
- [ ] Fichiers stagés correctement
- [ ] Commit créé avec heredoc
- [ ] Commit vérifié avec `git log -1`
- [ ] Push effectué (si demandé)

## Types de commits par phase

### Phase 1-2 (Nouveaux composants)
```
feat(ui): add Phase X {catégorie} components
```

### Phase 3-4 (Migration composants)
```
refactor(ui): migrate {Composant} to Tailwind
```

### Phase 5 (Cleanup)
```
chore(ui): remove Vuetify dependencies
perf(ui): optimize bundle size after migration
```

### Documentation
```
docs(migration): update Phase X progress
```

### Tests
```
test(ui): add visual tests for {Composant}
```

### Fixes
```
fix(ui): correct {problème} in {Composant}
```

## Gestion des breaking changes

Si breaking changes inévitables:

```
refactor(ui): migrate CollectionFilters to Tailwind

Migrated CollectionFilters component with improved API.

Changes:
- New prop structure for better TypeScript support
- Events renamed for consistency
- Slots reorganized

BREAKING CHANGE:
- Prop `filterOptions` renamed to `filters`
- Event `@update:filters` now emits object instead of array
- Slot `filter-item` merged into default slot with v-for

Migration guide:
<!-- AVANT -->
<CollectionFilters
  :filterOptions="options"
  @update:filters="handleFilters"
/>

<!-- APRÈS -->
<CollectionFilters
  :filters="options"
  @update:filters="(obj) => handleFilters(obj.filters)"
/>

Ref: MIGRATION_BREAKING_CHANGES.md
```

## Cas spéciaux

### Commit avec plusieurs types de changements

Si mix feat + refactor + docs:

```
feat(ui): complete Phase 2 migration (layout components)

New components (feat):
- Card: 4 variants, hoverable, slots
- Navbar: responsive, mobile menu
- Header: search bar, 3 variants

Refactored (refactor):
- ComponentsTestView: added Phase 2 sections
- Updated component exports in index.ts

Documentation (docs):
- MIGRATION_TAILWIND.md: marked Phase 1-2 complete
- Added technical notes and duration

Tests: ✅ All components tested visually
```

### Commit après rebase/merge

Si commit après résolution de conflits:

```
merge: resolve conflicts in CollectionView after Tailwind migration

Resolved merge conflicts between main and feature/performance-optimizations.

Conflicts resolved:
- src/views/CollectionView.vue: kept Tailwind imports
- src/components/VinylCard.vue: merged responsive fixes

All tests passing after merge.
```

### Amend dernier commit (si erreur mineure)

**Vérifier d'abord l'authorship**:
```bash
git log -1 --format='%an %ae'
```

Si c'est bien ton commit:
```bash
# Modifier fichiers
git add {fichiers}

# Amend sans changer message
git commit --amend --no-edit

# Ou amend en changeant message
git commit --amend
```

**IMPORTANT**: Ne jamais amend un commit déjà push ou d'un autre développeur.

## Après le commit

Suggérer à l'utilisateur:
1. Vérifier le commit: `git log -1`
2. Vérifier le diff: `git show HEAD`
3. Si OK et demandé: push vers origin
4. Si phase terminée: utiliser `/update-migration-plan`
5. Continuer avec prochaine tâche

## Template rapide

Pour copier-coller et adapter:

```bash
git add {fichiers}

git commit -m "$(cat <<'EOF'
{type}(ui): {description courte}

{Détails des changements}:
- Point 1
- Point 2
- Point 3

{Composant/fichier modifié}:
- Changement 1
- Changement 2

Tests: ✅ {description tests}
Ref: {référence doc si pertinent}
EOF
)"

git push origin feature/performance-optimizations
```
