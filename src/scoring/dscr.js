/**
 * @fileoverview DSCR Loan Underwriting Scoring Engine
 * @module scoring/dscr
 * 
 * Evaluates DSCR (Debt Service Coverage Ratio) loan applications
 * using a 100-point weighted scoring matrix.
 * 
 * Scoring Matrix:
 * - DSCR Ratio:     30 points (property cash flow coverage)
 * - Credit Score:    20 points (borrower creditworthiness)
 * - LTV:            20 points (loan-to-value risk)
 * - Reserves:       15 points (liquidity buffer)
 * - Property Type:   5 points (asset class risk)
 * - Experience:      5 points (investor track record)
 * - Documentation:   5 points (file completeness)
 * 
 * Verdict Thresholds:
 * - APPROVE:            >= 82 points
 * - CONDITIONAL_APPROVE: 68-81 points
 * - REVIEW:              50-67 points
 * - DECLINE:             < 50 points
 */

import { SCORING, CREDIT_SCORE_MAP, EXPERIENCE_MAP } from "../utils/constants";

/**
 * @typedef {Object} DSCRApplication
 * @property {number} purchasePrice - Property purchase price
 * @property {number} loanAmt - Requested loan amount
 * @property {number} dscrRatio - Calculated DSCR ratio
 * @property {string} credit - Credit score range (e.g., "720+")
 * @property {number} liquid - Liquid reserves amount
 * @property {string} propType - Property type (sfr, duplex, etc.)
 * @property {string} experience - Investor experience level
 * @property {number} uploads - Number of uploaded documents
 * @property {string} rentalType - Rental strategy (longterm, shortterm, midterm)
 * @property {string} rateType - Loan rate type (fixed30, arm51, arm71)
 * @property {number} monthlyRent - Monthly gross rental income
 * @property {string} propAddr - Property address
 */

/**
 * @typedef {Object} UnderwritingResult
 * @property {number} score - Total score (0-100)
 * @property {string} verdict - APPROVE | CONDITIONAL_APPROVE | REVIEW | DECLINE
 * @property {string} verdict_summary - Narrative summary
 * @property {number} approval_probability - Estimated approval % (5-98)
 * @property {string} recommended_rate - Suggested interest rate
 * @property {string} recommended_ltv_cap - Max LTV recommendation
 * @property {string} recommended_term - Suggested loan term
 * @property {string[]} strengths - Deal strengths (max 4)
 * @property {string[]} risks - Deal risks (max 3)
 * @property {string[]} conditions - Required conditions (max 4)
 * @property {string} deal_summary - One-line deal description
 * @property {string} exit_viability - Exit strategy assessment
 * @property {string} market_commentary - Market context
 */

/**
 * Run DSCR loan underwriting analysis
 * @param {DSCRApplication} app - DSCR loan application data
 * @returns {UnderwritingResult} Scored underwriting result
 */
