/**
 * @fileoverview No-Doc Loan Underwriting Scoring Engine
 * @module scoring/nodoc
 *
 * Scoring Matrix:
 * - Credit Score:    25 points
 * - LTV:            20 points
 * - Assets/Reserves: 20 points
 * - Down Payment:    15 points
 * - Doc Level:       10 points
 * - Occupancy:        5 points
 * - Property Type:    5 points
 *
 * Verdict Thresholds:
 * - APPROVE:            >= 80
 * - CONDITIONAL_APPROVE: 65-79
 * - REVIEW:              50-64
 * - DECLINE:             < 50
 */

/**
 * Run No-Doc loan underwriting analysis
 * @param {Object} app - No-Doc loan application data
 * @param {number} app.purchasePrice - Property purchase price
 * @param {number} app.loanAmt - Requested loan amount
 * @param {string} app.credit - Credit score range
 * @param {number} app.liquid - Liquid reserves
 * @param {string} app.noDocSubtype - Program type (bankstatement, asset_depletion, profit_loss, nina)
 * @param {string} app.statementPeriod - Statement period in months
 * @param {string} app.occupancy - Occupancy type
 * @param {string} app.propType - Property type
 * @param {number} app.uploads - Number of uploaded docs
 * @param {number} [app.avgMonthlyDeposits] - Average monthly deposits
 * @param {string} app.propAddr - Property address
 * @returns {Object} Underwriting result with score, verdict, strengths, risks, conditions
 */
