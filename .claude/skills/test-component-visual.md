# Skill: Test Component Visual

Ajoute un nouveau composant à la page `ComponentsTestView.vue` pour tests visuels complets.

## Contexte

- **Fichier**: `client/src/views/ComponentsTestView.vue`
- **URL**: `http://localhost:5175/components-test`
- **Objectif**: Tester visuellement tous les variants/sizes/states des composants Tailwind
- **Structure**: Sections organisées par composant avec exemples interactifs

## Tâches à effectuer

### 1. Questions à poser à l'utilisateur

Avant de commencer:
- Quel composant ajouter (ex: "Select", "Modal", "Tooltip")?
- Combien de variants à montrer?
- Combien de sizes à montrer?
- Y a-t-il des états spéciaux (hover, disabled, loading, error)?
- Besoin d'interactivité (ref reactives pour démonstration)?
- Cas d'usage spécifique au contexte vinyl collection?

### 2. Lire ComponentsTestView.vue actuel

Lire le fichier pour:
- Identifier la structure existante
- Voir les imports déjà présents
- Repérer le pattern des sections
- Trouver où insérer la nouvelle section

### 3. Ajouter l'import du composant

En haut du fichier, dans `<script setup>`:

```typescript
// Si composant exporté depuis index.ts
import { Button, Badge, Input, {NouveauComposant} } from '@/components/ui-tailwind'

// Ou import direct
import {NouveauComposant} from '@/components/ui-tailwind/{NouveauComposant}.vue'

// Import Heroicons si nécessaire pour les exemples
import { IconName } from '@heroicons/vue/24/outline'
```

### 4. Créer refs reactives (si nécessaire)

Pour composants interactifs avec v-model:

```typescript
// Exemples
const selectValue = ref('')
const checkboxValue = ref(false)
const radioValue = ref('option1')
const dateValue = ref('')
```

### 5. Créer la section du composant

Template standard:

```vue
<!-- {NomComposant} Component -->
<section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    {NomComposant} Component
  </h2>

  <div class="space-y-6">
    <!-- Sous-sections ici -->
  </div>
</section>
```

### 6. Ajouter sous-sections par catégorie

#### A. Variants (si applicable)

```vue
<div>
  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
    Variants
  </h3>
  <div class="flex flex-wrap gap-4">
    <{NomComposant} variant="primary">Primary</{NomComposant}>
    <{NomComposant} variant="secondary">Secondary</{NomComposant}>
    <{NomComposant} variant="outline">Outline</{NomComposant}>
    <!-- Tous les variants -->
  </div>
</div>
```

#### B. Sizes (si applicable)

```vue
<div>
  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
    Sizes
  </h3>
  <div class="flex flex-wrap items-center gap-4">
    <{NomComposant} size="sm">Small</{NomComposant}>
    <{NomComposant} size="md">Medium</{NomComposant}>
    <{NomComposant} size="lg">Large</{NomComposant}>
  </div>
</div>
```

#### C. States (si applicable)

```vue
<div>
  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
    States
  </h3>
  <div class="flex flex-wrap gap-4">
    <{NomComposant}>Normal</{NomComposant}>
    <{NomComposant} disabled>Disabled</{NomComposant}>
    <{NomComposant} loading>Loading</{NomComposant}>
    <{NomComposant} error>Error</{NomComposant}>
  </div>
</div>
```

#### D. Avec icônes (si slots disponibles)

```vue
<div>
  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
    With Icons
  </h3>
  <div class="flex flex-wrap gap-4">
    <{NomComposant}>
      <template #iconLeft>
        <MagnifyingGlassIcon class="w-5 h-5" />
      </template>
      Search
    </{NomComposant}>
    <{NomComposant}>
      Add Item
      <template #iconRight>
        <PlusIcon class="w-5 h-5" />
      </template>
    </{NomComposant}>
  </div>
</div>
```

#### E. Interactivité (si v-model)