export function runDSCRUnderwriting(app) {
  const ltv = app.purchasePrice > 0
    ? ((app.loanAmt / app.purchasePrice) * 100)
    : 0;
  const dscr = app.dscrRatio || 0;

  let score = 0;

  // DSCR ratio scoring (30 points max)
  if (dscr >= 1.25) score += 30;
  else if (dscr >= 1.1) score += 24;
  else if (dscr >= 1.0) score += 18;
  else if (dscr >= 0.75) score += 10;
  else score += 3;

  // Credit score (20 points max)
  score += (CREDIT_SCORE_MAP[app.credit] || 10);

  // LTV scoring (20 points max)
  if (ltv <= 65) score += 20;
  else if (ltv <= 70) score += 17;
  else if (ltv <= 75) score += 14;
  else if (ltv <= 80) score += 10;
  else score += 3;

  // Reserve months (15 points max)
  const reserveMonths = (app.liquid > 0 && app.loanAmt > 0)
    ? Math.floor(app.liquid / (app.loanAmt / 12))
    : 0;
  if (reserveMonths >= 12) score += 15;
  else if (reserveMonths >= 6) score += 12;
  else if (reserveMonths >= 3) score += 8;
  else score += 3;

  // Property type (5 points max)
  const propScores = { sfr: 5, duplex: 4, triplex: 4, fourplex: 4, condo: 3 };
  score += (propScores[app.propType] || 3);

  // Experience (5 points max)
  score += (EXPERIENCE_MAP[app.experience] || 2);

  // Documentation (5 points max)
  if (app.uploads >= 5) score += 5;
  else if (app.uploads >= 3) score += 3;
  else score += 1;

  score = Math.min(score, SCORING.MAX_SCORE);

  // Determine verdict
  const verdict = score >= SCORING.APPROVE_THRESHOLD
    ? "APPROVE"
    : score >= SCORING.CONDITIONAL_THRESHOLD
      ? "CONDITIONAL_APPROVE"
      : score >= SCORING.REVIEW_THRESHOLD
        ? "REVIEW"
        : "DECLINE";

  // Rate recommendation
  const rate = (dscr >= 1.25 && app.credit === "720+")
    ? "6.25%" : dscr >= 1.1
      ? "7.0%" : dscr >= 1.0
        ? "7.75%" : "8.5%";

  // Generate strengths
  const strengths = [];
  if (dscr >= 1.25) {
    strengths.push(
      `Strong DSCR of ${dscr.toFixed(2)}x — rental income covers debt by ${((dscr - 1) * 100).toFixed(0)}% margin`
    );
  }
  if (dscr >= 1.0 && dscr < 1.25) {
    strengths.push(
      `DSCR of ${dscr.toFixed(2)}x meets minimum threshold — property cash flows positively`
    );
  }
  if (app.credit === "720+") {
    strengths.push("Excellent credit (720+) qualifies for best available DSCR rates");
  }
  if (ltv <= 75) {
    strengths.push(`Conservative LTV at ${ltv.toFixed(1)}% provides strong equity cushion`);
  }
  if (reserveMonths >= 6) {
    strengths.push(`${reserveMonths} months of reserves demonstrate strong liquidity`);
  }
  if (app.rentalType === "longterm") {
    strengths.push("Long-term rental strategy provides predictable, stable income stream");
  }

  // Generate risks
  const risks = [];
  if (dscr < 1.0) {
    risks.push(
      `Negative cash flow — DSCR ${dscr.toFixed(2)}x means property doesn't cover its debt service`
    );
  }
  if (dscr >= 1.0 && dscr < 1.1) {
    risks.push(
      `Thin cash flow margin — DSCR ${dscr.toFixed(2)}x leaves minimal buffer for vacancy`
    );
  }
  if (ltv > 75) {
    risks.push(`LTV at ${ltv.toFixed(1)}% exceeds preferred 75% — reduced equity cushion`);
  }
  if (reserveMonths < 6) {
    risks.push(`Only ${reserveMonths} months reserves — recommend 6+ months for DSCR loans`);
  }
  if (risks.length < 1) {
    risks.push("Market rent fluctuations could impact DSCR over the loan term");
  }

  // Conditions
  const conditions = [
    "Full appraisal with Form 1007 rent schedule required",
    "Lease agreements or market rent analysis verification",
    "Title search, title insurance, and hazard insurance required",
    "Property insurance with lender as loss payee",
  ];
  if (dscr < 1.0) {
    conditions.push("Additional 5-10% down payment required for sub-1.0 DSCR");
  }
  if (app.rentalType === "shortterm") {
    conditions.push("Short-term rental income requires 12-month operating history");
  }

  // Narrative summaries
  const verdictSummaries = {
    APPROVE: `Strong DSCR deal — ${dscr.toFixed(2)}x coverage with ${app.credit} credit and ${ltv.toFixed(0)}% LTV. Recommended for funding.`,
    CONDITIONAL_APPROVE: `DSCR of ${dscr.toFixed(2)}x is acceptable with conditions. ${ltv.toFixed(0)}% LTV within range.`,
    REVIEW: `DSCR metrics require review — ${dscr.toFixed(2)}x coverage and ${ltv.toFixed(0)}% LTV need restructuring.`,
    DECLINE: `DSCR below minimum thresholds. Consider higher down payment or stronger rental income.`,
  };

  return {
    score,
    verdict,
    verdict_summary: verdictSummaries[verdict],
    approval_probability: Math.min(Math.max(score + Math.floor(Math.random() * 6) - 3, 5), 98),
    recommended_rate: rate,
    recommended_ltv_cap: score >= 80 ? "80%" : score >= 65 ? "75%" : "70%",
    recommended_term: "30 years fixed",
    strengths: strengths.slice(0, 4),
    risks: risks.slice(0, 3),
    conditions: conditions.slice(0, 4),
    deal_summary: `DSCR ${app.propType} at ${app.propAddr}`
      + ` — $${app.purchasePrice?.toLocaleString()} purchase,`
      + ` $${app.monthlyRent?.toLocaleString()}/mo rent,`
      + ` ${dscr.toFixed(2)}x DSCR. ${ltv.toFixed(0)}% LTV.`,
    exit_viability: `Long-term hold with ${dscr.toFixed(2)}x DSCR provides ${dscr >= 1.25 ? "strong" : "adequate"} ongoing cash flow.`,
    market_commentary: `Rental market in ${app.propAddr?.includes("FL") ? "Florida" : "the local area"} shows strong fundamentals for ${app.propType} properties.`,
  };
}
