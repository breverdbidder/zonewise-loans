/**
 * @fileoverview Agent Swarm Tests — all 10 agents + orchestrator
 * @module __tests__/agents.test
 */
import { describe, test, expect } from "@jest/globals";
import { runDealScreener } from "../agents/dealScreener.js";
import { runValueAddNapkin } from "../agents/valueAddNapkin.js";
import { runBreakEvenOccupancy } from "../agents/breakEvenOccupancy.js";
import { runFixAndFlipProForma } from "../agents/fixAndFlipProForma.js";
import { runDebtComparison, runCashOutRefi } from "../agents/returnsEngine.js";
import { runBRRRRModel } from "../agents/brrrrChain.js";
import { runLandDevFeasibility } from "../agents/landDevFeasibility.js";
import { runDSCRProForma, runSTRProForma } from "../agents/rentalProForma.js";
import { runPipeline } from "../agents/orchestrator.js";

// ═══ SAMPLE APPLICATIONS ═══
const HARD_MONEY_APP = {
  loanType: "hardmoney",
  purchasePrice: 200000,
  loanAmt: 150000,
  arv: 310000,
  repairBudget: 45000,
  credit: "720+",
  experience: "4-10",
  liquid: 80000,
  uploads: 5,
  monthlyRent: 2200,
  rehabTimeline: 4,
  interestRate: 0.095,
  propAddr: "123 Main St, Melbourne, FL 32901",
  borrowerName: "Test Borrower",
};

const DSCR_APP = {
  loanType: "dscr",
  purchasePrice: 350000,
  loanAmt: 262500,
  monthlyRent: 2800,
  credit: "700-719",
  experience: "4-10",
  liquid: 120000,
  uploads: 4,
  units: 1,
  interestRate: 0.078,
  propAddr: "456 Oak Ave, Satellite Beach, FL 32937",
  borrowerName: "DSCR Borrower",
};

const CONSTRUCTION_APP = {
  loanType: "construction",
  purchasePrice: 150000,
  lotValue: 150000,
  loanAmt: 400000,
  completedValue: 650000,
  arv: 650000,
  totalBudget: 350000,
  hardCosts: 300000,
  softCosts: 50000,
  credit: "720+",
  experience: "11-25",
  liquid: 200000,
  uploads: 7,
  lotSize: 10000,
  totalBuildableSF: 3500,
  interestRate: 0.10,
  constructionTimeline: 10,
  propAddr: "789 Beach Rd, Indialantic, FL 32903",
  borrowerName: "Builder Test",
};

const NODOC_APP = {
  loanType: "nodoc",
  purchasePrice: 280000,
  loanAmt: 196000,
  credit: "720+",
  liquid: 150000,
  uploads: 3,
  monthlyRent: 2400,
  noDocSubtype: "bankstatement",
  statementPeriod: "24",
  occupancy: "investment",
  propType: "sfr",
  interestRate: 0.085,
  propAddr: "321 Palm Dr, Palm Bay, FL 32905",
  borrowerName: "No-Doc Borrower",
};

// ═══ AGENT TESTS ═══

describe("Agent 1: Deal Screener", () => {
  test("screens hard money deal with pass", () => {
    const result = runDealScreener(HARD_MONEY_APP);
    expect(result.agentId).toBe("deal-screener");
    expect(result.metrics.ltv).toBeLessThanOrEqual(80);
    expect(result.overallPass).toBe(true);
    expect(result.verdict).toBe("PASS");
  });

  test("fails deal with excessive LTV", () => {
    const badApp = { ...HARD_MONEY_APP, loanAmt: 190000 };
    const result = runDealScreener(badApp);
    expect(result.metrics.ltv).toBeGreaterThan(90);
    expect(result.flags.length).toBeGreaterThan(0);
  });

  test("screens DSCR deal", () => {
    const result = runDealScreener(DSCR_APP);
    expect(result.agentId).toBe("deal-screener");
    expect(result.metrics.yearOneNOI).toBeGreaterThan(0);
  });
});

describe("Agent 2a: Value-Add Napkin", () => {
  test("value-add pencils for good deal", () => {
    const result = runValueAddNapkin(HARD_MONEY_APP);
    expect(result.agentId).toBe("value-add-napkin");
    expect(result.metrics.grossProfit).toBeGreaterThan(0);
    expect(result.pencils).toBe(true);
    expect(result.verdict).toBe("DEAL_PENCILS");
  });

  test("does not pencil when ARV too low", () => {
    const badApp = { ...HARD_MONEY_APP, arv: 220000 };
    const result = runValueAddNapkin(badApp);
    expect(result.metrics.grossProfit).toBeLessThan(50000);
  });
});

