/**
 * @fileoverview Shared constants for ZoneWise.AI Loan Platform
 * @module constants
 */

/** Brand color palette — ZoneWise.AI house brand */
export const COLORS = {
  navy: "#1E3A5F",
  navyDeep: "#0F1D30",
  navyMid: "#2A4D7A",
  orange: "#F59E0B",
  orangeLight: "#FCD34D",
  orangeGlow: "rgba(245,158,11,0.12)",
  slate800: "#1e293b",
  slate700: "#334155",
  slate600: "#475569",
  slate400: "#94a3b8",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",
  green: "#10b981",
  greenLight: "#d1fae5",
  red: "#ef4444",
  redLight: "#fee2e2",
  amber: "#f59e0b",
  amberLight: "#fef3c7",
  white: "#fff",
};

/** US states abbreviation list */
export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

/**
 * Loan type definitions — single source of truth
 * @type {Object.<string, {label: string, icon: string, description: string, badgeColor: string, badgeBg: string, badgeBorder: string}>}
 */
export const LOAN_TYPES = {
  hardmoney: {
    label: "Hard Money",
    icon: "🏠",
    description: "Fix & flip, bridge, investment",
    stepLabel: "Loan Request",
    stepSub: "Financing structure and exit strategy",
    headerTitle: "Hard Money Loan Application",
    financialTitle: "Financial Summary",
    badgeBg: COLORS.slate100,
    badgeColor: COLORS.slate600,
    badgeBorder: COLORS.slate200,
    reviewBg: COLORS.slate50,
    reviewBorder: COLORS.slate200,
  },
  construction: {
    label: "Construction",
    icon: "🏗️",
    description: "Ground-up, tear-down, major reno",
    stepLabel: "Construction Loan Request",
    stepSub: "Ground-up or major renovation financing details",
    headerTitle: "Ground-Up Construction Loan Application",
    financialTitle: "Construction Budget & Financials",
    badgeBg: COLORS.orangeGlow,
    badgeColor: "#92400e",
    badgeBorder: COLORS.orange + "40",
    reviewBg: "rgba(245,158,11,0.08)",
    reviewBorder: COLORS.orange + "40",
  },
  dscr: {
    label: "DSCR",
    icon: "📈",
    description: "Rental income investors",
    stepLabel: "Rental Income & DSCR",
    stepSub: "Property cash flow qualifies you — no personal income needed",
    headerTitle: "DSCR Rental Loan Application",
    financialTitle: "DSCR & Rental Analysis",
    badgeBg: "rgba(16,185,129,0.08)",
    badgeColor: "#065f46",
    badgeBorder: "rgba(16,185,129,0.2)",
    reviewBg: "rgba(16,185,129,0.06)",
    reviewBorder: "rgba(16,185,129,0.2)",
  },
  nodoc: {
    label: "No-Doc",
    icon: "📋",
    description: "Self-employed, bank stmt/asset",
    stepLabel: "Income Verification Program",
    stepSub: "Alternative documentation for self-employed and non-traditional income",
    headerTitle: "No-Doc Loan Application",
    financialTitle: "No-Doc Program Details",
    badgeBg: "rgba(99,102,241,0.08)",
    badgeColor: "#4338ca",
    badgeBorder: "rgba(99,102,241,0.2)",
    reviewBg: "rgba(99,102,241,0.06)",
    reviewBorder: "rgba(99,102,241,0.2)",
  },
};

/**
 * Underwriting score thresholds
 * @readonly
 */
export const SCORING = {
  APPROVE_THRESHOLD: 82,
  CONDITIONAL_THRESHOLD: 68,
  REVIEW_THRESHOLD: 50,
  MAX_SCORE: 100,
};

/**
 * Credit score to point mapping for underwriting
 * @type {Object.<string, number>}
 */
export const CREDIT_SCORE_MAP = {
  "720+": 20,
  "700-719": 17,
  "680-719": 15,
  "660-679": 12,
  "640-659": 8,
  "620-639": 5,
  "below600": 2,
};

/**
 * Experience level to point mapping
 * @type {Object.<string, number>}
 */
export const EXPERIENCE_MAP = {
  "25+": 5,
  "11-25": 4,
  "4-10": 3,
  "1-3": 2,
  "first": 1,
};

/**
 * No-Doc subtype definitions
 * @type {Object.<string, {label: string, shortLabel: string}>}
 */
export const NODOC_SUBTYPES = {
  bankstatement: { label: "🏦 Bank Statement", shortLabel: "Bank Stmt" },
  asset_depletion: { label: "💎 Asset Depletion", shortLabel: "Asset Depl." },
  profit_loss: { label: "📊 P&L Only", shortLabel: "P&L" },
  nina: { label: "🔒 NINA", shortLabel: "NINA" },
};

/** Default form input style */
export const INPUT_STYLE = {
  width: "100%",
  padding: "10px 13px",
  border: `1.5px solid ${COLORS.slate200}`,
  borderRadius: 8,
  fontSize: 13,
  color: COLORS.slate800,
  background: "#fff",
  outline: "none",
  fontFamily: "'Plus Jakarta Sans',sans-serif",
  transition: "border-color 0.2s",
};
