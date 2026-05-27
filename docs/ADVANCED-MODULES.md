# 📚 Nouveaux Modules Avancés - Dolibarr MCP

## 🔐 Gestion des Droits & Permissions

### Groupes d'utilisateurs

#### `dolibarr_list_user_groups`
Liste tous les groupes d'utilisateurs configurés dans Dolibarr.

**Cas d'usage :**
- Auditer la structure de permissions
- Préparer l'affectation d'un nouvel utilisateur
- Générer un rapport de conformité

**Exemple :**
```json
{
  "limit": 50
}
```

#### `dolibarr_create_user_group`
Crée un nouveau groupe d'utilisateurs pour gérer les permissions collectivement.

**Cas d'usage :**
- Créer un groupe "Commerciaux Région Nord"
- Structurer les équipes par département
- Isoler les permissions pour un projet sensible

**Exemple :**
```json
{
  "name": "Managers Projets",
  "note": "Groupe pour les chefs de projets avec accès complet"
}
```

#### `dolibarr_add_user_to_group`
Ajoute un utilisateur à un groupe. L'utilisateur hérite automatiquement des permissions du groupe.

**Exemple :**
```json
{
  "group_id": "42",
  "user_id": "17"
}
```

#### `dolibarr_set_user_rights`
Définit une permission spécifique pour un utilisateur sur un module.

**Modules fréquents :**
- `societe` : Tiers/Clients
- `facture` : Factures
- `propale` : Propositions commerciales
- `projet` : Projets
- `fournisseur` : Fournisseurs
- `banque` : Banques
- `comptabilite` : Comptabilité

**Permissions :**
- `lire` : Consulter
- `creer` : Créer
- `modifier` : Modifier
- `supprimer` : Supprimer
- `valider` : Valider/Approuver

**Exemple :**
```json
{
  "user_id": "17",
  "module": "facture",
  "permission": "valider",
  "value": "1"
}
```

### Audit & Traçabilité

#### `dolibarr_get_audit_logs`
Récupère les journaux d'audit pour la conformité (RGPD, ISO, etc.).

**Actions possibles :**
- `CREATE` : Création d'objets
- `UPDATE` : Modification
- `DELETE` : Suppression
- `LOGIN` : Connexion utilisateur
- `VALIDATE` : Validation de documents
- `PAYMENT` : Enregistrement de paiements

**Cas d'usage :**
- Audit de sécurité
- Investigation suite à un incident
- Rapport de conformité RGPD
- Analyse d'activité par utilisateur

**Exemple :**
```json
{
  "user_id": "17",
  "action": "DELETE",
  "date_start": 1732579200,
  "date_end": 1732665600,
  "limit": 100
}
```

---

## 🌍 Multi-entités & Multi-devises

### Gestion des Entités (Filiales)

#### `dolibarr_list_entities`
Liste toutes les entités de l'instance Dolibarr (nécessite le module Multi-Company).

**Cas d'usage :**
- Consolidation financière d'un groupe
- Reporting multi-sociétés
- Gestion de filiales internationales

#### `dolibarr_create_entity`
Crée une nouvelle entité pour gérer plusieurs sociétés dans une seule instance.

**Exemple :**
```json
{
  "label": "Filiale Paris Ouest",
  "description": "Succursale couvrant les départements 75, 92, 78"
}
```

### Conversions de Devises

#### `dolibarr_list_currencies`
Liste toutes les devises disponibles (EUR, USD, GBP, JPY, etc.).

**Exemple :**
```json
{
  "active": "1"
}
```

#### `dolibarr_convert_currency`
Convertit un montant d'une devise vers une autre en utilisant les taux de change configurés.

**Cas d'usage :**
- Facturation internationale
- Consolidation financière multi-devises
- Calcul de commissions export
- Reporting groupe en devise de référence

**Exemple :**
```json
{
  "amount": 15000,
  "from_currency": "USD",
  "to_currency": "EUR",
  "date": 1732579200
}
```

