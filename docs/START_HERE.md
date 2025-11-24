# 🚀 COMMENCEZ ICI - Dolibarr MCP Server

Bienvenue ! Vous avez téléchargé le **Dolibarr MCP Server** complet.

## 📦 Ce que vous avez

Un serveur MCP prêt à l'emploi qui permet à Claude AI d'interagir avec votre Dolibarr ERP/CRM.

**⚠️ Note importante** : Ce serveur utilise le protocole **MCP** (Model Context Protocol) créé par **Anthropic** et est optimisé pour **Claude**. 

Pour utiliser avec **ChatGPT**, **Gemini** ou d'autres LLMs, consultez [COMPATIBILITY.md](COMPATIBILITY.md) qui explique les adaptateurs nécessaires.

**Fonctionnalités** :
- ✅ Intégration complète avec Dolibarr 22+
- ✅ 20+ outils MCP pour gérer vos données
- ✅ Support des webhooks pour notifications temps réel
- ✅ Documentation complète en français
- ✅ Script d'installation automatique
- ✅ Compatible macOS, Linux, Windows (WSL)

---

## ⚡ Démarrage ultra-rapide (10 minutes)

### Option 1 : Installation automatique (Recommandée)

**macOS / Linux** :

```bash
# 1. Ouvrir un terminal dans ce dossier
cd dolibarr-mcp-server

# 2. Lancer l'installation
bash setup.sh
```

Le script vous guidera à travers toute l'installation ! ✨

### Option 2 : Installation manuelle

Suivez le guide **QUICKSTART.md** pour une installation pas à pas.

---

## 📚 Documentation disponible

| Fichier | Description | Quand le lire |
|---------|-------------|---------------|
| **START_HERE.md** | 📍 Ce fichier - Vue d'ensemble | Commencez ici ! |
| **QUICKSTART.md** | ⚡ Démarrage en 10 min | Installation rapide |
| **INSTALL.md** | 📖 Guide détaillé | Si problèmes |
| **README.md** | 📘 Doc complète | Référence générale |
| **API.md** | 🔌 API Dolibarr détaillées | Comprendre les API |
| **COMPATIBILITY.md** | 🔄 Compatibilité MCP | ChatGPT/Gemini/autres |
| **WEBHOOK.md** | 🔔 Notifications | Fonctionnalités avancées |
| **CONTRIBUTING.md** | 🤝 Contribuer | Pour contribuer |
| **PROJECT_STRUCTURE.md** | 📁 Structure | Comprendre le code |

---

## 🎯 Ordre de lecture recommandé

### Pour commencer

1. **Ce fichier** (START_HERE.md) - Vue d'ensemble
2. **QUICKSTART.md** - Installation rapide
3. Testez avec Claude !

### Pour approfondir

4. **README.md** - Toutes les fonctionnalités
5. **WEBHOOK.md** - Webhooks si besoin

### Pour contribuer

6. **CONTRIBUTING.md** - Standards et processus
7. **PROJECT_STRUCTURE.md** - Architecture du code

---

## 📋 Prérequis rapides

Avant de commencer, assurez-vous d'avoir :