```vue
<div>
  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
    Interactive Example
  </h3>
  <div class="space-y-4">
    <{NomComposant} v-model="{reactiveValue}">
      <!-- Contenu -->
    </{NomComposant}>
    <p class="text-sm text-gray-500">
      Current value: {{ {reactiveValue} || '(empty)' }}
    </p>
  </div>
</div>
```

#### F. Use Case réaliste (contexte vinyl)

```vue
<div>
  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
    Use Case: Vinyl Collection
  </h3>
  <div class="space-y-4">
    <!-- Exemple concret d'utilisation dans le contexte du projet -->
    <{NomComposant}>
      <!-- Exemple avec données vinyl réalistes -->
      <!-- Ex: genres, artistes, albums, années, etc. -->
    </{NomComposant}>
  </div>
</div>
```

### 7. Grid layouts recommandés

Selon le nombre d'items:

```vue
<!-- 2 items par ligne sur desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">

<!-- 3 items par ligne sur desktop -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">

<!-- 4 items par ligne sur desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- Flex wrap pour items de taille variable -->
<div class="flex flex-wrap gap-4">
```

### 8. Mettre à jour la section "Usage Example" (optionnel)

Si le composant est important, ajouter un exemple de code:

```vue
<!-- Code Example -->
<section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    Usage Example - {NomComposant}
  </h2>
  <pre class="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm"><code>&lt;script setup&gt;
import { {NomComposant} } from '@/components/ui-tailwind'
import { ref } from 'vue'

const value = ref('')
&lt;/script&gt;

&lt;template&gt;
  &lt;{NomComposant} v-model="value" variant="primary"&gt;
    Content
  &lt;/{NomComposant}&gt;
&lt;/template&gt;</code></pre>
</section>
```

### 9. Positionner la section correctement

Ordre logique:
1. Composants atomiques (Button, Badge, Input, etc.)
2. Composants layout (Card, Navbar, Header, etc.)
3. Composants métier (VinylCard, CollectionFilters, etc.)
4. Section "Usage Example" en dernier

Insérer avant la section "Usage Example" ou à la fin selon catégorie.

### 10. Vérifier la compilation

```bash
# Pas d'erreurs TypeScript
npm run type-check

# Vérifier visuellement dans le navigateur
# Naviguer vers http://localhost:5175/components-test
```

## Exemples complets par type de composant

### Composant simple (Badge, Button)

```vue
<section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    Badge Component
  </h2>

  <div class="space-y-6">
    <!-- Variants -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Variants
      </h3>
      <div class="flex flex-wrap gap-3">
        <Badge variant="default" text="Default" />
        <Badge variant="primary" text="Primary" />
        <Badge variant="secondary" text="Secondary" />
        <Badge variant="success" text="Success" />
        <Badge variant="warning" text="Warning" />
        <Badge variant="error" text="Error" />
      </div>
    </div>

    <!-- Use Case -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Use Case: Album Genres
      </h3>
      <div class="flex flex-wrap gap-2">
        <Badge text="Progressive Rock" />
        <Badge text="Psychedelic" />
        <Badge text="Art Rock" />
        <Badge text="Space Rock" />
      </div>
    </div>
  </div>
</section>
```

### Composant avec v-model (Input, Select)

```vue
<section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    Select Component
  </h2>

  <div class="space-y-6 max-w-2xl">
    <!-- Basic Select -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Basic Select
      </h3>
      <Select
        v-model="selectValue"
        label="Choose a genre"
        :options="[
          { value: 'rock', label: 'Rock' },
          { value: 'jazz', label: 'Jazz' },
          { value: 'electronic', label: 'Electronic' }
        ]"
      />
      <p class="mt-2 text-sm text-gray-500">
        Selected: {{ selectValue || '(none)' }}
      </p>
    </div>

    <!-- Error State -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Error State
      </h3>
      <Select
        v-model="selectValue"
        label="Genre"
        error="Please select a genre"
        :options="genres"
      />
    </div>
  </div>
</section>
```

### Composant layout complexe (Card, Modal)

