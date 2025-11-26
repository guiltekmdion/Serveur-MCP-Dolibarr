# 🚀 Guide de Release - Serveur MCP Dolibarr

Ce document explique comment créer et publier de nouvelles versions du serveur MCP Dolibarr.

---

## 📋 Prérequis

- Git configuré avec accès push au repository
- Node.js 20+ installé
- Branche `main` à jour
- Aucune modification non commitée

---

## 🎯 Processus de Release

### Option 1: Script Automatique (Recommandé)

```bash
# 1. Assure-toi d'être sur main et à jour
git checkout main
git pull origin main

# 2. Mets à jour CHANGELOG.md
# Ajoute une section pour la nouvelle version

# 3. Lance le script de release
npm run release 1.3.0

# Le script va:
# - Vérifier que le repo est propre
# - Mettre à jour package.json
# - Valider que CHANGELOG.md contient la version
# - Builder le projet
# - Créer un commit + tag
# - Pousser vers GitHub
```

### Option 2: Manuel

```bash
# 1. Mise à jour de la version
npm version 1.3.0 -m "chore: release v1.3.0"

# 2. Mise à jour CHANGELOG.md
# Édite manuellement CHANGELOG.md

# 3. Commit du CHANGELOG
git add CHANGELOG.md
git commit -m "docs: update changelog for v1.3.0"

# 4. Créer le tag
git tag -a v1.3.0 -m "Release v1.3.0"

# 5. Push
git push origin main
git push origin v1.3.0
```

---

## 🤖 CI/CD Automatique

Dès que le tag `v*.*.*` est poussé sur GitHub, les workflows suivants se déclenchent automatiquement :

### 1. Tests & Build (`.github/workflows/ci.yml`)
- ✅ Compilation TypeScript
- ✅ Lint (validation syntaxe)
- ✅ Audit des paramètres API
- ✅ Build Docker

### 2. Release (`.github/workflows/release.yml`)
- 📦 Création de la GitHub Release
- 📝 Extraction des notes de version depuis CHANGELOG.md
- 🐳 Build et push image Docker vers `ghcr.io`
- 🏷️ Tags Docker : `latest` + `vX.Y.Z`

### 3. PR Validation (`.github/workflows/pr-validation.yml`)
- Validation automatique des Pull Requests
- Vérification fichiers sensibles (.env, logs/)
- Build Docker de test

---

## 📦 Versioning (Semantic Versioning)

