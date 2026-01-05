# 🚀 Quick Start : Modules Avancés

Guide de démarrage rapide pour les 4 nouveaux modules du Serveur MCP Dolibarr.

---

## 🔐 Permissions & Audit

### Scénario 1 : Créer un groupe "Commerciaux"

```typescript
// Créer le groupe
dolibarr_create_user_group({
  name: "Équipe Commerciale",
  note: "Accès complet aux propositions et factures"
})
// Retourne: { success: true, id: "5" }

// Ajouter des utilisateurs
dolibarr_add_user_to_group({
  group_id: "5",
  user_id: "17"
})

dolibarr_add_user_to_group({
  group_id: "5",
  user_id: "23"
})

// Définir les permissions
dolibarr_set_user_rights({
  user_id: "17",
  module: "propale",
  permission: "creer",
  value: "1"
})
```

### Scénario 2 : Audit des suppressions du mois

```typescript
const startOfMonth = Math.floor(new Date('2025-11-01').getTime() / 1000);
const endOfMonth = Math.floor(new Date('2025-11-30').getTime() / 1000);

dolibarr_get_audit_logs({
  action: "DELETE",
  date_start: startOfMonth,
  date_end: endOfMonth,
  limit: 100
})
```

---

## 🌍 Multi-entités & Devises

### Scénario 1 : Créer des filiales

```typescript
// Créer une filiale
dolibarr_create_entity({
  label: "Filiale Lyon",
  description: "Bureau régional Auvergne-Rhône-Alpes"
})

dolibarr_create_entity({
  label: "Filiale Canada",
  description: "Bureau international Montréal"
})

// Lister toutes les entités
dolibarr_list_entities({ limit: 50 })
```

### Scénario 2 : Facturation internationale

```typescript
// Obtenir le prix en devise locale
const montantUSD = 5000;

// Convertir en EUR
dolibarr_convert_currency({
  amount: montantUSD,
  from_currency: "USD",
  to_currency: "EUR"
})
// Retourne: { converted_amount: 4700, exchange_rate: 0.94, ... }

// Lister toutes les devises disponibles
dolibarr_list_currencies({ active: "1" })
```

---

## 📅 Calendrier & Absences

### Scénario 1 : Demande de congés

```typescript
// Créer une demande de congés (5 jours)
const debut = Math.floor(new Date('2025-12-20').getTime() / 1000);
const fin = Math.floor(new Date('2025-12-27').getTime() / 1000);

dolibarr_create_holiday({
  fk_user: "17",
  date_debut: debut,
  date_fin: fin,
  halfday: "0",
  description: "Vacances de Noël"
})
```

### Scénario 2 : Validation des congés en attente

```typescript
// Lister les demandes en attente
dolibarr_list_holidays({
  status: "2", // En attente de validation
  limit: 20
})
// Retourne: [{ id: "42", fk_user: "17", ... }]

// Approuver une demande
dolibarr_validate_holiday({
  id: "42",
  approve: true
})
```

### Scénario 3 : Réserver une salle de réunion

```typescript
const debut = Math.floor(new Date('2025-11-26 14:00').getTime() / 1000);
const fin = Math.floor(new Date('2025-11-26 16:00').getTime() / 1000);

dolibarr_create_resource_booking({
  resource_id: "3", // Salle de réunion Bordeaux
  user_id: "17",
  date_start: debut,
  date_end: fin,
  note: "Réunion stratégique Q4"
})

// Vérifier la disponibilité
dolibarr_list_resource_bookings({
  resource_id: "3"
})
```

---

## 💳 Abonnements SaaS

### Scénario 1 : Créer un abonnement mensuel

```typescript
const debut = Math.floor(new Date('2025-11-01').getTime() / 1000);

dolibarr_create_subscription({
  socid: "42", // ID du client
  fk_product: "17", // Produit "Abonnement Premium"
  date_start: debut,
  amount: 99.99,
  note: "Abonnement Premium - 1 an d'engagement",
  recurring: true,
  frequency: "monthly"
})
// Retourne: { success: true, id: "7", message: "Abonnement créé (récurrent)" }
```

### Scénario 2 : Calcul du MRR (Monthly Recurring Revenue)

```typescript
// Lister tous les abonnements actifs
dolibarr_list_subscriptions({
  status: "1", // Actifs
  limit: 1000
})

// Calculer le MRR
let mrr = 0;
subscriptions.forEach(sub => {
  if (sub.frequency === 'monthly') {
    mrr += sub.amount;
  } else if (sub.frequency === 'yearly') {
    mrr += sub.amount / 12;
  }
});

console.log(`MRR: ${mrr.toFixed(2)} €`);
```

### Scénario 3 : Renouvellement automatique

```typescript
// Lister les abonnements arrivant à échéance dans 30 jours
const in30days = Math.floor(Date.now() / 1000) + (30 * 24 * 3600);

const expiringSubscriptions = /* filtrer par date_end */;

// Renouveler automatiquement
expiringSubscriptions.forEach(sub => {
  dolibarr_renew_subscription({
    id: sub.id,
    duration: 12 // 12 mois
  });
});
```

### Scénario 4 : Gestion du churn

