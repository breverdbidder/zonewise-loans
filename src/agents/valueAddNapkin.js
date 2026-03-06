/**
 * @fileoverview Agent 2 Pre-Check: Value-Add Napkin Model (BOUT-SCR-03)
 * @module agents/valueAddNapkin
 *
 * Quick value-add feasibility check before full pro forma runs.
 * Current cap vs stabilized cap on total cost, gross profit,
 * return on cost, equity required, levered IRR at stabilization.
 *
 * Avatars: Hard Money, Construction
 */

/**
 * Run Value-Add Napkin Analysis
 * @param {Object} app - Loan application data
 * @returns {Object} Napkin analysis result
 */
export function runValueAddNapkin(app) {
  const purchasePrice = app.purchasePrice || 0;
  const rehabBudget = app.repairBudget || app.totalBudget || 0;
  const closingCosts = purchasePrice * 0.03; // 3% estimate
  const totalCost = purchasePrice + rehabBudget + closingCosts;

  // Current NOI estimate (pre-renovation)
  const currentRent = (app.currentMonthlyRent || app.monthlyRent || 0) * 12;
  const currentVacancy = currentRent * 0.08;
  const currentOpex = currentRent * 0.40;
  const currentNOI = currentRent - currentVacancy - currentOpex;

  // Stabilized NOI (post-renovation)
  const arv = app.arv || app.completedValue || purchasePrice;
  const stabilizedRent = app.projectedMonthlyRent
    ? app.projectedMonthlyRent * 12
    : currentRent * 1.25; // 25% rent bump default for value-add
  const stabVacancy = stabilizedRent * 0.05;
  const stabOpex = stabilizedRent * 0.35;
  const stabilizedNOI = stabilizedRent - stabVacancy - stabOpex;

  // Cap rates
  const currentCap = purchasePrice > 0 ? (currentNOI / purchasePrice) * 100 : 0;
  const stabilizedCapOnCost = totalCost > 0 ? (stabilizedNOI / totalCost) * 100 : 0;
  const exitCapRate = 0.07; // 7% exit cap assumption
  const stabilizedValue = stabilizedNOI > 0 ? stabilizedNOI / exitCapRate : arv;

  // Profit & returns
  const grossProfit = stabilizedValue - totalCost;
  const grossMargin = stabilizedValue > 0 ? (grossProfit / stabilizedValue) * 100 : 0;
  const returnOnCost = totalCost > 0 ? (stabilizedNOI / totalCost) * 100 : 0;

  // Equity & leverage
  const loanAmt = app.loanAmt || totalCost * 0.7;
  const equity = totalCost - loanAmt;
  const debtService = loanAmt * (app.interestRate || 0.095);
  const cashFlowStabilized = stabilizedNOI - debtService;
  const cocStabilized = equity > 0 ? (cashFlowStabilized / equity) * 100 : 0;

  // Timeline
  const monthsToStabilize = app.rehabTimeline || app.constructionTimeline || 6;
  const holdingCosts = (debtService / 12 + (purchasePrice * 0.015 / 12) + 500) * monthsToStabilize;
  const totalInvestment = totalCost + holdingCosts;
  const netProfit = stabilizedValue - totalInvestment - (stabilizedValue * 0.06); // 6% sale costs

  // Quick IRR estimate (simplified)
  const yearsToStabilize = monthsToStabilize / 12;
  const quickIRR = equity > 0 ? (Math.pow((equity + netProfit) / equity, 1 / yearsToStabilize) - 1) * 100 : 0;

  // Pencil test
  const pencils = grossProfit > 0 && returnOnCost > 7 && quickIRR > 15;

  return {
    agentId: "value-add-napkin",
    agentName: "Value-Add Napkin Model",
    promptRef: "BOUT-SCR-03",
    loanType: app.loanType,
    metrics: {
      purchasePrice,
      rehabBudget,
      closingCosts: Math.round(closingCosts),
      totalCost: Math.round(totalCost),
      holdingCosts: Math.round(holdingCosts),
      totalInvestment: Math.round(totalInvestment),
      currentNOI: Math.round(currentNOI),
      stabilizedNOI: Math.round(stabilizedNOI),
      currentCap: Math.round(currentCap * 100) / 100,
      stabilizedCapOnCost: Math.round(stabilizedCapOnCost * 100) / 100,
      stabilizedValue: Math.round(stabilizedValue),
      grossProfit: Math.round(grossProfit),
      grossMargin: Math.round(grossMargin * 100) / 100,
      netProfit: Math.round(netProfit),
      returnOnCost: Math.round(returnOnCost * 100) / 100,
      equity: Math.round(equity),
      cocStabilized: Math.round(cocStabilized * 100) / 100,
      quickIRR: Math.round(quickIRR * 100) / 100,
      monthsToStabilize,
    },
    pencils,
    verdict: pencils ? "DEAL_PENCILS" : "DOES_NOT_PENCIL",
    flags: [
      ...(grossProfit <= 0 ? ["NEGATIVE_PROFIT: Stabilized value below total cost"] : []),
      ...(returnOnCost < 7 ? ["LOW_ROC: Return on cost below 7%"] : []),
      ...(monthsToStabilize > 12 ? ["LONG_STABILIZATION: Over 12 months to stabilize"] : []),
      ...(grossMargin < 15 ? ["THIN_MARGIN: Gross margin below 15%"] : []),
    ],
  };
}