```vue
<section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    Card Component
  </h2>

  <div class="space-y-6">
    <!-- Variants Grid -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Variants
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default">
          <h3 class="font-semibold mb-2">Default</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Shadow-md</p>
        </Card>
        <Card variant="bordered">
          <h3 class="font-semibold mb-2">Bordered</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">2px border</p>
        </Card>
        <!-- Autres variants -->
      </div>
    </div>

    <!-- Hoverable Demo -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Hoverable (hover me!)
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="default" hoverable>
          <h3 class="font-semibold mb-2">Hover Effect</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Lifts on hover
          </p>
        </Card>
      </div>
    </div>

    <!-- With Slots -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        With Header and Footer
      </h3>
      <Card variant="default">
        <template #header>
          <h3 class="font-semibold">Album Details</h3>
        </template>
        <p class="text-gray-600 dark:text-gray-400">
          Card content with structured layout
        </p>
        <template #footer>
          <div class="flex justify-between items-center">
            <Badge variant="primary" text="Progressive Rock" />
            <span class="text-sm text-gray-500">1973</span>
          </div>
        </template>
      </Card>
    </div>
  </div>
</section>
```

## Checklist de test visuel

Après avoir ajouté le composant, vérifier:

### Affichage
- [ ] Tous les variants s'affichent correctement
- [ ] Tous les sizes sont bien proportionnés
- [ ] Les couleurs respectent le design system
- [ ] Le dark mode fonctionne (si disponible)

### Responsive
- [ ] Desktop (1920x1080) : bon espacement
- [ ] Tablet (768x1024) : grids adaptées
- [ ] Mobile (375x667) : stack vertical correct

### Interactions
- [ ] Hover states visibles
- [ ] Click/focus states fonctionnels
- [ ] Disabled state visible et fonctionnel
- [ ] Loading state animé correctement

### Accessibilité
- [ ] Contraste suffisant (texte/fond)
- [ ] Focus visible au clavier (Tab)
- [ ] Labels présents et lisibles
- [ ] Erreurs clairement indiquées

### Performance
- [ ] Pas de lag au hover
- [ ] Transitions fluides
- [ ] Pas d'erreurs console
- [ ] Pas d'erreurs TypeScript

## Commit de la mise à jour

Après ajout du test visuel:

```bash
git add client/src/views/ComponentsTestView.vue
git commit -m "test(ui): add {NomComposant} visual tests

Added comprehensive visual tests for {NomComposant} component:
- All variants displayed
- All sizes demonstrated
- States and interactions shown
- Use case example with vinyl collection context

Test URL: http://localhost:5175/components-test"
```

Ou inclure dans commit du composant principal.

## Cas spéciaux

### Composant avec état complexe

Si le composant nécessite configuration complexe:

```typescript
<script setup lang="ts">
// État dédié pour le composant testé
const complexState = ref({
  value: '',
  options: [...],
  selectedItems: [],
  // etc.
})

const handleComplexEvent = (payload) => {
  // Logique de test
  console.log('Event received:', payload)
}
</script>
```

### Composant avec dépendances (store, API)

Si le composant dépend de Pinia ou API:

```vue
<script setup lang="ts">
// Mock data pour tests visuels
const mockAlbums = [
  { id: 1, title: 'Dark Side of the Moon', artist: 'Pink Floyd', year: 1973 },
  { id: 2, title: 'Wish You Were Here', artist: 'Pink Floyd', year: 1975 },
]

// Utiliser mock data au lieu de vraies données store
</script>

<template>
  <{NomComposant}
    v-for="album in mockAlbums"
    :key="album.id"
    :album="album"
  />
</template>
```

### Composant responsive complexe

Ajouter note explicative:

```vue
<div>
  <h3 class="...">Responsive Behavior</h3>
  <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
    Resize your window to see the mobile menu on smaller screens.
  </p>
  <{NomComposant} />
</div>
```

## Après ajout du test

Suggérer à l'utilisateur:
1. Ouvrir `http://localhost:5175/components-test`
2. Scroller jusqu'à la nouvelle section
3. Tester tous les variants/sizes/states
4. Tester responsive (réduire fenêtre)
5. Confirmer que tout fonctionne
6. Si OK, commit ou inclure dans commit du composant
