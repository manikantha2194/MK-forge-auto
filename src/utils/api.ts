/**
 * API configuration and utility functions for communicating with
 * the backend authentication and portfolio management server.
 *
 * Ensures authentication, asset uploads, and profile modifications
 * connect to the real deployed backend service (APP_URL) when
 * running on Vercel deployments, custom domains, or local environments.
 */

// Deployed Cloud Run backend service URL (from environment or production deployment)
export const DEPLOYED_BACKEND_URL: string = (
  (import.meta.env.VITE_APP_URL as string) ||
  'https://ais-dev-pckpcvo3je4jpqrb53lcee-624129667025.asia-southeast1.run.app'
)
  .trim()
  .replace(/\/+$/, '');

/**
 * Returns the base URL for API calls.
 * If running on Vercel, Netlify, or an external host, this returns the real deployed backend URL.
 * If running on the same origin (local dev server or Cloud Run instance), returns empty string for relative paths.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    const currentHostname = window.location.hostname;

    // Detect if we are running on Vercel or an external frontend host
    const isVercel =
      currentHostname.includes('vercel.app') ||
      currentHostname.includes('now.sh');

    const isExternalDomain =
      isVercel ||
      currentHostname.includes('netlify.app') ||
      (currentOrigin !== DEPLOYED_BACKEND_URL &&
        !currentHostname.includes('run.app') &&
        currentHostname !== 'localhost' &&
        currentHostname !== '127.0.0.1');

    if (isExternalDomain) {
      return DEPLOYED_BACKEND_URL;
    }
  }

  // If VITE_APP_URL is explicitly set to a non-localhost, non-example URL
  if (
    DEPLOYED_BACKEND_URL &&
    !DEPLOYED_BACKEND_URL.includes('example.com') &&
    !DEPLOYED_BACKEND_URL.includes('localhost')
  ) {
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      return DEPLOYED_BACKEND_URL;
    }
  }

  return '';
}

/**
 * Returns the fully qualified URL for any API endpoint path.
 * Ensures the path starts with '/' and prepends the API base URL when required.
 */
export function getApiUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();

  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
}

/**
 * Wrapper around window.fetch that resolves the correct API endpoint URL.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, init);
}

/**
 * Resolves media URLs (e.g. /uploads/...) so that uploaded assets
 * hosted on the backend server can be rendered from Vercel deployments.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  if (url.startsWith('/uploads/')) {
    const baseUrl = getApiBaseUrl();
    return baseUrl ? `${baseUrl}${url}` : url;
  }

  return url;
}
