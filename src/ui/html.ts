const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (s: unknown): string => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Assets live in public/assets and are served next to index.html. */
export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}assets/${path}`;
