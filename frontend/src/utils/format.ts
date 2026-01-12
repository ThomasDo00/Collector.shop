/**
 * Formatting utilities to eliminate code duplication
 */

/**
 * Format price in French Euros
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

/**
 * Format date in French long format (e.g., "15 janvier 2024")
 */
export function formatDateLong(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date in French month-year format (e.g., "janvier 2024")
 */
export function formatDateMonthYear(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
}
