/**
 * @fileoverview Construction Loan Underwriting Scoring Engine
 * @module scoring/construction
 *
 * Scoring Matrix:
 * - LTC (Loan-to-Cost):     25 points
 * - Credit:                  20 points
 * - Experience:              20 points
 * - Permits & Plans:         15 points
 * - Liquidity:               10 points
 * - Documentation:           10 points
 *
 * Verdict Thresholds:
 * - APPROVE:            >= 82
 * - CONDITIONAL_APPROVE: 68-81
 * - REVIEW:              50-67
 * - DECLINE:             < 50
 */

/**
 * Run Construction loan underwriting analysis
 * @param {Object} app - Construction loan application data
 * @param {number} app.lotValue - Land/lot value
 * @param {number} app.loanAmt - Requested loan amount
 * @param {number} [app.totalBudget] - Total construction budget
 * @param {number} [app.hardCosts] - Hard construction costs
 * @param {number} [app.softCosts] - Soft costs
 * @param {number} [app.completedValue] - Expected completed value
 * @param {number} [app.arv] - After repair value (fallback for completedValue)
 * @param {string} app.credit - Credit score range
 * @param {string} app.experience - Investor experience level
 * @param {number} app.liquid - Liquid reserves
 * @param {number} app.uploads - Number of uploaded docs
 * @param {string} [app.permitStatus] - Permit status
 * @param {string} [app.plansStatus] - Architectural plans status
 * @param {string} [app.gcContract] - GC contract status
 * @param {string} [app.constructionType] - Construction type
 * @param {string} app.term - Loan term in months
 * @param {string} app.propType - Property type
 * @param {string} app.propAddr - Property address
 * @returns {Object} Underwriting result
 */