Nous utilisons le [Semantic Versioning](https://semver.org/) :

```
MAJOR.MINOR.PATCH
  1  .  2  .  3
```

### Quand incrémenter ?

| Type | Version | Exemple | Quand ? |
|------|---------|---------|---------|
| **MAJOR** | X.0.0 | 1.0.0 → 2.0.0 | Breaking changes (incompatibilité) |
| **MINOR** | 0.X.0 | 1.2.0 → 1.3.0 | Nouvelles fonctionnalités (compatible) |
| **PATCH** | 0.0.X | 1.2.3 → 1.2.4 | Corrections de bugs |

### Exemples Concrets

**PATCH (1.2.3 → 1.2.4)**
- Correction bug add_proposal_line
- Fix gestion erreur 404
- Typo dans documentation

**MINOR (1.2.0 → 1.3.0)**
- Ajout module Permissions & Audit (9 outils)
- Nouveaux outils Calendar (7 outils)
- Nouvelles fonctionnalités sans casser l'existant

**MAJOR (1.x.x → 2.0.0)**
- Changement structure API (fk_product → productId)
- Suppression d'outils deprecated
- Migration architecture (STDIO → HTTP)

---

## 📝 Format CHANGELOG.md

Chaque release doit avoir une entrée dans `CHANGELOG.md` :

```markdown
## [1.3.0] - 2025-12-01

### 🎉 Ajouté
- Module Webhooks temps réel (5 nouveaux outils)
- Support export CSV en masse
- Dashboard BI intégré

### 🔧 Modifié
- Amélioration performances recherche (x2 plus rapide)
- Refonte gestion erreurs API

### 🐛 Corrigé
- Fix timeout sur requêtes longues
- Correction calcul TVA multi-devises

### 🗑️ Supprimé
- Outil `dolibarr_legacy_export` (deprecated depuis v1.0)
```

### Catégories

- **🎉 Ajouté** : Nouvelles fonctionnalités
- **🔧 Modifié** : Changements fonctionnalités existantes
- **🐛 Corrigé** : Corrections de bugs
- **🗑️ Supprimé** : Fonctionnalités retirées
- **⚠️ Déprécié** : Fonctionnalités bientôt supprimées
- **🔒 Sécurité** : Correctifs de vulnérabilités

---

## 🐳 Images Docker

### Registry GitHub Container

Après chaque release, l'image Docker est disponible sur :

```bash
# Dernière version stable
docker pull ghcr.io/guiltekmdion/mcp-dolibarr:latest

# Version spécifique
docker pull ghcr.io/guiltekmdion/mcp-dolibarr:v1.3.0
```

### Utilisation

```bash
docker run -d \
  --name dolibarr-mcp \
  -e DOLIBARR_URL=https://your-dolibarr.com \
  -e DOLIBARR_API_KEY=your_key \
  ghcr.io/guiltekmdion/mcp-dolibarr:latest
```

---

## ✅ Checklist Pre-Release

Avant de créer une release, vérifie que :

- [ ] Tous les commits sont sur `main`
- [ ] `CHANGELOG.md` contient une section pour la nouvelle version
- [ ] Tests passent : `npm test`
- [ ] Build réussit : `npm run build`
- [ ] Docker build OK : `docker build . -t test`
- [ ] Documentation à jour (`docs/`, `README.md`)
- [ ] Pas de fichiers sensibles (.env, logs/)
- [ ] Audit API sans erreurs critiques : `npm run audit:api`

---

## 🔄 Workflow Complet Exemple

```bash
# 1. Créer une branche feature
git checkout -b feature/webhooks

# 2. Développer + commit
git add .
git commit -m "feat: add webhooks module"

# 3. Pousser et créer PR
git push origin feature/webhooks
# → Créer PR sur GitHub

# 4. Review + Merge PR
# → CI valide automatiquement

# 5. Sur main, préparer release
git checkout main
git pull origin main

# 6. Mettre à jour CHANGELOG.md
vim CHANGELOG.md
git add CHANGELOG.md
git commit -m "docs: update changelog for v1.3.0"
git push origin main

# 7. Créer la release
npm run release 1.3.0

# 8. Vérifier sur GitHub
# → Actions : https://github.com/guiltekmdion/Serveur-MCP-Dolibarr/actions
# → Releases : https://github.com/guiltekmdion/Serveur-MCP-Dolibarr/releases
```

---

## 📊 Monitoring Post-Release

Après une release, vérifie :

1. **GitHub Actions** : Tous les workflows verts ✅
2. **GitHub Release** : Notes de version correctes
3. **Docker Registry** : Image disponible et taguée
4. **CHANGELOG** : Publié sur GitHub Release
5. **Issues** : Fermer les issues résolues par la release

---

## 🆘 Problèmes Courants

### "Tag already exists"
```bash
# Supprimer le tag local et remote
git tag -d v1.3.0
git push origin :refs/tags/v1.3.0

# Recréer
npm run release 1.3.0
```

### "CHANGELOG not updated"
```bash
# Le script vérifie que CHANGELOG contient ## [X.Y.Z]
# Ajoute la section avant de relancer
```

### "Repository not clean"
```bash
# Commit ou stash tes modifications
git status
git add .
git commit -m "fix: ..."
# ou
git stash
```

### "Docker build fails"
```bash
# Teste le build localement d'abord
docker build . -t test
```

---

## 📚 Ressources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---

## 🤝 Contribution

Pour contribuer :

1. Fork le projet
2. Crée une branche feature
3. Commit tes changements
4. Push et crée une PR
5. L'équipe review et merge

Les releases sont gérées uniquement par les mainteneurs du projet.

---

**Dernière mise à jour :** 26 novembre 2025  
**Mainteneur :** Guiltek (@guiltekmdion)
