/**
 * @fileoverview Agent 2: Fix-and-Flip Pro Forma (BOUT-UW-06)
 * @module agents/fixAndFlipProForma
 *
 * THE core underwriting model for Hard Money loans.
 * Full P&L: purchase, rehab line items, holding costs, ARV,
 * net profit, ROI, annualized ROI, breakeven ARV,
 * and sensitivity table (rehab overrun vs ARV shortfall).
 *
 * Avatars: Hard Money
 */

/**
 * Run Fix-and-Flip Pro Forma Analysis
 * @param {Object} app - Hard Money loan application data
 * @returns {Object} Complete flip pro forma result
 */
export function runFixAndFlipProForma(app) {
  const purchasePrice = app.purchasePrice || 0;
  const loanAmt = app.loanAmt || 0;
  const arv = app.arv || 0;
  const repairBudget = app.repairBudget || 0;
  const rate = app.interestRate || 0.095;

  // Rehab line items (from SOW or defaults)
  const rehabItems = app.rehabItems || [
    { item: "Kitchen", cost: repairBudget * 0.25 },
    { item: "Bathrooms", cost: repairBudget * 0.15 },
    { item: "Flooring", cost: repairBudget * 0.12 },
    { item: "Paint/Drywall", cost: repairBudget * 0.08 },
    { item: "Exterior/Roof", cost: repairBudget * 0.15 },
    { item: "Systems (HVAC/Elec/Plumb)", cost: repairBudget * 0.15 },
    { item: "Landscaping", cost: repairBudget * 0.05 },
    { item: "Contingency (5%)", cost: repairBudget * 0.05 },
  ];

  // Closing costs
  const purchaseClosing = purchasePrice * 0.02; // 2% buy-side
  const loanOrigination = loanAmt * 0.02; // 2 points
  const loanClosing = 3500; // Title, legal, appraisal

  // Hold period
  const rehabMonths = app.rehabTimeline || 4;
  const marketingMonths = app.marketingMonths || 2;
  const totalHoldMonths = rehabMonths + marketingMonths;

  // Holding costs during rehab
  const monthlyInterest = loanAmt * (rate / 12);
  const monthlyTaxes = (purchasePrice * 0.012) / 12;
  const monthlyInsurance = (purchasePrice * 0.004 * 3.2) / 12; // FL adjusted
  const monthlyUtilities = 350;
  const monthlyHolding = monthlyInterest + monthlyTaxes + monthlyInsurance + monthlyUtilities;
  const totalHoldingCosts = monthlyHolding * totalHoldMonths;

  // Sale costs
  const saleCommission = arv * 0.05; // 5% agent commission
  const saleClosing = arv * 0.015; // 1.5% seller closing
  const totalSaleCosts = saleCommission + saleClosing;

  // Total investment
  const totalCashIn = purchasePrice + repairBudget + purchaseClosing +
    loanOrigination + loanClosing + totalHoldingCosts;
  const cashToClose = purchasePrice - loanAmt + purchaseClosing + loanOrigination + loanClosing;
  const totalEquityRequired = cashToClose + repairBudget + totalHoldingCosts;

  // Profit
  const grossProfit = arv - purchasePrice - repairBudget;
  const netProfit = arv - totalCashIn - totalSaleCosts;
  const roi = totalEquityRequired > 0 ? (netProfit / totalEquityRequired) * 100 : 0;
  const annualizedROI = totalHoldMonths > 0 ? roi * (12 / totalHoldMonths) : 0;

  // Breakeven ARV
  const breakevenARV = totalCashIn + totalSaleCosts;
  const arvToBreakevenRatio = arv > 0 ? ((arv - breakevenARV) / arv) * 100 : 0;

  // LTV metrics
  const purchaseLTV = purchasePrice > 0 ? (loanAmt / purchasePrice) * 100 : 0;
  const arvLTV = arv > 0 ? (loanAmt / arv) * 100 : 0;

  // 70% Rule check (industry standard)
  const maxOffer70Rule = arv * 0.70 - repairBudget;
  const passes70Rule = purchasePrice <= maxOffer70Rule;

  // Sensitivity table: rehab overrun vs ARV shortfall
  const sensitivity = [];
  const rehabScenarios = [0, 0.10, 0.20, 0.30]; // 0%, +10%, +20%, +30%
  const arvScenarios = [0, -0.05, -0.10, -0.15]; // 0%, -5%, -10%, -15%

  for (const rehabOver of rehabScenarios) {
    const row = { rehabOverrun: `+${Math.round(rehabOver * 100)}%`, scenarios: [] };
    for (const arvDrop of arvScenarios) {
      const adjRehab = repairBudget * (1 + rehabOver);
      const adjARV = arv * (1 + arvDrop);
      const adjTotalCost = purchasePrice + adjRehab + purchaseClosing +
        loanOrigination + loanClosing + totalHoldingCosts;
      const adjSaleCosts = adjARV * 0.065;
      const adjNet = adjARV - adjTotalCost - adjSaleCosts;
      const adjEquity = cashToClose + adjRehab + totalHoldingCosts;
      const adjROI = adjEquity > 0 ? (adjNet / adjEquity) * 100 : 0;
      row.scenarios.push({
        arvChange: `${Math.round(arvDrop * 100)}%`,
        netProfit: Math.round(adjNet),
        roi: Math.round(adjROI * 10) / 10,
        profitable: adjNet > 0,
      });
    }
    sensitivity.push(row);
  }

  return {
    agentId: "fix-and-flip",
    agentName: "Fix-and-Flip Pro Forma",
    promptRef: "BOUT-UW-06",
    loanType: "hardmoney",
    acquisition: {
      purchasePrice,
      loanAmt,
      purchaseClosing: Math.round(purchaseClosing),
      loanOrigination: Math.round(loanOrigination),
      loanClosing,
      cashToClose: Math.round(cashToClose),
      purchaseLTV: Math.round(purchaseLTV * 10) / 10,
      arvLTV: Math.round(arvLTV * 10) / 10,
    },
    renovation: {
      totalBudget: repairBudget,
      lineItems: rehabItems.map(i => ({ item: i.item, cost: Math.round(i.cost) })),
      timelineMonths: rehabMonths,
    },
    holdingCosts: {
      monthlyInterest: Math.round(monthlyInterest),
      monthlyTaxes: Math.round(monthlyTaxes),
      monthlyInsurance: Math.round(monthlyInsurance),
      monthlyUtilities,
      monthlyTotal: Math.round(monthlyHolding),
      totalHoldMonths,
      totalHoldingCosts: Math.round(totalHoldingCosts),
    },
    disposition: {
      arv,
      saleCommission: Math.round(saleCommission),
      saleClosing: Math.round(saleClosing),
      totalSaleCosts: Math.round(totalSaleCosts),
    },
    returns: {
      grossProfit: Math.round(grossProfit),
      netProfit: Math.round(netProfit),
      totalEquityRequired: Math.round(totalEquityRequired),
      roi: Math.round(roi * 10) / 10,
      annualizedROI: Math.round(annualizedROI * 10) / 10,
      breakevenARV: Math.round(breakevenARV),
      arvCushion: Math.round(arvToBreakevenRatio * 10) / 10,
      passes70Rule,
      maxOffer70Rule: Math.round(maxOffer70Rule),
    },
    sensitivity,
    verdict: netProfit > 0 && passes70Rule ? "PROFITABLE" : netProfit > 0 ? "MARGINAL" : "UNPROFITABLE",
    flags: [
      ...(!passes70Rule ? ["FAILS_70_RULE: Purchase exceeds 70% of ARV minus repairs"] : []),
      ...(netProfit <= 0 ? ["NEGATIVE_PROFIT: Deal loses money at stated ARV"] : []),
      ...(arvToBreakevenRatio < 10 ? ["THIN_CUSHION: Less than 10% ARV cushion above breakeven"] : []),
      ...(annualizedROI < 20 ? ["LOW_ANNUALIZED_ROI: Below 20% annualized — may not justify risk"] : []),
      ...(totalHoldMonths > 8 ? ["LONG_HOLD: Over 8 months — increased market risk"] : []),
    ],
  };
}
