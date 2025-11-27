import { z } from 'zod';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const ConfigSchema = z.object({
  DOLIBARR_BASE_URL: z.string().url('URL de base Dolibarr invalide'),
  DOLIBARR_API_KEY: z.string().min(1, 'Clé API requise'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  // Nouveaux paramètres de fiabilité
  AXIOS_TIMEOUT: z.coerce.number().int().positive().default(30000), // 30s par défaut
  MAX_RETRIES: z.coerce.number().int().min(0).default(3),
});

export type Config = z.infer<typeof ConfigSchema>;

// Variable pour le cache de la configuration
let _config: Config | null = null;

function loadConfig(): Config {
  if (_config) return _config;
  
  try {
    _config = ConfigSchema.parse(process.env);
    return _config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erreur de configuration critique :');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Export comme getter pour un chargement différé
export const config = new Proxy({} as Config, {
  get(_, prop: string) {
    const cfg = loadConfig();
    return cfg[prop as keyof Config];
  }
});