export function runConstructionUnderwriting(app) {
  const totalCost = (app.lotValue || 0) + (app.totalBudget || app.hardCosts || 0) + (app.softCosts || 0);
  const ltc = totalCost > 0 ? ((app.loanAmt / totalCost) * 100) : 0;
  const completedVal = app.completedValue || app.arv || 0;
  const ltv = completedVal > 0 ? ((app.loanAmt / completedVal) * 100) : 0;

  let score = 0;

  // LTC scoring (max 25)
  if (ltc <= 65) score += 25;
  else if (ltc <= 70) score += 22;
  else if (ltc <= 75) score += 18;
  else if (ltc <= 80) score += 12;
  else score += 5;

  // Credit (max 20)
  const creditMap = {
    "760+": 20, "720-759": 18, "700-719": 16, "680-699": 14,
    "660-679": 11, "640-659": 8, "620-639": 5, "below620": 3,
  };
  score += (creditMap[app.credit] || 8);

  // Experience (max 20)
  const expMap = {
    "25+": 20, "11-25": 16, "4-10": 12, "1-3": 7, "first": 3,
  };
  score += (expMap[app.experience] || 8);

  // Permits & Plans readiness (max 15)
  let readiness = 0;
  if (app.permitStatus === "approved") readiness += 5;
  else if (app.permitStatus === "submitted") readiness += 3;
  else readiness += 1;
  if (app.plansStatus === "complete") readiness += 5;
  else if (app.plansStatus === "in_progress") readiness += 3;
  else readiness += 1;
  if (app.gcContract === "signed") readiness += 5;
  else if (app.gcContract === "self") readiness += 4;
  else if (app.gcContract === "bidding") readiness += 2;
  else readiness += 1;
  score += readiness;

  // Liquidity (max 10)
  const liqRatio = app.liquid / (app.loanAmt || 1);
  if (liqRatio >= 0.5) score += 10;
  else if (liqRatio >= 0.3) score += 7;
  else if (liqRatio >= 0.15) score += 4;
  else score += 2;

  // Documentation (max 10)
  if (app.uploads >= 8) score += 10;
  else if (app.uploads >= 5) score += 7;
  else if (app.uploads >= 3) score += 4;
  else score += 2;

  score = Math.min(score, 100);

  const verdict = score >= 82 ? "APPROVE"
    : score >= 68 ? "CONDITIONAL_APPROVE"
    : score >= 50 ? "REVIEW" : "DECLINE";

  const rate = ltc <= 65 ? "8.0%" : ltc <= 70 ? "9.0%"
    : ltc <= 75 ? "10.0%" : ltc <= 80 ? "11.0%" : "12.0%";
  const maxLtc = score >= 80 ? "80%" : score >= 65 ? "75%" : "70%";

  const strengths = [];
  const risks = [];
  const conditions = [
    "Full appraisal with as-complete valuation required",
    "Detailed construction budget and draw schedule",
    "Title search, title insurance, and builder risk insurance required",
  ];

  const constTypeLabel = {
    ground_up: "Ground-Up New Build",
    tear_down: "Tear-Down & Rebuild",
    major_reno: "Major Renovation",
  }[app.constructionType] || "Construction";

  if (ltc <= 70) {
    strengths.push(
      `Conservative LTC at ${ltc.toFixed(1)}% provides strong cost coverage`
    );
  }
  if (app.credit === "720+") {
    strengths.push(
      "Excellent credit profile (720+) indicates strong borrower reliability"
    );
  }
  if (["25+", "11-25"].includes(app.experience)) {
    strengths.push(
      `Experienced builder (${app.experience}) reduces construction execution risk`
    );
  }
  if (app.permitStatus === "approved") {
    strengths.push(
      "Permits approved and in-hand — project ready for immediate start"
    );
  }
  if (app.plansStatus === "complete" && app.gcContract === "signed") {
    strengths.push(
      "Complete stamped plans with signed GC contract — full project readiness"
    );
  }
  if (liqRatio >= 0.3) {
    strengths.push(
      `Adequate liquidity ($${app.liquid?.toLocaleString()}) supports project contingencies`
    );
  }
  if (strengths.length < 2) {
    strengths.push(
      `${constTypeLabel} project in active market supports completion value`
    );
  }

  if (ltc > 80) {
    risks.push(
      `High LTC at ${ltc.toFixed(1)}% — limited equity cushion for cost overruns`
    );
  }
  if (app.experience === "first") {
    risks.push(
      "First-time builder — no prior construction track record increases timeline and cost risk"
    );
  }
  if (app.permitStatus === "not_applied") {
    risks.push(
      "Permits not yet applied for — regulatory delays could significantly impact timeline"
    );
  }
  if (app.plansStatus === "none" || app.plansStatus === "preliminary") {
    risks.push(
      "Plans not finalized — incomplete design increases budget uncertainty"
    );
  }
  if (app.gcContract === "none") {
    risks.push(
      "No GC under contract — project lacks confirmed construction management"
    );
  }
  if (risks.length < 1) {
    risks.push(
      "Construction projects inherently carry timeline and cost overrun risks"
    );
  }

  if (app.experience === "first") {
    conditions.push(
      "Third-party construction manager or experienced GC required"
    );
  }
  if (app.permitStatus !== "approved") {
    conditions.push(
      "All required permits must be obtained before first draw"
    );
  }
  if (app.plansStatus !== "complete") {
    conditions.push(
      "Finalized and stamped architectural plans required before closing"
    );
  }

  const verdictSummaries = {
    APPROVE: `Strong ${constTypeLabel.toLowerCase()} project — ${ltc.toFixed(0)}% LTC, experienced builder, permits ready. Recommended for funding.`,
    CONDITIONAL_APPROVE: `${constTypeLabel} project meets criteria with conditions. ${ltc.toFixed(0)}% LTC acceptable pending verifications.`,
    REVIEW: `${constTypeLabel} project requires additional review — readiness or borrower metrics need strengthening.`,
    DECLINE: `${constTypeLabel} project does not meet minimum underwriting standards. Significant readiness gaps identified.`,
  };

  return {
    score,
    verdict,
    verdict_summary: verdictSummaries[verdict],
    approval_probability: Math.min(Math.max(score, 5), 98),
    recommended_rate: rate,
    recommended_ltv_cap: maxLtc,
    recommended_term: `${app.term || 18} months`,
    strengths: strengths.slice(0, 4),
    risks: risks.slice(0, 3),
    conditions: conditions.slice(0, 4),
    deal_summary: `${constTypeLabel} ${app.propType || "property"} at ${app.propAddr}`
      + ` — $${(app.lotValue || 0).toLocaleString()} land`
      + ` + $${(app.totalBudget || app.hardCosts || 0).toLocaleString()}`
      + ` budget targeting $${completedVal.toLocaleString()}`
      + ` completed value. ${ltc.toFixed(0)}% LTC.`,
    exit_viability: `${constTypeLabel} exit via `
      + `${completedVal > 0
        ? `sale at $${completedVal.toLocaleString()} completed value`
        : "sale upon completion"}`
      + ` or refinance to permanent financing. `
      + `${ltv <= 70
        ? "Strong completed LTV supports multiple exit paths."
        : "Completed LTV requires market price achievement."}`,
    market_commentary: `${app.propAddr?.includes("FL") ? "Florida" : "Local"}`
      + ` construction market shows active new development activity.`
      + ` ${app.propType || "Property"} completions in this submarket`
      + ` are achieving strong absorption rates and competitive pricing.`,
  };
}
