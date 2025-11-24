## Description

<!-- Brief description of changes -->

## Type de changement

- [ ] 🐛 Bug fix (non-breaking change)
- [ ] ✨ Nouvelle fonctionnalité (non-breaking change)
- [ ] 💥 Breaking change (fix ou feature qui casse la compatibilité)
- [ ] ♻️ Refactoring (amélioration du code sans changement fonctionnel)
- [ ] 📝 Documentation
- [ ] ⚡ Performance
- [ ] 🎨 UI/UX

## Checklist

### Code Quality
- [ ] **Types TypeScript** : Pas d'`any` non justifié, tous les types compilent
- [ ] **DRY** : Les utilitaires réutilisables sont centralisés (pas de duplication de code)
- [ ] **Tests** : Tests unitaires ajoutés/mis à jour (si applicable)
- [ ] **Tests passent** : `npm test` réussit
- [ ] **Build** : `npm run build` compile sans erreur
- [ ] **Lint** : Pas d'erreurs ESLint critiques

### Documentation
- [ ] **Code commenté** : Fonctions complexes documentées
- [ ] **README/doc** : Documentation mise à jour si changements API
- [ ] **REFACTORING.md** : Créé si refactoring majeur

### Performance (si applicable)
- [ ] **Lighthouse** : Report Lighthouse joint si changements frontend
- [ ] **Pas de régression** : Tests manuels effectués
- [ ] **Bundle size** : Vérifié si changements client

### Git
- [ ] **Branche depuis dev** : Créée depuis `dev` (pas `main`)
- [ ] **Commits clairs** : Messages de commit descriptifs
- [ ] **Conflit résolu** : Pas de conflits avec `dev`

## Tests effectués

<!-- Décrire les tests manuels/automatiques effectués -->

- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests manuels sur environnement local

## Screenshots (si UI)

<!-- Ajouter des screenshots si changements visuels -->

## Impact

### Breaking Changes
<!-- Lister les breaking changes s'il y en a -->

### Migrations nécessaires
<!-- Actions nécessaires après merge (DB migrations, config changes, etc.) -->

## Critères d'acceptation

<!-- Checklist spécifique à cette PR -->

- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

## Notes pour les reviewers

<!-- Informations utiles pour la review -->
