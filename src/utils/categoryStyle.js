/**
 * Single source of truth for how each expense category looks across the app.
 *
 * Previously every page defined its own `CATEGORY_EMOJI` object (5 separate
 * copies), and categories had no colour identity at all — just an emoji on a
 * flat grey chip. That's part of why the app read as generic: browsing a list
 * gave you no way to visually scan by category the way a real ledger or
 * receipt does. Each category now carries a consistent hue used for chips,
 * accent bars, chart slices and icon badges everywhere.
 */
export const CATEGORIES = [
    'Food', 'Travel', 'Shopping', 'Entertainment', 'Bills',
    'Rent', 'Utilities', 'Health', 'Groceries', 'Transport', 'Other',
]

const STYLES = {
    Food: { emoji: '🍕', color: '#f97316', soft: 'rgba(249,115,22,0.14)' },
    Travel: { emoji: '✈️', color: '#0ea5e9', soft: 'rgba(14,165,233,0.14)' },
    Shopping: { emoji: '🛍️', color: '#d946ef', soft: 'rgba(217,70,239,0.14)' },
    Entertainment: { emoji: '🎬', color: '#8b5cf6', soft: 'rgba(139,92,246,0.14)' },
    Bills: { emoji: '📄', color: '#64748b', soft: 'rgba(100,116,139,0.14)' },
    Rent: { emoji: '🏠', color: '#6366f1', soft: 'rgba(99,102,241,0.14)' },
    Utilities: { emoji: '⚡', color: '#eab308', soft: 'rgba(234,179,8,0.16)' },
    Health: { emoji: '❤️', color: '#f43f5e', soft: 'rgba(244,63,94,0.14)' },
    Groceries: { emoji: '🛒', color: '#10b981', soft: 'rgba(16,185,129,0.14)' },
    Transport: { emoji: '🚗', color: '#14b8a6', soft: 'rgba(20,184,166,0.14)' },
    Other: { emoji: '💸', color: '#9ca3af', soft: 'rgba(156,163,175,0.14)' },
};

const FALLBACK = { emoji: '💸', color: '#9ca3af', soft: 'rgba(156,163,175,0.14)' };

/** { emoji, color, soft } for a category, falling back gracefully for unknown values. */
export const getCategoryStyle = (category) => STYLES[category] || FALLBACK;

// Ordered list of just the colours, handy for chart palettes that don't map to
// a specific category (group spending, per-person breakdowns).
export const CHART_PALETTE = CATEGORIES.map((c) => STYLES[c].color);
