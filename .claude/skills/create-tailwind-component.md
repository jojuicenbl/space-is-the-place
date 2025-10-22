# Skill: Create Tailwind Component

Crée un nouveau composant Vue 3 + Tailwind CSS suivant les standards du projet space-is-the-place.

## Contexte du projet

- **Stack**: Vue 3 + TypeScript + Tailwind CSS v3
- **Dossier composants**: `client/src/components/ui-tailwind/`
- **Design tokens**: Définis dans `client/tailwind.config.js`
- **Icônes**: Heroicons (`@heroicons/vue`)
- **Tests**: Page `client/src/views/ComponentsTestView.vue`

## Tâches à effectuer

### 1. Questions à poser à l'utilisateur

Avant de commencer, demander:
- Nom du composant (ex: "Select", "Modal", "Tooltip")?
- Type de composant (atomique/layout/métier)?
- Remplace quel composant Vuetify existant (si applicable)?
- Props attendues (liste des propriétés)?
- Variants nécessaires (ex: primary, secondary, outline)?
- Tailles nécessaires (sm, md, lg)?
- Slots requis (ex: header, footer, icon)?
- États spéciaux (loading, disabled, error)?

### 2. Créer le composant

Créer `client/src/components/ui-tailwind/{NomComposant}.vue` avec:

#### Structure TypeScript complète
```vue
<script setup lang="ts">
/**
 * {NomComposant} component - Tailwind CSS version
 * Remplace: {composant Vuetify si applicable}
 *
 * Features:
 * - Liste des features principales
 * - Support dark mode
 * - Responsive design
 */

import { computed } from 'vue'
// Import Heroicons si nécessaire
// import { IconName } from '@heroicons/vue/24/outline'

interface Props {
  variant?: 'primary' | 'secondary' // adapter selon besoin
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  // autres props...
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})

// defineEmits si le composant émet des événements
const emit = defineEmits<{
  click: [event: MouseEvent]
  // autres events...
}>()

// Classes CSS conditionnelles
const baseClasses = 'transition-all duration-200'

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
  // adapter selon variants nécessaires
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}
</script>

<template>
  <div
    :class="[
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
  >
    <slot />
  </div>
</template>
```

#### Standards obligatoires

1. **TypeScript strict**: Interface Props avec tous les types
2. **Dark mode**: Utiliser classes `dark:` pour tous les états
3. **Responsive**: Mobile-first avec breakpoints `sm:`, `md:`, `lg:`
4. **Accessibilité**:
   - ARIA attributes si nécessaire (`aria-label`, `aria-disabled`, etc.)
   - Support clavier pour éléments interactifs
   - Contrast ratio respecté
5. **Transitions**: `transition-all duration-200` pour animations fluides
6. **Pas de `<style>`**: Uniquement Tailwind utility classes
7. **Documentation**: Commentaire en-tête avec features et composant remplacé

### 3. Mettre à jour l'index d'export

Vérifier si `client/src/components/ui-tailwind/index.ts` existe:
- Si oui, ajouter l'export du nouveau composant
- Si non, créer le fichier avec exports

```typescript
export { default as Button } from './Button.vue'
export { default as Badge } from './Badge.vue'
export { default as Input } from './Input.vue'
export { default as {NouveauComposant} } from './{NouveauComposant}.vue'
// etc.
```

### 4. Ajouter au ComponentsTestView.vue

Ajouter une nouvelle section dans `client/src/views/ComponentsTestView.vue`:

```vue
<!-- {NomComposant} Component -->
<section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{NomComposant} Component</h2>

  <div class="space-y-6">
    <!-- Variants -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Variants</h3>
      <div class="flex flex-wrap gap-4">
        <!-- Exemples de chaque variant -->
      </div>
    </div>

    <!-- Sizes -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Sizes</h3>
      <div class="flex flex-wrap items-center gap-4">
        <!-- Exemples de chaque size -->
      </div>
    </div>

    <!-- States (si applicable) -->
    <!-- Use Cases réalistes -->
  </div>
</section>
```

### 5. Vérifier la compilation

Exécuter ces commandes pour vérifier:
```bash
cd client
npm run type-check  # Vérifier TypeScript
# Vérifier que le dev server compile sans erreurs
```

### 6. Test visuel

- Ouvrir `http://localhost:5175/components-test`
- Vérifier que le composant s'affiche correctement
- Tester tous les variants, sizes, states
- Tester responsive (réduire fenêtre)
- Tester dark mode (si disponible)

## Checklist finale

Avant de terminer, vérifier:
- [ ] Composant créé dans `ui-tailwind/`
- [ ] TypeScript: interface Props complète avec types
- [ ] Dark mode: toutes les classes ont variant `dark:`
- [ ] Responsive: breakpoints mobile/tablet/desktop
- [ ] Accessibilité: ARIA si nécessaire
- [ ] Documentation: commentaire en-tête complet
- [ ] Export ajouté à index.ts
- [ ] Section ajoutée à ComponentsTestView.vue
- [ ] Compilation TypeScript sans erreurs
- [ ] Test visuel réussi

## Design tokens disponibles

Référence `client/tailwind.config.js`:

**Couleurs principales**:
- `primary-{50-950}`: Bleu (défaut: sky blue)
- `secondary-{50-950}`: Violet/Fuchsia
- `gray-{50-950}`: Échelle de gris

**Espacements custom**:
- `18`, `88`, `100`, `112`, `128` (en rem)

**Border radius**:
- Standard: `rounded-{sm,md,lg,xl,2xl,3xl}`
- Custom: `rounded-4xl` (2rem)

**Shadows custom**:
- `shadow-soft`: Ombre douce
- `shadow-glow`: Glow bleu

**Fonts**:
- `font-sans`: Inter (default)
- `font-display`: Cal Sans (titres)

## Exemples de patterns courants

### Pattern: Composant avec icône
```vue
<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="flex items-center gap-2">
    <slot name="icon">
      <MagnifyingGlassIcon class="w-5 h-5" />
    </slot>
    <slot />
  </div>
</template>
```

### Pattern: États conditionnels
```vue
<script setup lang="ts">
const classes = computed(() => [
  baseClasses,
  variantClasses[props.variant],
  {
    'opacity-50 cursor-not-allowed': props.disabled,
    'ring-2 ring-red-500': props.error,
    'animate-pulse': props.loading,
  }
])
</script>
```

### Pattern: Émission d'événements
```vue
<script setup lang="ts">
const emit = defineEmits<{
  click: [event: MouseEvent]
  change: [value: string]
}>()

const handleClick = (e: MouseEvent) => {
  if (!props.disabled) {
    emit('click', e)
  }
}
</script>
```

## Notes importantes

- **Ne pas** utiliser de `<style scoped>` - uniquement Tailwind
- **Ne pas** créer de nouvelles couleurs - utiliser design tokens
- **Toujours** supporter le dark mode
- **Toujours** tester responsive
- **Préférer** composition (slots) à duplication de code
- **Documenter** les breaking changes si migration d'un composant existant

## Après création

Suggérer à l'utilisateur:
1. Tester le composant visuellement
2. Si satisfait, utiliser le skill `/commit-phase` pour commiter
3. Si c'est une migration, utiliser `/update-migration-plan` pour mettre à jour le tracking