- [ ] **Dolibarr 22.0.0+** installé et accessible
- [ ] **Node.js 18.0.0+** ([nodejs.org](https://nodejs.org/))
- [ ] **Claude Desktop** ([claude.ai](https://claude.ai/))
- [ ] **Accès admin à Dolibarr** (pour activer l'API)
- [ ] **10 minutes** devant vous

---

## 🔧 Ce dont vous aurez besoin de Dolibarr

1. **URL de votre Dolibarr**  
   Exemple : `https://mon-dolibarr.com`

2. **Clé API**  
   À générer dans : Dolibarr → Utilisateurs → Votre utilisateur → Token → Générer

3. **Module API REST activé**  
   Dans : Dolibarr → Configuration → Modules → "API/Services Web REST"

---

## 🚀 Installation rapide (résumé)

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer
cp .env.example .env
nano .env  # Éditer avec vos valeurs

# 3. Tester
npm start

# 4. Configurer Claude Desktop
# Voir QUICKSTART.md section "Configuration de Claude Desktop"
```

---

## 🧪 Test de fonctionnement

Une fois installé, testez avec Claude :

```
# Dans Claude Desktop
"Liste mes clients Dolibarr"
"Combien de factures ai-je ?"
"Cherche le client ACME"
```

Si Claude répond avec vos vraies données Dolibarr → **Ça fonctionne !** 🎉

---

## 🆘 Besoin d'aide ?

### Problèmes courants

**"node: command not found"**
→ Installez Node.js : [nodejs.org](https://nodejs.org/)

**"Configuration manquante"**
→ Vérifiez que le fichier `.env` existe et contient vos valeurs

**"401 Unauthorized"**
→ Vérifiez votre clé API Dolibarr

**Claude ne voit pas le serveur**
→ Vérifiez le chemin dans `claude_desktop_config.json`

### Documentation détaillée

- **QUICKSTART.md** → Section "Dépannage rapide"
- **INSTALL.md** → Section "Dépannage"

### Support communauté

- 💬 [Forum Dolibarr](https://forums.dolibarr.org/)
- 🐛 [GitHub Issues](https://github.com/votre-username/dolibarr-mcp-server/issues)
- 📧 Email : support@example.com

---

## 🎯 Prochaines étapes

Une fois installé :

### Immédiatement
1. ✅ Testez les commandes de base
2. ✅ Explorez les capacités avec Claude
3. ✅ Lisez le README.md complet

### Cette semaine
4. ✅ Configurez les webhooks (WEBHOOK.md)
5. ✅ Personnalisez selon vos besoins
6. ✅ Intégrez dans votre workflow

### Ce mois
7. ✅ Automatisez des tâches répétitives
8. ✅ Créez des rapports avec Claude
9. ✅ Partagez votre expérience

---

## 🌟 Fonctionnalités principales

### Gestion des tiers
- Lister, créer, modifier des clients/fournisseurs
- Recherche avancée avec filtres

### Facturation
- Consulter et créer des factures
- Valider et suivre les paiements
- Analyser les impayés

### Propositions commerciales
- Créer et gérer des devis
- Suivre les signatures
- Convertir en factures

### Produits & Services
- Consulter le catalogue
- Rechercher des produits
- Vérifier les stocks

### Automatisation via webhooks
- Notifications en temps réel
- Déclenchement d'actions
- Intégrations tierces

---

## 📊 Structure du projet

```
dolibarr-mcp-server/
├── 📄 START_HERE.md          ← Vous êtes ici
├── 📄 QUICKSTART.md          ← Démarrage rapide
├── 📄 README.md              ← Documentation complète
├── 📄 INSTALL.md             ← Guide d'installation
├── 📄 WEBHOOK.md             ← Configuration webhooks
├── 🔧 index.js               ← Serveur MCP principal
├── 🔧 webhook-server.js      ← Serveur webhook
├── 🛠️ setup.sh               ← Installation automatique
├── 📦 package.json           ← Configuration npm
└── 🔐 .env.example           ← Template de config
```

---

## 🎓 Niveau de difficulté

- **Installation** : 🟢 Facile (10 minutes)
- **Configuration** : 🟡 Moyen (avec le guide)
- **Utilisation** : 🟢 Facile (conversationnel)
- **Personnalisation** : 🟠 Avancé (si modification du code)

---

## 🔐 Sécurité

**⚠️ Important** :

1. **Ne commitez JAMAIS le fichier `.env`** (contient vos secrets)
2. **Protégez votre clé API** comme un mot de passe
3. **Utilisez HTTPS en production** pour les webhooks
4. **Changez le WEBHOOK_SECRET** par défaut

---

## 📈 Après l'installation

### Partager votre expérience

- ⭐ Star le projet sur GitHub
- 💬 Rejoindre les discussions
- 📝 Partager vos cas d'usage
- 🐛 Signaler des bugs ou améliorations

### Contribuer

- Améliorer la documentation
- Ajouter de nouveaux outils MCP
- Corriger des bugs
- Traduire dans d'autres langues

Voir **CONTRIBUTING.md** pour plus de détails.

---

## 🎉 C'est parti !

Vous avez maintenant tout ce qu'il faut pour commencer.

**Prochaine étape** : Ouvrez **QUICKSTART.md** et lancez-vous !

---

## 💡 Astuce finale

La meilleure façon d'apprendre est de **tester directement avec Claude**.

Commencez par des questions simples :
- "Combien de clients ai-je ?"
- "Liste mes dernières factures"
- "Cherche le produit X"

Puis explorez les possibilités plus avancées :
- Créer des documents
- Analyser vos données
- Automatiser des workflows

---

**Bienvenue dans l'ère de l'ERP conversationnel !** 🚀

Made with ❤️ for the Dolibarr community
