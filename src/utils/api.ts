/**
 * API configuration and utility functions for communicating with
 * the backend authentication and portfolio management server.
 *
 * Defaults to same-origin relative URLs ("") for standard Vercel
 * serverless deployment (/api/*).
 */

export const API_BASE_URL: string = '';

/**
 * Returns the base URL for API calls.
 * Always returns "" to enforce same-origin relative API requests.
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Returns the relative or absolute URL for any API endpoint path.
 * On Vercel production (https://mk-forge-auto.vercel.app),
 * relative paths like '/api/auth/login' remain relative,
 * executing as https://mk-forge-auto.vercel.app/api/auth/login.
 */
export function getApiUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // If an obsolete Cloud Run URL was stored in database or state, strip to relative path
    if (path.includes('run.app')) {
      try {
        const parsed = new URL(path);
        return `${parsed.pathname}${parsed.search}`;
      } catch {
        return path;
      }
    }
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
 * load seamlessly from the same origin on Vercel.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    if (url.includes('run.app')) {
      try {
        const parsed = new URL(url);
        return `${parsed.pathname}${parsed.search}`;
      } catch {
        return url;
      }
    }
    return url;
  }

  return url;
}
