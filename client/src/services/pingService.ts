/**
 * Service de ping pour maintenir le serveur actif sur Render
 * Envoie des requêtes périodiques pour éviter la mise en veille
 */

// Récupération de l'URL de l'API depuis les variables d'environnement
const API_URL =
  import.meta.env.VITE_API_URL || 'https://projet-junior-api.onrender.com';

// Interval de ping en millisecondes (14 minutes pour être sûr de ne pas dépasser les 15 minutes de timeout Render)
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

// Endpoint de health check (le serveur a déjà /health sans préfixe /api)
const HEALTH_ENDPOINT = '/health';

let pingInterval: ReturnType<typeof setInterval> | null = null;
let isPinging = false;

/**
 * Fonction de ping vers le serveur
 */
async function pingServer(): Promise<boolean> {
  try {
    console.log('[PingService] Envoi du ping au serveur...');

    const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout de 10 secondes pour éviter les requêtes trop longues
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      console.log('[PingService] Ping réussi - Serveur actif');
      return true;
    } else {
      console.warn(`[PingService] Ping reçu avec statut ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('[PingService] Erreur lors du ping:', error);
    return false;
  }
}

/**
 * Démarrer le service de ping automatique
 */
export function startPingService(): void {
  if (isPinging) {
    console.log('[PingService] Service déjà démarré');
    return;
  }

  console.log('[PingService] Démarrage du service de ping automatique');
  isPinging = true;

  // Premier ping immédiat
  pingServer();

  // Configuration des pings périodiques
  pingInterval = setInterval(() => {
    pingServer();
  }, PING_INTERVAL);
}

/**
 * Arrêter le service de ping
 */
export function stopPingService(): void {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    isPinging = false;
    console.log('[PingService] Service de ping arrêté');
  }
}

/**
 * Effectuer un ping manuel
 */
export async function manualPing(): Promise<boolean> {
  console.log('[PingService] Ping manuel demandé');
  return await pingServer();
}

/**
 * Vérifier si le service de ping est actif
 */
export function isPingServiceActive(): boolean {
  return isPinging;
}

/**
 * Nettoyage automatique lors du déchargement de la page
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopPingService();
  });

  // Démarrage automatique du service si l'utilisateur est sur une page active
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Mettre en pause si l'onglet n'est pas visible
      console.log('[PingService] Onglet masqué - pause du service');
      stopPingService();
    } else {
      // Reprendre si l'onglet devient visible
      console.log('[PingService] Onglet visible - reprise du service');
      startPingService();
    }
  });
}
