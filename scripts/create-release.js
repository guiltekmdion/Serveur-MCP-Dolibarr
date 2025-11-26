#!/usr/bin/env node

/**
 * 🚀 Script de Création de Release
 * 
 * Usage: node scripts/create-release.js <version>
 * Example: node scripts/create-release.js 1.3.0
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const version = args[0];

if (!version) {
  console.error('❌ Erreur: Version requise');
  console.log('\nUsage: node scripts/create-release.js <version>');
  console.log('Example: node scripts/create-release.js 1.3.0\n');
  process.exit(1);
}

// Validation format version (semver)
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(version)) {
  console.error('❌ Erreur: Format de version invalide');
  console.log('Format attendu: X.Y.Z (ex: 1.3.0)\n');
  process.exit(1);
}

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║  🚀 CRÉATION DE RELEASE                         ║');
console.log('╚══════════════════════════════════════════════════╝\n');

console.log(`📦 Version: v${version}\n`);

// Vérifier que le repo est propre
console.log('1️⃣  Vérification du statut Git...');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (status.trim()) {
    console.error('❌ Le repository contient des modifications non commitées');
    console.log('\nModifications en attente:');
    console.log(status);
    console.log('\nCommit ou stash tes modifications avant de créer une release.\n');
    process.exit(1);
  }
  console.log('   ✅ Repository propre\n');
} catch (error) {
  console.error('❌ Erreur Git:', error.message);
  process.exit(1);
}

// Vérifier qu'on est sur main
console.log('2️⃣  Vérification de la branche...');
try {
  const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  if (branch !== 'main') {
    console.error(`❌ Tu dois être sur la branche 'main' (actuellement sur '${branch}')`);
    process.exit(1);
  }
  console.log('   ✅ Branche main\n');
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

// Pull les dernières modifications
console.log('3️⃣  Synchronisation avec origin...');
try {
  execSync('git pull origin main', { stdio: 'inherit' });
  console.log('   ✅ Synchronisé\n');
} catch (error) {
  console.error('❌ Erreur lors du pull');
  process.exit(1);
}

// Vérifier que le tag n'existe pas déjà
console.log('4️⃣  Vérification du tag...');
try {
  const tags = execSync('git tag', { encoding: 'utf-8' });
  if (tags.includes(`v${version}`)) {
    console.error(`❌ Le tag v${version} existe déjà`);
    process.exit(1);
  }
  console.log('   ✅ Tag disponible\n');
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

// Mettre à jour package.json
console.log('5️⃣  Mise à jour package.json...');
try {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  packageJson.version = version;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('   ✅ package.json mis à jour\n');
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

// Vérifier que CHANGELOG est à jour
console.log('6️⃣  Vérification CHANGELOG.md...');
try {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const changelog = fs.readFileSync(changelogPath, 'utf-8');
  
  if (!changelog.includes(`## [${version}]`)) {
    console.error(`❌ CHANGELOG.md ne contient pas de section pour la version ${version}`);
    console.log('\nAjoute une section pour cette version avant de créer la release:\n');
    console.log(`## [${version}] - ${new Date().toISOString().split('T')[0]}`);
    console.log('\n### Ajouté / Modifié / Corrigé');
    console.log('- ...\n');
    process.exit(1);
  }
  console.log('   ✅ CHANGELOG à jour\n');
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

// Build du projet
console.log('7️⃣  Build du projet...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('   ✅ Build réussi\n');
} catch (error) {
  console.error('❌ Erreur de build');
  process.exit(1);
}

// Commit et tag
console.log('8️⃣  Création du commit et du tag...');
try {
  execSync(`git add package.json`, { stdio: 'inherit' });
  execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' });
  execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });
  console.log('   ✅ Tag créé\n');
} catch (error) {
  console.error('❌ Erreur lors du commit/tag');
  process.exit(1);
}

// Push
console.log('9️⃣  Push vers GitHub...');
try {
  execSync('git push origin main', { stdio: 'inherit' });
  execSync(`git push origin v${version}`, { stdio: 'inherit' });
  console.log('   ✅ Poussé vers GitHub\n');
} catch (error) {
  console.error('❌ Erreur lors du push');
  console.log('\nTu peux pousser manuellement avec:');
  console.log('  git push origin main');
  console.log(`  git push origin v${version}\n`);
  process.exit(1);
}

console.log('╔══════════════════════════════════════════════════╗');
console.log('║  ✅ RELEASE CRÉÉE AVEC SUCCÈS !                 ║');
console.log('╚══════════════════════════════════════════════════╝\n');

console.log(`📦 Version: v${version}`);
console.log(`🏷️  Tag: v${version}`);
console.log(`🔗 GitHub Actions va créer la release automatiquement\n`);
console.log(`Vérifie: https://github.com/${process.env.GITHUB_REPOSITORY || 'guiltekmdion/Serveur-MCP-Dolibarr'}/actions\n`);
