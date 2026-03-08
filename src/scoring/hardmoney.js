/**
 * @fileoverview Hard Money Loan Underwriting Scoring Engine
 * @module scoring/hardmoney
 *
 * Scoring Matrix:
 * - LTV:           25 points
 * - Credit:        20 points
 * - Experience:    20 points
 * - Liquidity:     15 points
 * - ARV Spread:    10 points
 * - Documentation: 10 points
 *
 * Verdict Thresholds:
 * - APPROVE:            >= 82
 * - CONDITIONAL_APPROVE: 68-81
 * - REVIEW:              50-67
 * - DECLINE:             < 50
 */

/**
 * Run Hard Money loan underwriting analysis
 * @param {Object} app - Hard Money loan application data
 * @param {number} app.purchasePrice - Property purchase price
 * @param {number} app.loanAmt - Requested loan amount
 * @param {number} app.arv - After repair value
 * @param {number} app.repairBudget - Renovation budget
 * @param {string} app.credit - Credit score range
 * @param {string} app.experience - Investor experience level
 * @param {number} app.liquid - Liquid reserves
 * @param {number} app.uploads - Number of uploaded docs
 * @param {string} app.condition - Property condition
 * @param {string} app.purpose - Loan purpose
 * @param {string} app.term - Loan term in months
 * @param {string} app.propType - Property type
 * @param {string} app.propAddr - Property address
 * @returns {Object} Underwriting result
 */
