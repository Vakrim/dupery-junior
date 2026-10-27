const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value: unknown): string => String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);

/** Assets live in public/assets and are served next to index.html. */
export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}assets/${path}`;
