/**
 * Format a numeric value as a currency string.
 * @param {number} value - The price amount.
 * @param {string} [currency='PHP'] - ISO 4217 currency code.
 * @param {string} [locale='en-PH'] - BCP 47 locale string.
 * @returns {string} Formatted price string, e.g. "₱1,250.00"
 */
export function formatPrice(value, currency = 'PHP', locale = 'en-PH') {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a compact price for display in cards (e.g. "₱1.2K").
 * @param {number} value
 * @param {string} [currency='PHP']
 * @returns {string}
 */
export function formatCompactPrice(value, currency = 'PHP') {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return formatPrice(value, currency);
}