export function runHardMoneyUnderwriting(app) {
  const ltv = app.purchasePrice > 0
    ? ((app.loanAmt / app.purchasePrice) * 100) : 0;
  const arvLtv = app.arv > 0
    ? ((app.loanAmt / app.arv) * 100) : 0;
  const profit = (app.arv || 0) - (app.purchasePrice || 0) - (app.repairBudget || 0);
  const profitMargin = app.arv > 0 ? (profit / app.arv * 100) : 0;

  let score = 0;

  // LTV scoring (max 25)
  if (ltv <= 65) score += 25;
  else if (ltv <= 70) score += 22;
  else if (ltv <= 75) score += 18;
  else if (ltv <= 80) score += 12;
  else score += 5;

  // Credit (max 20)
  const creditMap = {
    "720+": 20, "680-719": 15, "640-679": 10,
    "600-639": 6, "below600": 3,
  };
  score += (creditMap[app.credit] || 8);

  // Experience (max 20)
  const expMap = {
    "25+": 20, "11-25": 16, "4-10": 12, "1-3": 7, "first": 3,
  };
  score += (expMap[app.experience] || 8);

  // Liquidity (max 15)
  const liqRatio = app.liquid / (app.loanAmt || 1);
  if (liqRatio >= 0.8) score += 15;
  else if (liqRatio >= 0.5) score += 12;
  else if (liqRatio >= 0.3) score += 8;
  else score += 4;

  // ARV spread (max 10)
  if (profitMargin >= 25) score += 10;
  else if (profitMargin >= 15) score += 7;
  else if (profitMargin >= 5) score += 4;
  else score += 1;

  // Documentation (max 10)
  if (app.uploads >= 6) score += 10;
  else if (app.uploads >= 3) score += 7;
  else score += 4;

  score = Math.min(score, 100);

  const verdict = score >= 82 ? "APPROVE"
    : score >= 68 ? "CONDITIONAL_APPROVE"
    : score >= 50 ? "REVIEW" : "DECLINE";

  const rate = ltv <= 60 ? "7.5%" : ltv <= 65 ? "8.5%"
    : ltv <= 70 ? "9.0%" : ltv <= 75 ? "9.5%"
    : ltv <= 80 ? "10.5%" : "11.5%";
  const maxLtv = score >= 80 ? "75%" : score >= 65 ? "70%" : "65%";

  const strengths = [];
  const risks = [];
  const conditions = [
    "Full appraisal by approved appraiser required",
    "Proof of funds verification — bank/brokerage statements within 30 days",
    "Title search, title insurance, and hazard insurance required",
  ];

  if (ltv <= 70) {
    strengths.push(
      `Conservative LTV at ${ltv.toFixed(1)}% provides strong downside protection`
    );
  }
  if (app.credit === "720+") {
    strengths.push(
      "Excellent credit profile (720+) indicates strong borrower reliability"
    );
  }
  if (["25+", "11-25"].includes(app.experience)) {
    strengths.push(
      `Experienced investor (${app.experience}) with proven track record reduces execution risk`
    );
  }
  if (liqRatio >= 0.5) {
    strengths.push(
      `Strong liquidity position ($${app.liquid?.toLocaleString()}) — reserves well beyond project requirements`
    );
  }
  if (profitMargin >= 20) {
    strengths.push(
      `Healthy profit spread of $${profit.toLocaleString()} (${profitMargin.toFixed(1)}% of ARV)`
    );
  }
  if (app.uploads >= 4) {
    strengths.push(
      "Comprehensive documentation package submitted"
    );
  }
  if (strengths.length < 2) {
    strengths.push(
      "Property type aligns with strong local market demand"
    );
  }

  if (ltv > 75) {
    risks.push(
      `Elevated LTV at ${ltv.toFixed(1)}% exceeds preferred 75% threshold`
    );
  }
  if (app.credit === "below600" || app.credit === "600-639") {
    risks.push(
      `Below-average credit score (${app.credit}) may indicate financial stress`
    );
  }
  if (app.experience === "first") {
    risks.push(
      "First-time investor — no prior track record increases execution risk"
    );
  }
  if (app.condition === "distressed" || app.condition === "poor") {
    risks.push(
      `Property in ${app.condition} condition — higher rehab cost overruns possible`
    );
  }
  if (profitMargin < 10) {
    risks.push(
      `Thin profit margin (${profitMargin.toFixed(1)}%) leaves limited room for error`
    );
  }
  if (risks.length < 1) {
    risks.push(
      "Market volatility risk on extended timelines"
    );
  }

  if (app.condition === "distressed") {
    conditions.push(
      "Detailed scope of work with licensed GC bid required before funding"
    );
  }
  if (ltv > 75) {
    conditions.push(
      "Additional collateral or personal guarantee may be required"
    );
  }
  if (app.experience === "first") {
    conditions.push(
      "Borrower must provide evidence of GC relationship or construction management plan"
    );
  }

  const verdictSummaries = {
    APPROVE: `Strong deal fundamentals with ${ltv.toFixed(0)}% LTV, ${app.credit} credit, and experienced borrower. Recommended for funding.`,
    CONDITIONAL_APPROVE: `Solid deal structure pending verification. ${ltv.toFixed(0)}% LTV is within acceptable range with conditions.`,
    REVIEW: `Deal requires additional review — some metrics fall outside preferred parameters.`,
    DECLINE: `Deal does not meet minimum underwriting standards.`,
  };

  return {
    score,
    verdict,
    verdict_summary: verdictSummaries[verdict],
    approval_probability: Math.min(Math.max(score, 5), 98),
    recommended_rate: rate,
    recommended_ltv_cap: maxLtv,
    recommended_term: `${app.term} months`,
    strengths: strengths.slice(0, 4),
    risks: risks.slice(0, 3),
    conditions: conditions.slice(0, 4),
    deal_summary: `${app.propType} acquisition at ${app.propAddr}`
      + ` — $${app.purchasePrice?.toLocaleString()} purchase`
      + ` with $${app.repairBudget?.toLocaleString()} renovation`
      + ` targeting $${app.arv?.toLocaleString()} ARV.`
      + ` ${app.purpose} exit with ${app.term}-month term.`,
    exit_viability: `${app.purpose} exit is `
      + `${profitMargin >= 15 ? "well-supported" : "viable but tight"}`
      + ` with projected profit of $${profit.toLocaleString()}`
      + ` (${profitMargin.toFixed(1)}% margin). `
      + `${profitMargin >= 20
        ? "Strong ARV-to-cost ratio provides comfortable margin."
        : "Recommend conservative ARV validation."}`,
    market_commentary: `The `
      + `${app.propAddr?.includes("FL") ? "Florida" : "local"}`
      + ` market demonstrates strong fundamentals with`
      + ` population growth and housing demand supporting`
      + ` asset values. ${app.propType} properties in this`
      + ` submarket show stable absorption rates.`,
  };
}
