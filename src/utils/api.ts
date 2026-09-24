/**
 * API configuration and utility functions for communicating with
 * the backend authentication and portfolio management server.
 *
 * Supports both:
 * 1. Single-origin Vercel deployment (where Express runs as a Vercel Serverless function at /api/*).
 * 2. External dedicated backend service (if VITE_APP_URL is explicitly set to an external host).
 */

const rawAppUrl = (import.meta.env.VITE_APP_URL as string | undefined)?.trim() || '';

// Clean the configured backend URL
function sanitizeBackendUrl(url: string): string {
  if (!url) return '';
  const cleaned = url.replace(/\/+$/, '');
  // Ignore localhost and placeholder URLs when determining an external production backend
  if (
    cleaned.includes('example.com') ||
    cleaned.includes('localhost') ||
    cleaned.includes('127.0.0.1')
  ) {
    return '';
  }
  return cleaned;
}

export const CONFIGURED_BACKEND_URL: string = sanitizeBackendUrl(rawAppUrl);

/**
 * Returns the base URL for API calls.
 * If VITE_APP_URL is explicitly configured with an external backend host (e.g. Render, Railway, AWS),
 * this returns that backend URL.
 * Otherwise (default for Vercel unified deployments, preview environments, and local dev),
 * returns empty string for same-origin relative API paths.
 */
export function getApiBaseUrl(): string {
  if (CONFIGURED_BACKEND_URL) {
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      // Only prepend if backend is on a different origin than current window
      if (CONFIGURED_BACKEND_URL !== currentOrigin) {
        return CONFIGURED_BACKEND_URL;
      }
    } else {
      return CONFIGURED_BACKEND_URL;
    }
  }

  // Same-origin relative path (standard for Vercel serverless /api and local dev)
  return '';
}

/**
 * Returns the fully qualified or relative URL for any API endpoint path.
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
 * can be loaded seamlessly whether hosted on Vercel or an external backend.
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
