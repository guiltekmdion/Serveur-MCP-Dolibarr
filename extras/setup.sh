#!/bin/bash

###############################################################################
# Script d'installation automatique - Dolibarr MCP Server
# 
# Ce script facilite l'installation et la configuration du serveur MCP
# Compatible avec macOS et Linux
#
# Usage: bash setup.sh
###############################################################################

set -e  # Arrêt en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_header() {
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Fonction pour demander une confirmation
confirm() {
    read -p "$1 [o/N] " response
    case "$response" in
        [oO][uU][iI]|[oO]|[yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Détection du système d'exploitation
detect_os() {
    case "$OSTYPE" in
        darwin*)  OS="macOS" ;;
        linux*)   OS="Linux" ;;
        *)        OS="Unknown" ;;
    esac
}

# Vérification de Node.js
check_nodejs() {
    print_header "Vérification de Node.js"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js est installé: $NODE_VERSION"
        
        # Vérifier la version (doit être >= 18)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 ou supérieure est requise"
            print_info "Version actuelle: $NODE_VERSION"
            
            if confirm "Voulez-vous voir les instructions d'installation ?"; then
                echo ""
                echo "Pour mettre à jour Node.js:"
                if [ "$OS" = "macOS" ]; then
                    echo "  brew install node"
                elif [ "$OS" = "Linux" ]; then
                    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
                    echo "  sudo apt-get install -y nodejs"
                fi
                echo ""
                exit 1
            fi
        fi
    else
        print_error "Node.js n'est pas installé"
        echo ""
        echo "Installez Node.js depuis:"
        echo "  - https://nodejs.org/"
        if [ "$OS" = "macOS" ]; then
            echo "  - ou avec Homebrew: brew install node"
        elif [ "$OS" = "Linux" ]; then
            echo "  - ou avec: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
            echo "            sudo apt-get install -y nodejs"
        fi
        echo ""
        exit 1
    fi
}

# Installation des dépendances
install_dependencies() {
    print_header "Installation des dépendances"
    
    if [ -f "package.json" ]; then
        print_info "Installation des packages npm..."
        npm install
        print_success "Dépendances installées"
    else
        print_error "package.json introuvable"
        exit 1
    fi
}

# Configuration du fichier .env
setup_env_file() {
    print_header "Configuration du fichier .env"
    
    if [ -f ".env" ]; then
        print_warning "Le fichier .env existe déjà"
        if ! confirm "Voulez-vous le reconfigurer ?"; then
            return
        fi
    fi
    
    # Copier le template
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Fichier .env créé depuis .env.example"
    else
        print_error ".env.example introuvable"
        exit 1
    fi
    
    echo ""
    print_info "Configuration de Dolibarr"
    echo ""
    
    # Demander l'URL Dolibarr
    read -p "URL de votre Dolibarr (ex: https://mon-dolibarr.com): " DOLIBARR_URL
    
    # Demander la clé API
    echo ""
    print_info "Pour obtenir une clé API:"
    print_info "1. Connectez-vous à Dolibarr"
    print_info "2. Allez dans Utilisateurs → Votre utilisateur → Token"
    print_info "3. Cliquez sur 'Générer'"
    echo ""
    read -p "Clé API Dolibarr: " DOLIBARR_API_KEY
    
    # Remplacer dans .env
    if [ "$OS" = "macOS" ]; then
        sed -i '' "s|DOLIBARR_URL=.*|DOLIBARR_URL=$DOLIBARR_URL|" .env
        sed -i '' "s|DOLIBARR_API_KEY=.*|DOLIBARR_API_KEY=$DOLIBARR_API_KEY|" .env
    else
        sed -i "s|DOLIBARR_URL=.*|DOLIBARR_URL=$DOLIBARR_URL|" .env
        sed -i "s|DOLIBARR_API_KEY=.*|DOLIBARR_API_KEY=$DOLIBARR_API_KEY|" .env
    fi
    
    print_success "Configuration .env terminée"
    
    # Configuration webhook (optionnel)
    echo ""
    if confirm "Voulez-vous configurer les webhooks maintenant ?"; then
        echo ""
        print_info "Génération d'un secret webhook sécurisé..."
        WEBHOOK_SECRET=$(openssl rand -hex 32)
        
        if [ "$OS" = "macOS" ]; then
            sed -i '' "s|WEBHOOK_SECRET=.*|WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env
        else
            sed -i "s|WEBHOOK_SECRET=.*|WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env
        fi
        
        print_success "Secret webhook généré"
        print_info "Configurez ce secret dans Dolibarr: $WEBHOOK_SECRET"
    fi
}