**Réponse :**
```json
{
  "original_amount": 15000,
  "original_currency": "USD",
  "converted_amount": 14100.50,
  "target_currency": "EUR",
  "exchange_rate": 0.94,
  "date": 1732579200
}
```

---

## 📅 Calendrier, Absences & Planning

### Gestion des Congés

#### `dolibarr_list_holidays`
Liste les demandes de congés avec filtres avancés.

**Statuts :**
- `1` : Brouillon
- `2` : Validée (en attente d'approbation)
- `3` : Approuvée
- `4` : Refusée
- `5` : Annulée

**Cas d'usage :**
- Planning des équipes
- Validation des demandes de congés
- Calcul des soldes de CP/RTT
- Export pour la paie

**Exemple :**
```json
{
  "user_id": "17",
  "status": "2",
  "year": 2024,
  "limit": 50
}
```

#### `dolibarr_create_holiday`
Crée une demande de congé pour un utilisateur.

**Types de demi-journées :**
- `0` : Journée entière
- `1` : Matin seulement
- `2` : Après-midi seulement

**Exemple :**
```json
{
  "fk_user": "17",
  "date_debut": 1735689600,
  "date_fin": 1736294400,
  "halfday": "0",
  "fk_type": "1",
  "description": "Vacances d'été"
}
```

#### `dolibarr_validate_holiday`
Approuve ou refuse une demande de congé.

**Exemple :**
```json
{
  "id": "42",
  "approve": true
}
```

### Réservation de Ressources

#### `dolibarr_create_resource_booking`
Réserve une ressource (salle de réunion, véhicule, équipement) pour un utilisateur.

**Cas d'usage :**
- Réservation de salles de réunion
- Planning des véhicules de société
- Gestion du matériel informatique
- Réservation d'équipements techniques

**Exemple :**
```json
{
  "resource_id": "5",
  "user_id": "17",
  "date_start": 1732608000,
  "date_end": 1732615200,
  "note": "Réunion client - Salle Bordeaux"
}
```

#### `dolibarr_list_resource_bookings`
Liste les réservations avec possibilité de filtrer par ressource ou utilisateur.

**Exemple :**
```json
{
  "resource_id": "5"
}
```

---

## 💳 Gestion des Abonnements (Subscriptions)

### Abonnements Récurrents

#### `dolibarr_list_subscriptions`
Liste tous les abonnements actifs, expirés ou annulés.

**Statuts :**
- `0` : Brouillon
- `1` : Validé (actif)
- `-1` : Annulé

**Cas d'usage :**
- Suivi des revenus récurrents (MRR/ARR)
- Prévisions de trésorerie
- Détection des abonnements à renouveler
- Analyse du churn

**Exemple :**
```json
{
  "status": "1",
  "limit": 100
}
```

#### `dolibarr_create_subscription`
Crée un nouvel abonnement pour un tiers/client.

**Fréquences de facturation :**
- `monthly` : Mensuel
- `quarterly` : Trimestriel
- `yearly` : Annuel

**Cas d'usage :**
- Abonnement SaaS
- Licence logicielle annuelle
- Maintenance récurrente
- Service d'hébergement

**Exemple :**
```json
{
  "socid": "42",
  "fk_product": "17",
  "date_start": 1732579200,
  "amount": 99.99,
  "note": "Abonnement Premium - Engagement 12 mois",
  "recurring": true,
  "frequency": "monthly"
}
```

#### `dolibarr_renew_subscription`
Renouvelle automatiquement un abonnement existant.

**Cas d'usage :**
- Renouvellement automatique en fin de période
- Extension d'abonnement suite à un upgrade
- Prolongation après résolution d'un incident de paiement

**Exemple :**
```json
{
  "id": "42",
  "duration": 12
}
```

#### `dolibarr_cancel_subscription`
Annule un abonnement actif (churn).

**Cas d'usage :**
- Résiliation à la demande du client
- Défaut de paiement
- Migration vers une autre offre

**Exemple :**
```json
{
  "id": "42",
  "note": "Client insatisfait du service - Résiliation immédiate"
}
```

---

## 🎯 Cas d'Usage Avancés

### Scénario 1 : Onboarding d'un nouveau commercial

```
1. Créer un groupe "Commerciaux" si non existant
2. Créer l'utilisateur
3. L'ajouter au groupe "Commerciaux"
4. Définir les permissions spécifiques (lire propales, créer factures)
5. Logger l'audit
```

### Scénario 2 : Consolidation financière groupe international

```
1. Lister toutes les entités (filiales)
2. Pour chaque entité :
   - Récupérer le CA en devise locale
   - Convertir vers EUR (devise de référence)
   - Consolider les montants
3. Générer le rapport groupe
```

### Scénario 3 : Gestion des congés d'équipe

```
1. Lister les demandes de congés en attente (status=2)
2. Vérifier la disponibilité de l'équipe
3. Approuver ou refuser chaque demande
4. Mettre à jour le planning des ressources
5. Notifier les utilisateurs
```

### Scénario 4 : Analyse de revenus récurrents (SaaS)

```
1. Lister tous les abonnements actifs
2. Calculer le MRR (Monthly Recurring Revenue)
3. Identifier les abonnements arrivant à échéance
4. Détecter les risques de churn
5. Préparer les actions de rétention
```

---

## 📊 Statistiques & KPIs

### KPIs Permissions
- Nombre d'utilisateurs par groupe
- Permissions les plus utilisées
- Dernières modifications de droits
- Taux de conformité des accès

### KPIs Multi-entités
- Revenus par entité
- Répartition géographique du CA
- Performance des filiales
- Impact des variations de change

### KPIs Calendrier
- Taux d'absence par équipe
- Soldes de congés
- Taux d'occupation des ressources
- Délai moyen d'approbation des congés

### KPIs Abonnements
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Taux de churn mensuel
- LTV (Lifetime Value)
- Taux de renouvellement

---

## ⚠️ Notes Importantes

### Modules Requis

**Pour les permissions avancées :**
- Dolibarr >= 15.0
- Module "Groups" activé

**Pour le multi-entités :**
- Module "Multi-Company" (optionnel mais recommandé)
- Configuration des devises dans Setup > Dictionnaires

**Pour les absences :**
- Module "Holidays" activé
- Configuration des types de congés (CP, RTT, Maladie, etc.)

**Pour les ressources :**
- Module "Resource" activé
- Ressources créées dans la base (salles, véhicules, équipements)

**Pour les abonnements :**
- Module "Subscriptions" activé (ou module Members selon version)
- Configuration des produits/services récurrents

### Compatibilité API

Certains endpoints peuvent varier selon la version Dolibarr :
- Permissions détaillées : >= 13.0
- Multi-entités : >= 14.0 (avec module externe)
- Absences : >= 10.0
- Abonnements : >= 12.0

### Sécurité

**Audit Logs :**
- Conservez au minimum 1 an pour conformité
- Protégez l'accès aux logs (données sensibles)
- Automatisez les alertes sur actions critiques

**Permissions :**
- Principe du moindre privilège
- Revue trimestrielle des droits
- Séparation des tâches (SOD)

**Multi-devises :**
- Mettez à jour les taux de change quotidiennement
- Auditez les écarts de conversion
- Documentez les ajustements manuels

---

## 🚀 Prochaines Améliorations

1. **Webhooks & Notifications temps réel**
2. **Automatisation des workflows**
3. **Import/Export CSV en masse**
4. **Templates d'emails personnalisables**
5. **Dashboards BI intégrés**

---

**Total des outils MCP Dolibarr : ~105 outils**

**Modules couverts : 20+**
- CRM & Ventes
- Projets & Tâches
- Finance & Comptabilité
- RH & Absences
- Abonnements & Récurrence
- Multi-entités & Devises
- Permissions & Audit
- Documents & Génération PDF
- Statistiques & Reporting