```typescript
// Client demande l'annulation
dolibarr_cancel_subscription({
  id: "7",
  note: "Client insatisfait - Raison: prix trop élevé"
})

// Calculer le taux de churn mensuel
const canceledThisMonth = /* Liste des annulations */;
const totalActive = /* Total abonnements actifs début de mois */;
const churnRate = (canceledThisMonth.length / totalActive) * 100;

console.log(`Taux de churn: ${churnRate.toFixed(2)}%`);
```

---

## 🎯 Workflows Avancés

### Workflow 1 : Onboarding Commercial Complet

```typescript
// 1. Créer l'utilisateur
dolibarr_create_user({ ... })
// id: "25"

// 2. L'ajouter au groupe "Commerciaux"
dolibarr_add_user_to_group({
  group_id: "5",
  user_id: "25"
})

// 3. Définir les permissions spécifiques
const modules = ['propale', 'facture', 'societe'];
modules.forEach(module => {
  dolibarr_set_user_rights({
    user_id: "25",
    module: module,
    permission: "creer",
    value: "1"
  });
});

// 4. Logger l'action
console.log("Onboarding terminé pour l'utilisateur 25");
```

### Workflow 2 : Consolidation Groupe Mensuel

```typescript
// 1. Lister toutes les filiales
const entities = await dolibarr_list_entities({});

// 2. Pour chaque filiale, récupérer le CA
let totalEUR = 0;

for (const entity of entities) {
  const ca = await getEntityRevenue(entity.id); // Fonction custom
  
  // Convertir en EUR si nécessaire
  const result = await dolibarr_convert_currency({
    amount: ca.amount,
    from_currency: ca.currency,
    to_currency: "EUR"
  });
  
  totalEUR += result.converted_amount;
}

console.log(`CA Groupe: ${totalEUR.toFixed(2)} €`);
```

### Workflow 3 : Planning Équipe

```typescript
// 1. Lister les absences de la semaine
const startOfWeek = /* Date */;
const endOfWeek = /* Date */;

const absences = await dolibarr_list_holidays({
  status: "3", // Approuvées
  date_start: startOfWeek,
  date_end: endOfWeek
});

// 2. Lister les réservations de ressources
const bookings = await dolibarr_list_resource_bookings({});

// 3. Générer le planning
console.log("Planning de la semaine:");
absences.forEach(a => console.log(`- ${a.user_name}: Congé`));
bookings.forEach(b => console.log(`- ${b.resource_name}: Réservé par ${b.user_name}`));
```

---

## 📊 KPIs & Reporting

### KPIs Permissions

```typescript
// Nombre d'utilisateurs par groupe
const groups = await dolibarr_list_user_groups({});
groups.forEach(g => {
  console.log(`${g.name}: ${g.members?.length || 0} membres`);
});

// Audit de sécurité : Actions critiques du jour
const today = Math.floor(Date.now() / 1000);
const criticalActions = await dolibarr_get_audit_logs({
  action: "DELETE",
  date_start: today - 86400,
  limit: 50
});
```

### KPIs Abonnements

```typescript
// MRR, ARR, Taux de churn
const subscriptions = await dolibarr_list_subscriptions({ status: "1" });

const mrr = calculateMRR(subscriptions);
const arr = mrr * 12;
const churnRate = calculateChurn(subscriptions);

console.log(`MRR: ${mrr} €`);
console.log(`ARR: ${arr} €`);
console.log(`Churn: ${churnRate}%`);
```

---

## ⚠️ Bonnes Pratiques

### Sécurité

```typescript
// ✅ BON : Vérifier les permissions avant d'accorder
if (user.role === 'manager') {
  dolibarr_set_user_rights({
    user_id: user.id,
    module: "facture",
    permission: "valider",
    value: "1"
  });
}

// ❌ MAUVAIS : Accorder toutes les permissions à tout le monde
```

### Performance

```typescript
// ✅ BON : Utiliser des limites raisonnables
dolibarr_list_subscriptions({ limit: 100 });

// ❌ MAUVAIS : Récupérer toute la base
dolibarr_list_subscriptions({ limit: 999999 });
```

### Audit

```typescript
// ✅ BON : Logger les actions importantes
dolibarr_get_audit_logs({
  action: "DELETE",
  limit: 100
});

// ✅ BON : Automatiser les alertes sur actions critiques
if (log.action === 'DELETE' && log.object_type === 'invoice') {
  sendAlert("Facture supprimée!");
}
```

---

## 🆘 Troubleshooting

### Problème : "Module non activé"

**Solution :** Vérifier que le module Dolibarr est activé :
- Permissions → Module "Groups"
- Absences → Module "Holidays"
- Ressources → Module "Resource"
- Abonnements → Module "Subscriptions" ou "Members"

### Problème : "Devise non trouvée"

**Solution :** Activer les devises dans Dolibarr :
```
Configuration → Dictionnaires → Devises → Activer EUR, USD, GBP, etc.
```

### Problème : "Permission refusée"

**Solution :** Vérifier le token API :
```
Le token doit avoir les permissions suffisantes pour gérer les utilisateurs et groupes
```

---

## 📚 Ressources

- [Documentation complète](./docs/ADVANCED-MODULES.md)
- [API Dolibarr](https://wiki.dolibarr.org/index.php/REST_API)
- [Exemples de cas d'usage](./docs/50-USE-CASES.md)

---

**Prêt à utiliser les 212 outils MCP Dolibarr ! 🚀**
