export function resolveImageUrl(url?: string): string {
    const fallback = '/placeholder.svg';
    const value = (url || '').trim();

    if (!value) {
        return fallback;
    }

    const normalized = value.replace(/\\/g, '/');

    if (normalized.startsWith('data:')) {
        return normalized;
    }

    if (/^https?:\/\//i.test(normalized)) {
        try {
            const parsed = new URL(normalized);
            if (parsed.pathname.startsWith('/assets/')) {
                return `${parsed.pathname}${parsed.search}${parsed.hash}`;
            }
        } catch {
            // keep original absolute URL if URL parsing fails
        }
        return normalized;
    }

    if (normalized.startsWith('/assets/')) {
        return normalized;
    }

    if (normalized.startsWith('assets/')) {
        return '/' + normalized;
    }

    if (normalized.startsWith('/src/assets/')) {
        return normalized.slice(4);
    }

    if (normalized.startsWith('src/assets/')) {
        return '/' + normalized.slice(4);
    }

    const assetsIndex = normalized.indexOf('/assets/');
    if (assetsIndex >= 0) {
        return normalized.slice(assetsIndex);
    }

    if (normalized.startsWith('products/')) {
        return '/assets/' + normalized;
    }

    if (normalized.startsWith('/')) {
        return normalized;
    }

    if (normalized.includes('/')) {
        return '/' + normalized;
    }

    return '/assets/products/' + normalized;
}
