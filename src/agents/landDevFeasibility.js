/**
 * @fileoverview Agent 7: Land Development Feasibility + Zoning (BOUT-SCR-05)
 * @module agents/landDevFeasibility
 *
 * Construction loan exclusive. Cross-references borrower's stated
 * buildable SF against ZoneWise zoning data. Auto-flags discrepancies.
 *
 * Avatars: Construction
 */

/**
 * Default zoning parameters when live ZoneWise data unavailable
 * Will be replaced by Supabase query in production
 */
const DEFAULT_ZONING = {
  maxFAR: 0.35,
  maxHeight: 35, // feet
  setbacks: { front: 25, side: 10, rear: 20 },
  minLotSize: 7500, // sqft
  maxDensity: 1, // units per lot (SFR default)
  zoningDistrict: "R-1",
  permittedUse: ["single-family residential"],
};

/**
 * Calculate buildable area from lot dimensions and setbacks
 * @param {number} lotWidth - Lot width in feet
 * @param {number} lotDepth - Lot depth in feet
 * @param {Object} setbacks - Front/side/rear setbacks
 * @returns {{ buildableWidth: number, buildableDepth: number, buildableArea: number }}
 */
function calcBuildableArea(lotWidth, lotDepth, setbacks) {
  const bw = Math.max(0, lotWidth - setbacks.side * 2);
  const bd = Math.max(0, lotDepth - setbacks.front - setbacks.rear);
  return { buildableWidth: bw, buildableDepth: bd, buildableArea: bw * bd };
}

/**
 * Run Land Development Feasibility Analysis
 * @param {Object} app - Construction loan application
 * @param {Object} [zoningData] - ZoneWise zoning data (from Supabase)
 * @returns {Object} Feasibility result
 */