describe("Agent 5: Break-Even Occupancy", () => {
  test("calculates three break-even levels", () => {
    const result = runBreakEvenOccupancy(DSCR_APP);
    expect(result.agentId).toBe("break-even-occupancy");
    expect(result.metrics.breakEvenOpex).toBeGreaterThan(0);
    expect(result.metrics.breakEvenDebt).toBeGreaterThan(result.metrics.breakEvenOpex);
    expect(result.metrics.breakEvenTarget).toBeGreaterThan(result.metrics.breakEvenDebt);
  });

  test("flags high FL insurance", () => {
    const result = runBreakEvenOccupancy(DSCR_APP);
    expect(result.metrics.insuranceCost).toBeGreaterThan(0);
    expect(result.expenseBreakdown.insurance).toBeGreaterThan(0);
  });
});

describe("Agent 2b: Fix-and-Flip Pro Forma", () => {
  test("generates full flip P&L", () => {
    const result = runFixAndFlipProForma(HARD_MONEY_APP);
    expect(result.agentId).toBe("fix-and-flip");
    expect(result.returns.netProfit).toBeGreaterThan(0);
    expect(result.returns.roi).toBeGreaterThan(0);
    expect(result.sensitivity.length).toBe(4); // 4 rehab scenarios
    expect(result.sensitivity[0].scenarios.length).toBe(4); // 4 ARV scenarios
  });

  test("checks 70% rule", () => {
    const result = runFixAndFlipProForma(HARD_MONEY_APP);
    expect(typeof result.returns.passes70Rule).toBe("boolean");
    expect(result.returns.maxOffer70Rule).toBeGreaterThan(0);
  });

  test("calculates holding costs with FL insurance", () => {
    const result = runFixAndFlipProForma(HARD_MONEY_APP);
    expect(result.holdingCosts.monthlyInsurance).toBeGreaterThan(0);
    expect(result.holdingCosts.totalHoldingCosts).toBeGreaterThan(0);
  });
});

describe("Agent 3: Returns Engine", () => {
  test("compares 4 debt options", () => {
    const result = runDebtComparison(HARD_MONEY_APP);
    expect(result.agentId).toBe("debt-comparison");
    expect(result.scenarios.length).toBe(4);
    expect(result.ranking.length).toBe(4);
    expect(result.ourRank).toBeGreaterThanOrEqual(1);
  });

  test("models cash-out refi exit", () => {
    const result = runCashOutRefi(HARD_MONEY_APP);
    expect(result.agentId).toBe("cash-out-refi");
    expect(result.refiScenarios.length).toBe(4);
    expect(typeof result.exitViable).toBe("boolean");
  });

  test("refi viable for good deal", () => {
    const result = runCashOutRefi(HARD_MONEY_APP);
    expect(result.exitViable).toBe(true);
    expect(result.bestScenario).not.toBeNull();
  });
});

describe("Agent 6: BRRRR Chain", () => {
  test("models single deal + chain", () => {
    const result = runBRRRRModel(HARD_MONEY_APP);
    expect(result.agentId).toBe("brrrr-chain");
    expect(result.singleDeal.totalCashInvested).toBeGreaterThan(0);
    expect(result.chain.length).toBeGreaterThanOrEqual(1);
    expect(result.chainCapacity).toBeGreaterThanOrEqual(1);
  });

  test("calculates lender CLV", () => {
    const result = runBRRRRModel(HARD_MONEY_APP);
    expect(result.lenderView.estimatedDeals).toBeGreaterThanOrEqual(1);
    expect(result.lenderView.estimatedRevenue).toBeGreaterThan(0);
  });
});

describe("Agent 7: Land Dev Feasibility", () => {
  test("validates against zoning", () => {
    const result = runLandDevFeasibility(CONSTRUCTION_APP);
    expect(result.agentId).toBe("land-dev-feasibility");
    expect(result.zoningCheck.maxBuildableSF).toBeGreaterThan(0);
    expect(typeof result.zoningCheck.sfOverstated).toBe("boolean");
    expect(typeof result.goNoGo).toBe("boolean");
  });

  test("flags overstated buildable SF", () => {
    const overApp = { ...CONSTRUCTION_APP, totalBuildableSF: 50000 };
    const result = runLandDevFeasibility(overApp);
    expect(result.zoningCheck.sfOverstated).toBe(true);
    expect(result.flags.some(f => f.includes("ZONING_CONFLICT"))).toBe(true);
  });
});

