/**
 * @fileoverview Formatting utility functions for currency, phone, and ID generation
 * @module utils/formatters
 */

/**
 * Format a numeric string as US currency (no $ sign)
 * @param {string|number} v - Raw value
 * @returns {string} Formatted number string (e.g. "420,000")
 */
export const fC = (v) => {
  const n = String(v).replace(/[^0-9]/g, "");
  return n ? parseInt(n).toLocaleString("en-US") : "";
};

/**
 * Parse a currency string to integer
 * @param {string|number} v - Currency string
 * @returns {number} Integer value
 */
export const pC = (v) => parseInt(String(v).replace(/[^0-9]/g, "")) || 0;

/**
 * Format a phone number as (XXX) XXX-XXXX
 * @param {string} v - Raw phone input
 * @returns {string} Formatted phone string
 */
export const fP = (v) => {
  let d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length >= 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length >= 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return d;
};

/**
 * Generate a short random ID
 * @returns {string} 6-char uppercase alphanumeric ID
 */
export const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