export function runLandDevFeasibility(app, zoningData = null) {
  const zoning = zoningData || DEFAULT_ZONING;
  const lotSize = app.lotSize || app.lotSqft || 10000;
  const lotWidth = app.lotWidth || Math.sqrt(lotSize * 0.6); // estimate
  const lotDepth = app.lotDepth || lotSize / lotWidth;
  const landCost = app.lotValue || app.landCost || 0;

  // ═══ ZONING VALIDATION ═══
  const buildable = calcBuildableArea(lotWidth, lotDepth, zoning.setbacks);
  const maxBuildableSF = Math.min(buildable.buildableArea, lotSize * zoning.maxFAR);
  const maxStories = Math.floor(zoning.maxHeight / 10); // ~10ft per story
  const maxTotalSF = maxBuildableSF * maxStories;

  // Borrower's stated buildable
  const borrowerStatedSF = app.totalBuildableSF || app.buildableUnits || 0;
  const sfDiscrepancy = borrowerStatedSF > 0
    ? ((borrowerStatedSF - maxTotalSF) / maxTotalSF) * 100 : 0;
  const sfOverstated = sfDiscrepancy > 10; // >10% above zoning allows

  // ═══ COST ANALYSIS ═══
  const hardCostPerSF = app.hardCostPerSF || 175; // FL avg
  const softCostPct = app.softCostPct || 0.15;
  const contingencyPct = app.contingencyPct || 0.10;

  const hardCosts = (borrowerStatedSF || maxTotalSF) * hardCostPerSF;
  const softCosts = hardCosts * softCostPct;
  const contingency = hardCosts * contingencyPct;
  const totalConstructionCost = hardCosts + softCosts + contingency;
  const totalDevelopmentCost = landCost + totalConstructionCost;

  // ═══ VALUE ANALYSIS ═══
  const completedValue = app.completedValue || app.arv || 0;
  const targetDevYield = app.targetDevYield || 8; // 8% target
  const requiredNOI = totalDevelopmentCost * (targetDevYield / 100);
  const marketCapRate = app.exitCapRate || 7;
  const estimatedValue = requiredNOI > 0 ? requiredNOI / (marketCapRate / 100) : 0;

  // Implied rent
  const impliedRentPerSF = (borrowerStatedSF || maxTotalSF) > 0
    ? requiredNOI / (borrowerStatedSF || maxTotalSF) / 12 : 0;
  const impliedRentPerUnit = app.buildableUnits
    ? requiredNOI / app.buildableUnits / 12 : requiredNOI / 12;

  // ═══ GO/NO-GO TEST ═══
  const profitMarginTarget = app.profitMarginTarget || 15; // 15% min profit
  const profit = (completedValue || estimatedValue) - totalDevelopmentCost;
  const profitMargin = totalDevelopmentCost > 0
    ? (profit / totalDevelopmentCost) * 100 : 0;
  const goNoGo = profitMargin >= profitMarginTarget;

  // ═══ LOAN SIZING ═══
  const maxLTC = 0.80;
  const maxLoanOnCost = totalDevelopmentCost * maxLTC;
  const maxLoanOnValue = (completedValue || estimatedValue) * 0.70;
  const maxLoan = Math.min(maxLoanOnCost, maxLoanOnValue);
  const requestedLoan = app.loanAmt || 0;
  const loanExceedsMax = requestedLoan > maxLoan;

  return {
    agentId: "land-dev-feasibility",
    agentName: "Land Development Feasibility",
    promptRef: "BOUT-SCR-05",
    loanType: "construction",
    zoningCheck: {
      district: zoning.zoningDistrict,
      maxFAR: zoning.maxFAR,
      maxHeight: zoning.maxHeight,
      setbacks: zoning.setbacks,
      lotSize,
      buildableFootprint: Math.round(buildable.buildableArea),
      maxBuildableSF: Math.round(maxBuildableSF),
      maxStories,
      maxTotalSF: Math.round(maxTotalSF),
      borrowerStatedSF,
      sfDiscrepancy: Math.round(sfDiscrepancy),
      sfOverstated,
      permittedUse: zoning.permittedUse,
    },
    costAnalysis: {
      landCost,
      hardCostPerSF,
      hardCosts: Math.round(hardCosts),
      softCosts: Math.round(softCosts),
      contingency: Math.round(contingency),
      totalConstructionCost: Math.round(totalConstructionCost),
      totalDevelopmentCost: Math.round(totalDevelopmentCost),
    },
    valueAnalysis: {
      completedValue: completedValue || Math.round(estimatedValue),
      targetDevYield,
      requiredNOI: Math.round(requiredNOI),
      impliedRentPerSF: Math.round(impliedRentPerSF * 100) / 100,
      impliedRentPerUnit: Math.round(impliedRentPerUnit),
      profit: Math.round(profit),
      profitMargin: Math.round(profitMargin * 10) / 10,
    },
    loanSizing: {
      maxLoanOnCost: Math.round(maxLoanOnCost),
      maxLoanOnValue: Math.round(maxLoanOnValue),
      maxLoan: Math.round(maxLoan),
      requestedLoan,
      loanExceedsMax,
    },
    goNoGo,
    verdict: !goNoGo ? "NO_GO" : sfOverstated ? "CONDITIONAL_GO" : "GO",
    flags: [
      ...(sfOverstated ? [`ZONING_CONFLICT: Borrower states ${borrowerStatedSF} SF but zoning allows max ${Math.round(maxTotalSF)} SF — ${Math.round(sfDiscrepancy)}% overstated`] : []),
      ...(profitMargin < profitMarginTarget ? [`LOW_MARGIN: ${Math.round(profitMargin)}% profit margin below ${profitMarginTarget}% target`] : []),
      ...(loanExceedsMax ? [`OVER_LEVERAGED: Requested $${requestedLoan.toLocaleString()} exceeds max $${Math.round(maxLoan).toLocaleString()}`] : []),
      ...(profitMargin < 0 ? ["NEGATIVE_PROFIT: Development cost exceeds completed value"] : []),
    ],
  };
}
