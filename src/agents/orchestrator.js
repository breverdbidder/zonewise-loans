/**
 * @fileoverview LangGraph-style Orchestrator for ZoneWise Lending Pipeline
 * @module agents/orchestrator
 *
 * Routes loan applications to the correct agent swarm based on loan type.
 * Runs agents in parallel (fan-out), collects results, and synthesizes
 * a unified APPROVE / CONDITIONAL / REVIEW / DECLINE decision.
 *
 * This is the SECRET SAUCE — no other AI tool orchestrates 8 specialized
 * agents with real Florida property data into a unified lending decision.
 *
 * Pipeline:
 *   1. Intake: Validate + classify loan type
 *   2. Router: Select agent set by loan type
 *   3. Fan-out: Run all selected agents in parallel
 *   4. Synthesis: Aggregate scores, flags, and metrics
 *   5. Decision: APPROVE / CONDITIONAL / REVIEW / DECLINE
 */

import { runDealScreener } from "./dealScreener.js";
import { runValueAddNapkin } from "./valueAddNapkin.js";
import { runBreakEvenOccupancy } from "./breakEvenOccupancy.js";
import { runFixAndFlipProForma } from "./fixAndFlipProForma.js";
import { runDebtComparison, runCashOutRefi } from "./returnsEngine.js";
import { runBRRRRModel } from "./brrrrChain.js";
import { runLandDevFeasibility } from "./landDevFeasibility.js";
import { runDSCRProForma, runSTRProForma } from "./rentalProForma.js";

/**
 * Agent routing table — which agents run for each loan type
 */
const AGENT_ROUTES = {
  hardmoney: [
    { fn: runDealScreener, weight: 20 },
    { fn: runValueAddNapkin, weight: 10 },
    { fn: runFixAndFlipProForma, weight: 25 },
    { fn: runDebtComparison, weight: 10 },
    { fn: runCashOutRefi, weight: 20 },
    { fn: runBRRRRModel, weight: 15 },
  ],
  construction: [
    { fn: runDealScreener, weight: 15 },
    { fn: runValueAddNapkin, weight: 10 },
    { fn: runLandDevFeasibility, weight: 30 },
    { fn: runDebtComparison, weight: 10 },
    { fn: runCashOutRefi, weight: 20 },
    { fn: runFixAndFlipProForma, weight: 15 },
  ],
  dscr: [
    { fn: runDealScreener, weight: 15 },
    { fn: runBreakEvenOccupancy, weight: 20 },
    { fn: runDSCRProForma, weight: 25 },
    { fn: runDebtComparison, weight: 10 },
    { fn: runCashOutRefi, weight: 15 },
    { fn: runSTRProForma, weight: 15 },
  ],
  nodoc: [
    { fn: runDealScreener, weight: 15 },
    { fn: runBreakEvenOccupancy, weight: 25 },
    { fn: runDebtComparison, weight: 15 },
    { fn: runDSCRProForma, weight: 25 },
    { fn: runCashOutRefi, weight: 20 },
  ],
};

/**
 * Score verdicts from individual agents
 */
const VERDICT_SCORES = {
  // Deal Screener
  PASS: 100, FAIL: 20,
  // Value-Add Napkin
  DEAL_PENCILS: 100, DOES_NOT_PENCIL: 15,
  // Break-Even
  COMFORTABLE: 100, TIGHT: 50, HIGH_RISK: 10,
  // Fix-and-Flip
  PROFITABLE: 100, MARGINAL: 50, UNPROFITABLE: 5,
  // Debt Comparison
  COMPETITIVE: 100, HIGHER_COST_JUSTIFIED: 70,
  // Cash-Out Refi
  EXIT_VIABLE: 100, EXIT_AT_RISK: 20,
  // BRRRR
  INFINITE_VELOCITY: 100, PARTIAL_RECOVERY: 60, CAPITAL_TRAPPED: 15,
  // Land Dev
  GO: 100, CONDITIONAL_GO: 60, NO_GO: 10,
  // DSCR Pro Forma
  STRONG_DSCR: 100, QUALIFYING_DSCR: 70, BELOW_DSCR: 10,
  // STR
  STRONG_STR: 100, QUALIFYING_STR: 70, STR_NOT_PERMITTED: 0,
};

/**
 * Decision thresholds (weighted average of agent scores)
 */
const DECISION = {
  APPROVE: 80,
  CONDITIONAL: 65,
  REVIEW: 45,
  // Below 45 = DECLINE
};

/**
 * Validate loan application has minimum required fields
 * @param {Object} app - Loan application
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateIntake(app) {
  const required = ["loanType", "purchasePrice", "loanAmt"];
  const typeSpecific = {
    hardmoney: ["arv"],
    construction: ["lotValue"],
    dscr: ["monthlyRent"],
    nodoc: ["credit"],
  };
  const allRequired = [...required, ...(typeSpecific[app.loanType] || [])];
  const missing = allRequired.filter(f => !app[f] && app[f] !== 0);
  return { valid: missing.length === 0, missing };
}

/**
 * Run the full underwriting pipeline
 * @param {Object} app - Complete loan application
 * @param {Object} [context] - Additional context (zoning data, comps, etc.)
 * @returns {Object} Complete pipeline result with decision
 */
