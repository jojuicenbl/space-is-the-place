# Skill: Migrate Component

Migre un composant Vuetify existant vers Tailwind CSS en préservant toutes les fonctionnalités.

## Contexte du projet

- **Migration**: Vuetify → Tailwind CSS v3
- **Objectif**: Réduire bundle de 7.2 MB → ~1 MB
- **Stratégie**: Progressive (garder Vuetify jusqu'à fin)
- **Plan**: Défini dans `client/MIGRATION_TAILWIND.md`
- **Composants Tailwind**: Dans `client/src/components/ui-tailwind/`
- **Composants anciens**: Dans `client/src/components/UI/` et autres dossiers

## Tâches à effectuer

### 1. Questions à poser à l'utilisateur

Avant de commencer:
- Quel composant migrer (ex: "VinylCard.vue", "CollectionFilters.vue")?
- Garder le même nom de fichier ou renommer?
- Acceptes-tu des breaking changes mineurs (si oui, lesquels)?
- Dois-je mettre à jour les vues qui l'utilisent immédiatement?

### 2. Analyser le composant source

Lire le composant Vuetify existant et identifier:

#### Props
- Liste complète des props avec types
- Valeurs par défaut
- Props requises vs optionnelles

#### Events
- Tous les événements émis (`@click`, `@update:modelValue`, etc.)
- Payload de chaque événement

#### Slots
- Slots nommés disponibles
- Slots par défaut
- Scoped slots avec leurs données

#### Fonctionnalités
- Logique métier (computed, methods, watchers)
- Dépendances externes (composables, stores)
- Intégration avec APIs ou services

#### Composants Vuetify utilisés
- `v-btn` → Button.vue
- `v-card` → Card.vue
- `v-text-field` → Input.vue
- `v-chip` → Badge.vue
- Etc.

### 3. Mapping vers composants Tailwind

Créer une table de correspondance:

| Vuetify | Tailwind ui-tailwind | Notes |
|---------|---------------------|-------|
| `v-btn` | `Button.vue` | Props similaires |
| `v-card` | `Card.vue` | Utiliser slots |
| `v-text-field` | `Input.vue` | v-model préservé |
| `v-chip` | `Badge.vue` | Pas de closable par défaut |

Composants ui-tailwind disponibles:
- ✅ Button.vue (4 variants, 3 sizes, loading, icons)
- ✅ Badge.vue (6 variants, 3 sizes, removable, dot)
- ✅ Input.vue (types multiples, error, icons)
- ✅ Card.vue (4 variants, hoverable, slots)
- ✅ Navbar.vue (responsive, mobile menu)
- ✅ Header.vue (search, variants)

### 4. Créer le nouveau composant

Option A: **Nouveau fichier dans ui-tailwind/** (si composant atomique/layout)
- Créer `client/src/components/ui-tailwind/{Nom}.vue`
- Utiliser le skill `/create-tailwind-component` si besoin

Option B: **Refactorer fichier existant** (si composant métier)
- Modifier le fichier en place
- Remplacer imports Vuetify par imports Tailwind
- Convertir template Vuetify → Tailwind

#### Structure du nouveau composant

```vue
<script setup lang="ts">
/**
 * {NomComposant} - Tailwind CSS version
 * Migré de: {chemin/ancien/composant.vue}
 *
 * Migration notes:
 * - Remplace v-{composant} par {ComposantTailwind}
 * - Breaking changes: {liste si applicable}
 * - Nouvelles features: {liste si ajouts}
 */

import { computed, ref } from 'vue'
// Import composants Tailwind
import { Button, Badge, Input, Card } from '@/components/ui-tailwind'
// ou imports individuels selon besoin

// Import Heroicons pour remplacer MDI
import { IconName } from '@heroicons/vue/24/outline'

// Imports des composables/stores existants
import { useCollectionStore } from '@/stores/collection'

// Props identiques ou compatibles avec ancien composant
interface Props {
  // Garder les mêmes props autant que possible
  // Ajouter nouveaux props Tailwind (variant, size) si pertinent
}

const props = withDefaults(defineProps<Props>(), {
  // Mêmes defaults que l'ancien composant
})

// Events identiques
const emit = defineEmits<{
  // Garder les mêmes événements pour compatibilité
}>()

// Logique métier préservée
// Copier/adapter computed, methods, watchers de l'ancien composant
</script>

<template>
  <!-- Template converti avec composants Tailwind -->
  <Card variant="default" hoverable>
    <template #header>
      <!-- ... -->
    </template>

    <!-- Contenu principal -->

    <template #footer>
      <Button variant="primary" @click="handleAction">
        Action
      </Button>
    </template>
  </Card>
</template>
```

### 5. Convertir les icônes MDI → Heroicons

Mapping courant:
- `mdi-magnify` → `MagnifyingGlassIcon`
- `mdi-close` → `XMarkIcon`
- `mdi-chevron-down` → `ChevronDownIcon`
- `mdi-heart` → `HeartIcon`
- `mdi-music` → `MusicalNoteIcon`
- `mdi-home` → `HomeIcon`
- `mdi-account` → `UserIcon`
- `mdi-filter` → `FunnelIcon`
- `mdi-dots-vertical` → `EllipsisVerticalIcon`

Référence complète: https://heroicons.com/

### 6. Mettre à jour les imports dans les vues

Identifier toutes les vues qui utilisent l'ancien composant:

```bash
# Rechercher les imports
grep -r "import.*{AncienNom}" client/src/views/
grep -r "components/{AncienNom}" client/src/views/
```

Pour chaque fichier trouvé:

```vue
<!-- AVANT -->
<script setup>
import VinylCard from '@/components/VinylCard.vue'
</script>

<!-- APRÈS -->
<script setup>
import VinylCard from '@/components/ui-tailwind/VinylCard.vue'
// OU si renommé:
import VinylCardTailwind from '@/components/ui-tailwind/VinylCard.vue'
</script>
```

### 7. Tester l'équivalence fonctionnelle

Checklist de validation:

#### Visuel
- [ ] Rendu identique ou amélioré
- [ ] Tous les variants affichés correctement
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Dark mode fonctionne
- [ ] Animations/transitions fluides

#### Fonctionnel
- [ ] Tous les props fonctionnent
- [ ] Tous les événements sont émis correctement
- [ ] Tous les slots fonctionnent
- [ ] v-model fonctionne (si applicable)
- [ ] Logique métier identique
- [ ] Intégrations externes (store, API) fonctionnent

#### Performance
- [ ] Pas de régression de performance
- [ ] Pas d'erreurs console
- [ ] Pas d'erreurs TypeScript

#### Accessibilité
- [ ] Navigation clavier préservée
- [ ] ARIA attributes présents
- [ ] Contraste couleurs respecté

### 8. Ajouter à ComponentsTestView (si pertinent)

Si composant réutilisable, ajouter section de test:

```vue
<!-- {NomComposant} Component (Migrated) -->
<section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    {NomComposant} (Migré) ✅
  </h2>

  <!-- Exemples d'utilisation -->
  <div class="space-y-6">
    <!-- Use case réaliste avec vraies données -->
  </div>
</section>
```

### 9. Documenter les breaking changes

Si breaking changes inévitables, créer un fichier:
`client/MIGRATION_BREAKING_CHANGES.md` (ou ajouter section dans MIGRATION_TAILWIND.md)

```markdown
## {NomComposant}

### Breaking Changes
- **Prop `old-prop` supprimée**: Utiliser `new-prop` à la place
- **Event `old-event` renommé**: Maintenant `new-event`
- **Slot `old-slot` fusionné**: Utiliser slot `default` avec condition

### Migration Guide
\`\`\`vue
<!-- AVANT -->
<OldComponent old-prop="value" @old-event="handler">
  <template #old-slot>Content</template>
</OldComponent>

<!-- APRÈS -->
<NewComponent new-prop="value" @new-event="handler">
  Content
</NewComponent>
\`\`\`
```

### 10. Mettre à jour MIGRATION_TAILWIND.md

Cocher l'item correspondant dans le plan:
- [ ] → [x] **{NomComposant}** (détails...)

Voir skill `/update-migration-plan` pour automatiser.

### 11. Commit

Créer commit descriptif:

```bash
git add client/src/components/{chemin}/{NomComposant}.vue
git add client/src/views/ # Si vues modifiées
git add client/MIGRATION_TAILWIND.md

git commit -m "refactor(ui): migrate {NomComposant} from Vuetify to Tailwind

Migrated {NomComposant} component to use Tailwind CSS components.

Changes:
- Replaced v-{vuetify} with {TailwindComponent}
- Converted MDI icons to Heroicons
- Updated all imports in affected views
- Preserved all functionality and props
- Added dark mode support
- Improved responsive design

Breaking changes: {none | liste}

Tested: ✅ Visual, functional, responsive
Ref: MIGRATION_TAILWIND.md Phase {X}"
```

Ou utiliser skill `/commit-phase` pour standardiser.

## Cas spéciaux

### Composant avec v-model

Préserver le pattern v-model:

```vue
<script setup lang="ts">
// AVANT (Vuetify)
const model = defineModel<string>()

// APRÈS (Tailwind) - identique !
const model = defineModel<string>()
</script>

<template>
  <!-- Passer v-model au composant enfant Tailwind -->
  <Input v-model="model" />
</template>
```

### Composant avec composables Pinia

Pas de changement nécessaire:

```vue
<script setup lang="ts">
import { useCollectionStore } from '@/stores/collection'

const collectionStore = useCollectionStore()
// Utilisation identique, juste le template change
</script>
```

### Composant avec slots scopés

Préserver la signature:

```vue
<template>
  <!-- AVANT -->
  <slot name="item" :item="item" :index="index" />

  <!-- APRÈS - identique -->
  <slot name="item" :item="item" :index="index" />
</template>
```

## Patterns de migration courants

### Pattern 1: v-btn → Button

```vue
<!-- AVANT -->
<v-btn color="primary" size="large" @click="handleClick">
  <v-icon start>mdi-plus</v-icon>
  Add Item
</v-btn>

<!-- APRÈS -->
<Button variant="primary" size="lg" @click="handleClick">
  <template #iconLeft>
    <PlusIcon class="w-5 h-5" />
  </template>
  Add Item
</Button>
```

### Pattern 2: v-card → Card

```vue
<!-- AVANT -->
<v-card elevation="2">
  <v-card-title>Title</v-card-title>
  <v-card-text>Content</v-card-text>
  <v-card-actions>
    <v-btn>Action</v-btn>
  </v-card-actions>
</v-card>

<!-- APRÈS -->
<Card variant="elevated">
  <template #header>
    <h3>Title</h3>
  </template>
  Content
  <template #footer>
    <Button>Action</Button>
  </template>
</Card>
```

### Pattern 3: v-text-field → Input

```vue
<!-- AVANT -->
<v-text-field
  v-model="search"
  label="Search"
  placeholder="Type here..."
  prepend-inner-icon="mdi-magnify"
  clearable
/>

<!-- APRÈS -->
<Input
  v-model="search"
  label="Search"
  placeholder="Type here..."
  type="search"
>
  <template #iconLeft>
    <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
  </template>
</Input>
```

### Pattern 4: v-chip → Badge

```vue
<!-- AVANT -->
<v-chip color="primary" size="small" closable @click:close="remove">
  Rock
</v-chip>

<!-- APRÈS -->
<Badge
  variant="primary"
  size="sm"
  text="Rock"
  removable
  @remove="remove"
/>
```

## Vérifications finales

Avant de terminer:
- [ ] Ancien composant fonctionne encore (si non supprimé)
- [ ] Nouveau composant a équivalence fonctionnelle 100%
- [ ] Tous les tests visuels passent
- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur console
- [ ] Performance égale ou meilleure
- [ ] Breaking changes documentés (si applicable)
- [ ] MIGRATION_TAILWIND.md mis à jour
- [ ] Commit créé avec message descriptif

## Après migration

Suggérer à l'utilisateur:
1. Tester l'application complète
2. Si OK, merger dans dev
3. Continuer avec prochain composant de la phase
4. Quand phase complète, utiliser `/update-migration-plan`