export function runNoDocUnderwriting(app) {
  const ltv = app.purchasePrice > 0
    ? ((app.loanAmt / app.purchasePrice) * 100) : 0;
  const downPct = app.purchasePrice > 0
    ? ((1 - app.loanAmt / app.purchasePrice) * 100) : 0;

  const creditMap = {
    "720+": 25, "700-719": 20, "680-719": 15,
    "660-679": 10, "640-659": 6, "620-639": 3, "below600": 1,
  };

  let score = 0;

  // Credit (25pt)
  score += (creditMap[app.credit] || 10);

  // LTV (20pt)
  if (ltv <= 65) score += 20;
  else if (ltv <= 70) score += 17;
  else if (ltv <= 75) score += 14;
  else if (ltv <= 80) score += 10;
  else score += 3;

  // Assets/Reserves (20pt)
  const reserveMonths = (app.liquid > 0 && app.loanAmt > 0)
    ? Math.floor(app.liquid / (app.loanAmt / 12)) : 0;
  if (reserveMonths >= 24) score += 20;
  else if (reserveMonths >= 12) score += 15;
  else if (reserveMonths >= 6) score += 10;
  else score += 4;

  // Down payment (15pt)
  if (downPct >= 30) score += 15;
  else if (downPct >= 25) score += 12;
  else if (downPct >= 20) score += 9;
  else if (downPct >= 15) score += 6;
  else score += 3;

  // Doc level (10pt)
  const docMap = {
    bankstatement: app.statementPeriod === "24" ? 10 : 8,
    asset_depletion: 8, profit_loss: 6,
    stated_income: 4, nina: 2,
  };
  score += (docMap[app.noDocSubtype] || 5);

  // Occupancy (5pt)
  score += ({ investment: 5, primary: 4, second: 3 }[app.occupancy] || 3);

  // Property (5pt)
  score += ({
    sfr: 5, duplex: 4, triplex: 4, fourplex: 4, condo: 3,
  }[app.propType] || 3);

  score = Math.min(score, 100);

  const verdict = score >= 80 ? "APPROVE"
    : score >= 65 ? "CONDITIONAL_APPROVE"
    : score >= 50 ? "REVIEW" : "DECLINE";

  const subtypeLabel = {
    bankstatement: "Bank Statement",
    asset_depletion: "Asset Depletion",
    profit_loss: "P&L Only",
    stated_income: "Stated Income",
    nina: "NINA",
  }[app.noDocSubtype] || "No-Doc";

  const rate = score >= 80 ? "7.5%"
    : score >= 65 ? "8.5%"
    : score >= 50 ? "9.5%" : "10.5%";

  const strengths = [];
  const risks = [];
  const conditions = [
    "Property appraisal by approved appraiser required",
    "Proof of down payment funds required",
    "Title search, title insurance, and hazard insurance required",
  ];

  if (app.credit === "720+" || app.credit === "700-719") {
    strengths.push(
      `Strong credit profile (${app.credit}) compensates for reduced documentation`
    );
  }
  if (downPct >= 25) {
    strengths.push(
      `Substantial ${downPct.toFixed(0)}% down payment reduces lender exposure significantly`
    );
  }
  if (reserveMonths >= 12) {
    strengths.push(
      `${reserveMonths} months reserves demonstrate strong financial position`
    );
  }
  if (app.noDocSubtype === "bankstatement") {
    strengths.push(
      `${app.statementPeriod}-month bank statement program provides income verification through deposit history`
    );
  }
  if (app.avgMonthlyDeposits > 0) {
    strengths.push(
      `Average monthly deposits of $${app.avgMonthlyDeposits?.toLocaleString()} support repayment ability`
    );
  }
  if (ltv <= 70) {
    strengths.push(
      `Conservative LTV at ${ltv.toFixed(1)}% provides strong equity cushion for non-QM product`
    );
  }

  if (["640-659", "620-639", "below600"].includes(app.credit)) {
    risks.push(
      `Credit score (${app.credit}) below preferred threshold for no-doc product`
    );
  }
  if (ltv > 75) {
    risks.push(
      `LTV at ${ltv.toFixed(1)}% is elevated for a no-doc product — recommend 75% or below`
    );
  }
  if (downPct < 20) {
    risks.push(
      `Down payment of ${downPct.toFixed(0)}% below 20% minimum for most no-doc programs`
    );
  }
  if (app.noDocSubtype === "nina") {
    risks.push(
      "NINA program has highest risk profile — no income or asset verification"
    );
  }
  if (app.noDocSubtype === "stated_income") {
    risks.push(
      "Stated income not independently verified — lender relies on borrower declaration"
    );
  }
  if (risks.length < 1) {
    risks.push(
      "Non-QM products carry inherently higher risk premium vs conventional financing"
    );
  }

  if (app.noDocSubtype === "bankstatement") {
    conditions.push(
      `${app.statementPeriod} months personal or business bank statements required`
    );
    if (app.statementPeriod === "12") {
      conditions.push(
        "CPA letter required for 12-month bank statement program"
      );
    }
  }
  if (app.noDocSubtype === "asset_depletion") {
    conditions.push(
      "60-day asset statements from all accounts used for qualification"
    );
  }
  if (app.noDocSubtype === "nina" && app.occupancy !== "investment") {
    conditions.push(
      "NINA only available for investment properties — occupancy must be changed"
    );
  }

  const verdictSummaries = {
    APPROVE: `${subtypeLabel} program approved — ${app.credit} credit with ${downPct.toFixed(0)}% down and ${ltv.toFixed(0)}% LTV meets all thresholds.`,
    CONDITIONAL_APPROVE: `${subtypeLabel} application conditionally approved pending documentation. ${ltv.toFixed(0)}% LTV acceptable with conditions.`,
    REVIEW: `${subtypeLabel} application requires additional review. Some metrics fall outside standard no-doc parameters.`,
    DECLINE: `${subtypeLabel} application does not meet minimum no-doc thresholds. Consider alternative program or restructuring.`,
  };

  return {
    score,
    verdict,
    verdict_summary: verdictSummaries[verdict],
    approval_probability: Math.min(Math.max(score, 5), 98),
    recommended_rate: rate,
    recommended_ltv_cap: score >= 80 ? "80%" : "75%",
    recommended_term: "30 years fixed",
    strengths: strengths.slice(0, 4),
    risks: risks.slice(0, 3),
    conditions: conditions.slice(0, 4),
    deal_summary: `${subtypeLabel} ${app.propType} at ${app.propAddr}`
      + ` — $${app.purchasePrice?.toLocaleString()} purchase`
      + ` at ${ltv.toFixed(0)}% LTV.`
      + ` ${app.occupancy === "primary" ? "Owner-occupied" : "Investment"}`
      + ` property.`
      + `${app.avgMonthlyDeposits
        ? ` $${app.avgMonthlyDeposits?.toLocaleString()}/mo avg deposits.`
        : ""}`,
    exit_viability: app.occupancy === "primary"
      ? "Primary residence — standard mortgage exit via refinance to conventional when documentation becomes available."
      : "Investment property — rental income supports ongoing debt service with eventual refinance to DSCR or conventional product.",
    market_commentary: `${app.propAddr?.includes("FL") ? "Florida" : "Local"}`
      + ` real estate market supports`
      + ` ${app.occupancy === "primary" ? "owner-occupied" : "investment"}`
      + ` acquisitions. ${app.propType} values in this area show`
      + ` stability with moderate appreciation trends.`,
  };
}