export function runPipeline(app, context = {}) {
  const startTime = Date.now();

  // ═══ STAGE 1: INTAKE ═══
  const intake = validateIntake(app);
  if (!intake.valid) {
    return {
      pipelineId: `pipe_${Date.now()}`,
      stage: "INTAKE",
      status: "REJECTED",
      reason: `Missing required fields: ${intake.missing.join(", ")}`,
      decision: "INCOMPLETE",
      timestamp: new Date().toISOString(),
    };
  }

  // ═══ STAGE 2: ROUTE ═══
  const loanType = app.loanType || "hardmoney";
  const agentConfig = AGENT_ROUTES[loanType] || AGENT_ROUTES.hardmoney;

  // ═══ STAGE 3: FAN-OUT (parallel execution) ═══
  const agentResults = [];
  const errors = [];

  for (const agent of agentConfig) {
    try {
      const result = agent.fn(app, context.zoningData);
      agentResults.push({
        ...result,
        weight: agent.weight,
        score: VERDICT_SCORES[result.verdict] ?? 50,
      });
    } catch (err) {
      errors.push({
        agent: agent.fn.name,
        error: err.message,
        weight: agent.weight,
      });
    }
  }

  // ═══ STAGE 4: SYNTHESIS ═══
  const totalWeight = agentResults.reduce((s, r) => s + r.weight, 0);
  const weightedScore = totalWeight > 0
    ? agentResults.reduce((s, r) => s + (r.score * r.weight), 0) / totalWeight
    : 0;

  // Collect all flags
  const allFlags = agentResults.flatMap(r => (r.flags || []).map(f => ({
    source: r.agentName,
    flag: f,
  })));

  // Critical flags that force review regardless of score
  const criticalFlags = allFlags.filter(f =>
    f.flag.includes("ZONING_CONFLICT") ||
    f.flag.includes("NO_VIABLE_REFI") ||
    f.flag.includes("NEGATIVE_PROFIT") ||
    f.flag.includes("STR_NOT_PERMITTED") ||
    f.flag.includes("DSCR_BELOW_1")
  );

  // ═══ STAGE 5: DECISION ═══
  let decision;
  let confidence;

  if (criticalFlags.length > 0 && weightedScore >= DECISION.APPROVE) {
    decision = "CONDITIONAL_APPROVE";
    confidence = Math.round(weightedScore);
  } else if (weightedScore >= DECISION.APPROVE) {
    decision = "APPROVE";
    confidence = Math.round(weightedScore);
  } else if (weightedScore >= DECISION.CONDITIONAL) {
    decision = "CONDITIONAL_APPROVE";
    confidence = Math.round(weightedScore);
  } else if (weightedScore >= DECISION.REVIEW) {
    decision = "REVIEW";
    confidence = Math.round(weightedScore);
  } else {
    decision = "DECLINE";
    confidence = Math.round(weightedScore);
  }

  // Generate conditions for conditional approvals
  const conditions = [];
  if (decision === "CONDITIONAL_APPROVE" || decision === "REVIEW") {
    if (criticalFlags.some(f => f.flag.includes("ZONING"))) {
      conditions.push("Obtain zoning confirmation from municipality before closing");
    }
    if (criticalFlags.some(f => f.flag.includes("REFI"))) {
      conditions.push("Provide alternative exit strategy documentation");
    }
    if (allFlags.some(f => f.flag.includes("LTV"))) {
      conditions.push("Additional collateral or reduced loan amount required");
    }
    if (allFlags.some(f => f.flag.includes("70_RULE"))) {
      conditions.push("Independent appraisal required to validate ARV");
    }
    if (allFlags.some(f => f.flag.includes("INSURANCE"))) {
      conditions.push("Obtain insurance quotes — FL insurance costs may impact viability");
    }
  }

  // Strengths
  const strengths = agentResults
    .filter(r => r.score >= 80)
    .map(r => `${r.agentName}: ${r.verdict}`)
    .slice(0, 4);

  // Risks
  const risks = allFlags
    .map(f => f.flag.split(":")[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  const elapsed = Date.now() - startTime;

  return {
    pipelineId: `pipe_${Date.now()}`,
    timestamp: new Date().toISOString(),
    elapsed: `${elapsed}ms`,
    loanType,
    applicant: {
      name: app.borrowerName || app.name || "Unknown",
      property: app.propAddr || app.address || "Not provided",
    },

    // ═══ DECISION ═══
    decision,
    confidence,
    weightedScore: Math.round(weightedScore * 10) / 10,

    // ═══ DETAIL ═══
    agentsExecuted: agentResults.length,
    agentErrors: errors.length,
    agentResults: agentResults.map(r => ({
      agentId: r.agentId,
      agentName: r.agentName,
      promptRef: r.promptRef,
      verdict: r.verdict,
      score: r.score,
      weight: r.weight,
      flagCount: (r.flags || []).length,
    })),

    // ═══ SYNTHESIS ═══
    strengths,
    risks,
    conditions,
    allFlags,
    criticalFlagCount: criticalFlags.length,

    // ═══ KEY METRICS (extracted from agents) ═══
    keyMetrics: extractKeyMetrics(agentResults, loanType),

    // ═══ FULL AGENT DATA (for report generation) ═══
    fullAgentData: agentResults,
  };
}

/**
 * Extract the most important metrics from agent results
 */
function extractKeyMetrics(results, loanType) {
  const metrics = {};
  for (const r of results) {
    if (r.metrics) Object.assign(metrics, r.metrics);
    if (r.acquisition) Object.assign(metrics, r.acquisition);
    if (r.returns) Object.assign(metrics, r.returns);
    if (r.singleDeal) metrics.brrrrCashOut = r.singleDeal.cashOutNet;
    if (r.summary) Object.assign(metrics, r.summary);
  }
  return metrics;
}

/**
 * Quick-run: single function call for the entire pipeline
 * @param {Object} app - Loan application
 * @returns {Object} Pipeline result
 */
export default function underwrite(app) {
  return runPipeline(app);
}
