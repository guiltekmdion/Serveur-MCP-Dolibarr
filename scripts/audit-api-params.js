/**
 * 🔍 AUDIT DES PARAMÈTRES API DOLIBARR
 * 
 * Ce script vérifie que tous les schémas Zod utilisent
 * les bons noms de paramètres conformes à l'API Dolibarr
 */

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║  🔍 AUDIT PARAMÈTRES API DOLIBARR                    ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

/**
 * CONVENTIONS API DOLIBARR
 */
const DOLIBARR_CONVENTIONS = {
  // Relations (Foreign Keys)
  foreignKeys: {
    correct: ['fk_product', 'fk_project', 'fk_user', 'fk_warehouse', 'fk_socid'],
    incorrect: ['product_id', 'project_id', 'user_id', 'warehouse_id', 'socid_id'],
    exception: ['socid'], // Exception: socid sans fk_ est correct
  },
  
  // Prix
  prices: {
    // Pour PRODUITS (création/mise à jour)
    product: {
      correct: ['price', 'price_min', 'price_base_type'],
      context: 'Création/MAJ produit → utilise "price"',
    },
    // Pour LIGNES de documents (propositions, commandes, factures)
    lines: {
      correct: ['subprice', 'price_ht', 'total_ht'],
      incorrect: ['price'], // Sur les lignes, c'est SUBPRICE
      context: 'Lignes documents → utilise "subprice" (prix unitaire)',
    },
  },
  
  // Dates
  dates: {
    correct: ['date', 'datec', 'datem', 'date_start', 'date_end', 'date_creation'],
    format: 'Unix timestamp (number)',
  },
  
  // Statuts
  status: {
    correct: ['status', 'statut'], // Les deux existent
    values: 'String enum: "0", "1", etc.',
  },
};

/**
 * RÈGLES DE VALIDATION
 */
const VALIDATION_RULES = [
  {
    name: '1️⃣  Foreign Keys (fk_*)',
    description: 'Relations vers autres objets doivent utiliser fk_*',
    check: (code) => {
      const incorrectMatches = code.match(/product_id|project_id|user_id(?!:)/g);
      const correctMatches = code.match(/fk_product|fk_project|fk_user/g);
      return {
        hasIssues: incorrectMatches && incorrectMatches.length > 0,
        incorrectCount: incorrectMatches ? incorrectMatches.length : 0,
        correctCount: correctMatches ? correctMatches.length : 0,
        details: incorrectMatches,
      };
    },
  },
  {
    name: '2️⃣  Prix sur lignes (subprice)',
    description: 'Lignes de documents doivent utiliser subprice, pas price',
    check: (code) => {
      // Rechercher les schémas de lignes qui utilisent "price"
      const lineSchemas = code.match(/Line.*Schema.*?\{[\s\S]*?\}/g) || [];
      const issues = [];
      
      lineSchemas.forEach(schema => {
        if (schema.includes('price:') && !schema.includes('subprice')) {
          issues.push(schema.substring(0, 50) + '...');
        }
      });
      
      return {
        hasIssues: issues.length > 0,
        incorrectCount: issues.length,
        details: issues,
      };
    },
  },
  {
    name: '3️⃣  Gestion 404 vide',
    description: 'Recherches doivent retourner [] sur 404, pas exception',
    check: (code) => {
      const searchMethods = code.match(/async search\w+\([\s\S]*?\}/g) || [];
      const missing404Handling = [];
      
      searchMethods.forEach(method => {
        if (!method.includes('404') && !method.includes('status === 404')) {
          const methodName = method.match(/search\w+/)?.[0];
          if (methodName) missing404Handling.push(methodName);
        }
      });
      
      return {
        hasIssues: missing404Handling.length > 0,
        incorrectCount: missing404Handling.length,
        details: missing404Handling,
      };
    },
  },
  {
    name: '4️⃣  Types de dates',
    description: 'Dates doivent être number (timestamps Unix)',
    check: (code) => {
      // Rechercher les définitions de date qui ne sont pas number
      const dateFields = code.match(/date\w*:\s*z\.(string|date)/gi) || [];
      return {
        hasIssues: dateFields.length > 0,
        incorrectCount: dateFields.length,
        details: dateFields,
      };
    },
  },
];

