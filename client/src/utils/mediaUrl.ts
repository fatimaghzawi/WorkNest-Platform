const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function isUploadPath(pathname: string) {
  return pathname.startsWith('/uploads/');
}

/**
 * Resolve uploaded file URLs for the current environment.
 * - Dev: same-origin `/uploads/...` (Vite proxies to the API)
 * - Production: full API URL (`VITE_API_URL` + `/uploads/...`)
 * - Cloudinary/CDN URLs are returned unchanged
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return '';

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (!isUploadPath(parsed.pathname)) {
        return url;
      }

      if (import.meta.env.DEV) {
        return `${parsed.pathname}${parsed.search}`;
      }

      return API_BASE ? `${API_BASE}${parsed.pathname}${parsed.search}` : url;
    } catch {
      return url;
    }
  }

  if (url.startsWith('/uploads/')) {
    if (import.meta.env.DEV) return url;
    return API_BASE ? `${API_BASE}${url}` : url;
  }

  return url;
}
