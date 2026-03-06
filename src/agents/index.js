/**
 * @fileoverview ZoneWise Lending Agent Swarm — Module Index
 * @module agents
 *
 * 10 specialized agents orchestrated by LangGraph-style pipeline.
 * Each agent maps to an Apers_ Boutique Prompt, improved for
 * ZoneWise's 4 borrower avatars with real Florida data integration.
 *
 * BUILD agents (7):
 *   1. Deal Screener (BOUT-SCR-01) — Pass/fail gate
 *   2. Value-Add Napkin (BOUT-SCR-03) — Quick feasibility check
 *   3. Break-Even Occupancy (BOUT-SCR-04) — Rental risk analysis
 *   4. Fix-and-Flip Pro Forma (BOUT-UW-06) — Core Hard Money model
 *   5. Debt Comparison (BOUT-RET-04) — Our terms vs alternatives
 *   6. Cash-Out Refi (BOUT-RET-05) — Exit strategy validation
 *   7. BRRRR Chain (BOUT-RET-08) — Portfolio velocity model
 *
 * ADAPT agents (3):
 *   8. Land Dev Feasibility (BOUT-SCR-05) — Zoning-validated construction
 *   9. DSCR Rental Pro Forma (BOUT-UW-01) — Simplified 1-10 unit
 *  10. STR Pro Forma (BOUT-UW-07) — With zoning check for STR eligibility
 *
 * Orchestrator: Routes by loan type, runs agents in parallel,
 *               synthesizes APPROVE/CONDITIONAL/REVIEW/DECLINE
 */

export { runDealScreener } from "./dealScreener.js";
export { runValueAddNapkin } from "./valueAddNapkin.js";
export { runBreakEvenOccupancy } from "./breakEvenOccupancy.js";
export { runFixAndFlipProForma } from "./fixAndFlipProForma.js";
export { runDebtComparison, runCashOutRefi } from "./returnsEngine.js";
export { runBRRRRModel } from "./brrrrChain.js";
export { runLandDevFeasibility } from "./landDevFeasibility.js";
export { runDSCRProForma, runSTRProForma } from "./rentalProForma.js";
export { runPipeline } from "./orchestrator.js";
export { default as underwrite } from "./orchestrator.js";