/**
 * EXÉCUTION DE L'AUDIT
 */
import fs from 'fs';
import path from 'path';

console.log('📂 Lecture des fichiers sources...\n');

const filesToAudit = [
  'src/types/index.ts',
  'src/services/dolibarr.ts',
  'src/tools/proposals.ts',
  'src/tools/orders-invoices-products.ts',
  'src/tools/thirdparties.ts',
];

let totalIssues = 0;
const issuesByFile = {};

filesToAudit.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath} - Non trouvé`);
    return;
  }
  
  const code = fs.readFileSync(fullPath, 'utf-8');
  const fileIssues = [];
  
  console.log(`\n📄 ${filePath}`);
  console.log('─'.repeat(60));
  
  VALIDATION_RULES.forEach(rule => {
    const result = rule.check(code);
    
    if (result.hasIssues) {
      console.log(`   ❌ ${rule.name}`);
      console.log(`      ${rule.description}`);
      console.log(`      Issues trouvées: ${result.incorrectCount}`);
      if (result.details && result.details.length > 0) {
        result.details.slice(0, 3).forEach(detail => {
          console.log(`      → ${detail}`);
        });
        if (result.details.length > 3) {
          console.log(`      ... et ${result.details.length - 3} autres`);
        }
      }
      totalIssues += result.incorrectCount;
      fileIssues.push({ rule: rule.name, count: result.incorrectCount });
    } else {
      console.log(`   ✅ ${rule.name} - OK`);
    }
  });
  
  if (fileIssues.length > 0) {
    issuesByFile[filePath] = fileIssues;
  }
});

/**
 * RAPPORT FINAL
 */
console.log('\n\n╔═══════════════════════════════════════════════════════╗');
console.log('║  📊 RAPPORT D\'AUDIT                                  ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

if (totalIssues === 0) {
  console.log('✅ AUCUN PROBLÈME DÉTECTÉ !');
  console.log('   Tous les paramètres API respectent les conventions Dolibarr.\n');
} else {
  console.log(`⚠️  ${totalIssues} PROBLÈMES DÉTECTÉS\n`);
  console.log('📋 Résumé par fichier:\n');
  
  Object.entries(issuesByFile).forEach(([file, issues]) => {
    console.log(`   ${file}:`);
    issues.forEach(issue => {
      console.log(`   - ${issue.rule}: ${issue.count} issue(s)`);
    });
    console.log('');
  });
  
  console.log('🔧 ACTIONS RECOMMANDÉES:\n');
  console.log('1. Remplacer product_id/project_id → fk_product/fk_project');
  console.log('2. Sur lignes documents: price → subprice');
  console.log('3. Ajouter gestion 404 → return [] dans search*');
  console.log('4. Vérifier types date (z.number() pour timestamps)\n');
}

/**
 * RÉFÉRENCE RAPIDE
 */
console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║  📚 RÉFÉRENCE RAPIDE API DOLIBARR                    ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log('🔗 Foreign Keys:');
console.log('   ✅ fk_product, fk_project, fk_user, fk_warehouse');
console.log('   ❌ product_id, project_id, user_id, warehouse_id');
console.log('   ⚠️  Exception: socid (sans fk_)\n');

console.log('💰 Prix:');
console.log('   Produits:    price, price_min');
console.log('   Lignes docs: subprice (prix unitaire HT)\n');

console.log('📅 Dates:');
console.log('   Type: z.number() - Unix timestamp');
console.log('   Noms: date, datec, datem, date_start, date_end\n');

console.log('🔍 Recherches:');
console.log('   Doivent retourner [] si 404 (pas d\'exception)\n');

console.log('📖 Documentation complète:');
console.log('   https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST\n');

// Exit code
process.exit(totalIssues > 0 ? 1 : 0);