describe("Agent 2c: DSCR Rental Pro Forma", () => {
  test("generates 5-year projection", () => {
    const result = runDSCRProForma(DSCR_APP);
    expect(result.agentId).toBe("dscr-pro-forma");
    expect(result.projection.length).toBe(5);
    expect(result.projection[0].dscr).toBeGreaterThan(0);
    expect(result.summary.y1DSCR).toBeGreaterThan(0);
  });

  test("includes FL-adjusted expenses", () => {
    const result = runDSCRProForma(DSCR_APP);
    expect(result.expenseBreakdown.insurance).toBeGreaterThan(0);
    expect(result.expenseBreakdown.taxes).toBeGreaterThan(0);
  });
});

describe("Agent 2d: STR Pro Forma", () => {
  test("blocks STR when zoning prohibits", () => {
    const result = runSTRProForma(DSCR_APP, { strPermitted: false });
    expect(result.zoningBlock).toBe(true);
    expect(result.verdict).toBe("STR_NOT_PERMITTED");
  });

  test("blocks STR with 30+ day minimum", () => {
    const result = runSTRProForma(DSCR_APP, { minStayDays: 30 });
    expect(result.zoningBlock).toBe(true);
  });

  test("models seasonal revenue when STR permitted", () => {
    const result = runSTRProForma(DSCR_APP, { strPermitted: true, minStayDays: 1 });
    expect(result.zoningBlock).toBe(false);
    expect(result.seasonalRevenue.length).toBe(4);
    expect(result.metrics.annualGross).toBeGreaterThan(0);
    expect(result.ltrComparison.ltrAnnualRent).toBeGreaterThan(0);
  });
});

// ═══ ORCHESTRATOR TESTS ═══

describe("Orchestrator Pipeline", () => {
  test("rejects incomplete application", () => {
    const result = runPipeline({ loanType: "hardmoney" });
    expect(result.status).toBe("REJECTED");
    expect(result.decision).toBe("INCOMPLETE");
  });

  test("runs full Hard Money pipeline", () => {
    const result = runPipeline(HARD_MONEY_APP);
    expect(result.decision).toBeDefined();
    expect(["APPROVE", "CONDITIONAL_APPROVE", "REVIEW", "DECLINE"]).toContain(result.decision);
    expect(result.agentsExecuted).toBe(6); // 6 agents for hard money
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.weightedScore).toBeGreaterThan(0);
  });

  test("runs full DSCR pipeline", () => {
    const result = runPipeline(DSCR_APP);
    expect(result.decision).toBeDefined();
    expect(result.agentsExecuted).toBe(6);
    expect(result.loanType).toBe("dscr");
  });

  test("runs full Construction pipeline", () => {
    const result = runPipeline(CONSTRUCTION_APP);
    expect(result.decision).toBeDefined();
    expect(result.agentsExecuted).toBe(6);
    expect(result.loanType).toBe("construction");
  });

  test("runs full No-Doc pipeline", () => {
    const result = runPipeline(NODOC_APP);
    expect(result.decision).toBeDefined();
    expect(result.agentsExecuted).toBe(5); // 5 agents for nodoc
    expect(result.loanType).toBe("nodoc");
  });

  test("approves strong hard money deal", () => {
    const strongApp = {
      ...HARD_MONEY_APP,
      arv: 400000,
      repairBudget: 30000,
      loanAmt: 120000,
      liquid: 150000,
      experience: "25+",
    };
    const result = runPipeline(strongApp);
    expect(["APPROVE", "CONDITIONAL_APPROVE"]).toContain(result.decision);
    expect(result.confidence).toBeGreaterThanOrEqual(65);
  });

  test("declines terrible deal", () => {
    const badApp = {
      ...HARD_MONEY_APP,
      arv: 180000,
      repairBudget: 100000,
      loanAmt: 195000,
      liquid: 5000,
      credit: "below600",
      experience: "first",
    };
    const result = runPipeline(badApp);
    expect(["DECLINE", "REVIEW"]).toContain(result.decision);
    expect(result.allFlags.length).toBeGreaterThan(3);
  });

  test("produces key metrics", () => {
    const result = runPipeline(HARD_MONEY_APP);
    expect(result.keyMetrics).toBeDefined();
    expect(Object.keys(result.keyMetrics).length).toBeGreaterThan(3);
  });

  test("generates strengths and risks", () => {
    const result = runPipeline(HARD_MONEY_APP);
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(Array.isArray(result.risks)).toBe(true);
  });
});
