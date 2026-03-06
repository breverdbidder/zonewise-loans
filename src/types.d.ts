/**
 * @fileoverview TypeScript type definitions for ZoneWise.AI Loan Platform
 * @module types
 */

/** Credit score range options */
export type CreditScoreRange =
  | "720+"
  | "700-719"
  | "680-719"
  | "660-679"
  | "640-659"
  | "620-639"
  | "600-639"
  | "below600";

/** Investor experience levels */
export type ExperienceLevel =
  | "first"
  | "1-3"
  | "4-10"
  | "11-25"
  | "25+";

/** Loan type identifiers */
export type LoanType = "hardmoney" | "construction" | "dscr" | "nodoc";

/** Underwriting verdict outcomes */
export type Verdict = "APPROVE" | "CONDITIONAL_APPROVE" | "REVIEW" | "DECLINE";

/** Application status */
export type ApplicationStatus = "pending" | "reviewed" | "approved" | "declined";

/** Property condition */
export type PropertyCondition =
  | "Excellent"
  | "Good"
  | "Fair"
  | "Poor"
  | "Distressed"
  | "Vacant Lot";

/** No-Doc program subtypes */
export type NoDocSubtype =
  | "bankstatement"
  | "asset_depletion"
  | "profit_loss"
  | "stated_income"
  | "nina";

/** Construction types */
export type ConstructionType = "ground_up" | "tear_down" | "major_reno";

/** Permit status options */
export type PermitStatus = "approved" | "submitted" | "not_applied";

/** Plans status options */
export type PlansStatus = "complete" | "in_progress" | "preliminary" | "none";

/** GC contract status options */
export type GCContractStatus = "signed" | "self" | "bidding" | "none";

/** Loan type configuration from constants */
export interface LoanTypeConfig {
  label: string;
  icon: string;
  description: string;
  stepLabel: string;
  stepSub: string;
  headerTitle: string;
  financialTitle: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  reviewBg: string;
  reviewBorder: string;
}

/** Complete form state for loan applications */
export interface LoanFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  entityType: string;
  entityName: string;
  mailingAddr: string;
  citizenship: string;
  loanType: LoanType;
  propAddr: string;
  propType: string;
  occupancy: string;
  beds: string;
  baths: string;
  sqft: string;
  condition: string;
  purchasePrice: number;
  loanAmt: number;
  arv: number;
  repairBudget: number;
  purpose: string;
  term: string;
  exitStrategy: string;
  rehabScope: string;
  experience: ExperienceLevel;
  credit: CreditScoreRange;
  liquid: number;
  bkForeclosure: string;
  gcStatus: string;
  projectDesc: string;
  /** DSCR fields */
  monthlyRent: number;
  annualTaxes: number;
  annualInsurance: number;
  monthlyHOA: number;
  rateType: string;
  dscrRatio: number;
  rentalType: string;
  /** No-Doc fields */
  noDocSubtype: NoDocSubtype;
  avgMonthlyDeposits: number;
  statementPeriod: string;
  /** Construction fields */
  lotValue: number;
  hardCosts: number;
  softCosts: number;
  totalBudget: number;
  completedValue: number;
  constructionType: ConstructionType;
  permitStatus: PermitStatus;
  plansStatus: PlansStatus;
  gcContract: GCContractStatus;
}

/** Uploaded file object */
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  uploading?: boolean;
  storagePath?: string;
}

/** Underwriting result returned by scoring engines */
export interface UnderwritingResult {
  score: number;
  verdict: Verdict;
  verdict_summary: string;
  approval_probability: number;
  recommended_rate: string;
  recommended_ltv_cap: string;
  recommended_term: string;
  strengths: string[];
  risks: string[];
  conditions: string[];
  deal_summary: string;
  exit_viability: string;
  market_commentary: string;
}

/** Loan application as stored/displayed */
export interface LoanApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  entity: string;
  propAddr: string;
  propType: string;
  loanType: LoanType;
  purchasePrice: number;
  loanAmt: number;
  arv: number;
  repairBudget: number;
  credit: CreditScoreRange;
  experience: ExperienceLevel;
  liquid: number;
  status: ApplicationStatus;
  submitted: string;
  uploads: number;
  score: number | null;
  [key: string]: unknown;
}

/** Scoring thresholds */
export interface ScoringThresholds {
  APPROVE_THRESHOLD: number;
  CONDITIONAL_THRESHOLD: number;
  REVIEW_THRESHOLD: number;
  MAX_SCORE: number;
}

/** Color palette */
export interface ColorPalette {
  navy: string;
  navyDeep: string;
  navyMid: string;
  orange: string;
  orangeLight: string;
  orangeGlow: string;
  s800: string;
  s700: string;
  s600: string;
  s400: string;
  s300: string;
  s200: string;
  s100: string;
  s50: string;
  green: string;
  greenLt: string;
  red: string;
  redLt: string;
  amber: string;
  amberLt: string;
  white: string;
  slate50: string;
  slate100: string;
  slate200: string;
  slate300: string;
  slate400: string;
  slate600: string;
}
