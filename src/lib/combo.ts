import crypto from 'crypto';

/**
 * Normalizes a single item string.
 * - Trims whitespace
 * - Converts to lowercase
 * - (Optional) Can add canonical mapping here later
 */
export function normalizeItem(item: string): string {
    return item.trim().toLowerCase();
}

/**
 * Processes a list of items into a deterministic hash and a sorted unique list.
 */
export function processCombo(items: string[]): { hash: string; sortedItems: string[] } {
    // 1. Normalize and filter empty
    const normalized = items
        .map(normalizeItem)
        .filter((item) => item.length > 0);

    // 2. Deduplicate
    const unique = Array.from(new Set(normalized));

    // 3. Sort alphabetically
    const sortedItems = unique.sort();

    // 4. Create deterministic string
    const comboString = sortedItems.join('|');

    // 5. Hash
    const hash = crypto.createHash('sha256').update(comboString).digest('hex');

    return { hash, sortedItems };
}