# Test de connexion
test_connection() {
    print_header "Test de connexion à Dolibarr"
    
    print_info "Démarrage du serveur MCP pour test..."
    
    # Lancer le serveur en arrière-plan
    timeout 10 npm start > /tmp/mcp-test.log 2>&1 &
    MCP_PID=$!
    
    # Attendre un peu
    sleep 3
    
    # Vérifier les logs
    if grep -q "Connexion réussie" /tmp/mcp-test.log; then
        print_success "Connexion à Dolibarr réussie !"
    else
        print_error "Échec de connexion à Dolibarr"
        print_info "Vérifiez les logs ci-dessous:"
        echo ""
        cat /tmp/mcp-test.log
        echo ""
        kill $MCP_PID 2>/dev/null || true
        exit 1
    fi
    
    # Arrêter le serveur
    kill $MCP_PID 2>/dev/null || true
    rm -f /tmp/mcp-test.log
}

# Configuration de Claude Desktop
setup_claude_desktop() {
    print_header "Configuration de Claude Desktop"
    
    # Déterminer le chemin du fichier de config
    if [ "$OS" = "macOS" ]; then
        CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    else
        CLAUDE_CONFIG="$HOME/.config/Claude/claude_desktop_config.json"
    fi
    
    # Créer le dossier si nécessaire
    mkdir -p "$(dirname "$CLAUDE_CONFIG")"
    
    # Chemin absolu du projet
    PROJECT_PATH=$(pwd)
    
    print_info "Configuration à ajouter dans Claude Desktop:"
    echo ""
    echo "Fichier: $CLAUDE_CONFIG"
    echo ""
    echo '{'
    echo '  "mcpServers": {'
    echo '    "dolibarr": {'
    echo '      "command": "node",'
    echo "      \"args\": [\"$PROJECT_PATH/index.js\"],"
    echo '      "env": {'
    echo "        \"DOLIBARR_URL\": \"$(grep DOLIBARR_URL .env | cut -d'=' -f2)\","
    echo "        \"DOLIBARR_API_KEY\": \"$(grep DOLIBARR_API_KEY .env | cut -d'=' -f2)\""
    echo '      }'
    echo '    }'
    echo '  }'
    echo '}'
    echo ""
    
    if confirm "Voulez-vous que je crée/mette à jour automatiquement ce fichier ?"; then
        # Créer la configuration
        cat > "$CLAUDE_CONFIG" << EOF
{
  "mcpServers": {
    "dolibarr": {
      "command": "node",
      "args": ["$PROJECT_PATH/index.js"],
      "env": {
        "DOLIBARR_URL": "$(grep DOLIBARR_URL .env | cut -d'=' -f2)",
        "DOLIBARR_API_KEY": "$(grep DOLIBARR_API_KEY .env | cut -d'=' -f2)"
      }
    }
  }
}
EOF
        print_success "Configuration Claude Desktop créée: $CLAUDE_CONFIG"
        print_warning "Redémarrez Claude Desktop pour appliquer les changements"
    else
        print_info "Copiez manuellement la configuration ci-dessus dans:"
        print_info "$CLAUDE_CONFIG"
    fi
}

# Instructions finales
print_final_instructions() {
    print_header "Installation terminée ! 🎉"
    
    echo ""
    print_success "Le serveur MCP Dolibarr est configuré"
    echo ""
    print_info "Prochaines étapes:"
    echo ""
    echo "1. Redémarrez Claude Desktop complètement"
    echo "2. Ouvrez une nouvelle conversation"
    echo "3. Testez avec: 'Liste mes clients Dolibarr'"
    echo ""
    print_info "Pour démarrer le serveur manuellement:"
    echo "   npm start"
    echo ""
    print_info "Pour démarrer le serveur webhook:"
    echo "   npm run webhook"
    echo ""
    print_info "Documentation complète:"
    echo "   - README.md      : Documentation générale"
    echo "   - INSTALL.md     : Guide d'installation détaillé"
    echo "   - QUICKSTART.md  : Démarrage rapide"
    echo "   - WEBHOOK.md     : Configuration des webhooks"
    echo ""
    print_success "Bon usage de Dolibarr MCP Server !"
    echo ""
}

# Script principal
main() {
    clear
    print_header "Installation de Dolibarr MCP Server"
    echo ""
    
    # Détection OS
    detect_os
    print_info "Système détecté: $OS"
    echo ""
    
    # Vérifications
    check_nodejs
    echo ""
    
    # Installation
    install_dependencies
    echo ""
    
    # Configuration
    setup_env_file
    echo ""
    
    # Test
    test_connection
    echo ""
    
    # Configuration Claude
    setup_claude_desktop
    echo ""
    
    # Instructions finales
    print_final_instructions
}

# Exécution
main
