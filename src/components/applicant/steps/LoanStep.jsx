/**
 * @fileoverview Step 3: Loan Details (varies by loan type)
 * @module components/applicant/steps/LoanStep
 */
import { COLORS, INPUT_STYLE, LOAN_TYPES } from "../../../utils/constants.js";
import { Card, CardHead } from "../../shared/Card.jsx";
import { Btn } from "../../shared/Btn.jsx";
import {
  Field, CurField, RadioGroup, CheckGroup, Sep, Grid,
} from "../../shared/Field.jsx";
const B = COLORS;
const is = INPUT_STYLE;


/**
 * Loan details form — renders different fields based on loan type
 * @param {Object} props
 * @param {Object} props.form - Form state
 * @param {Function} props.u - Update function (key, value)
 * @param {Function} props.setStep - Step navigation
 * @returns {JSX.Element}
 */
export function LoanStep({ form, u, setStep }) {
  return (
    <div>
      <Card>
        <CardHead
          title={LOAN_TYPES[form.loanType]?.stepLabel || "Loan Details"}
          sub={LOAN_TYPES[form.loanType]?.stepSub || ""}
        />
        <div style={{ padding: "8px 24px 24px" }}>
          {/* ═══ HARD MONEY ═══ */}
          {form.loanType === "hardmoney" && <>
            <Field label="Loan Purpose" required>
              <RadioGroup
                name="purpose" value={form.purpose}
                options={[
                  ["purchase", "Purchase"],
                  ["refinance", "Refinance"],
                  ["cashout", "Cash-Out"],
                  ["bridge", "Bridge"],
                ]}
                onChange={(v) => u("purpose", v)}
              />
            </Field>
            <Grid>
              <CurField
                label="Purchase Price / Value" required
                value={form.purchasePrice}
                onChange={(v) => u("purchasePrice", v)}
              />
              <CurField
                label="Loan Amount" required
                value={form.loanAmt}
                onChange={(v) => u("loanAmt", v)}
              />
            </Grid>
            <Grid>
              <CurField
                label="After Repair Value (ARV)"
                hint="Post-renovation value"
                value={form.arv}
                onChange={(v) => u("arv", v)}
              />
              <CurField
                label="Repair Budget"
                value={form.repairBudget}
                onChange={(v) => u("repairBudget", v)}
              />
            </Grid>
            <Grid>
              <Field label="Loan Term" required>
                <select
                  style={is} value={form.loanTerm}
                  onChange={(e) => u("loanTerm", e.target.value)}
                >
                  <option value="6">6 Mo</option>
                  <option value="9">9 Mo</option>
                  <option value="12">12 Mo</option>
                  <option value="18">18 Mo</option>
                  <option value="24">24 Mo</option>
                </select>
              </Field>
              <CurField
                label="Down Payment / Equity" required
                value={form.downPmt}
                onChange={(v) => u("downPmt", v)}
              />
            </Grid>
            <Field label="Exit Strategy">
              <CheckGroup
                values={form.exitStrategy}
                options={[
                  ["flip", "Fix & Flip"],
                  ["refi", "Refi to Perm"],
                  ["rental", "Hold Rental"],
                  ["other", "Other"],
                ]}
                onChange={(v) => u("exitStrategy", v)}
              />
            </Field>
            <Field label="Exit Notes">
              <textarea
                style={{ ...is, minHeight: 70, resize: "vertical" }}
                value={form.exitNotes}
                onChange={(e) => u("exitNotes", e.target.value)}
                placeholder="Timeline, comps, projections…"
              />
            </Field>
          </>}

          {/* ═══ DSCR ═══ */}
          {form.loanType === "dscr" && <>
            <Field label="Loan Purpose" required>
              <RadioGroup
                name="purpose" value={form.purpose}
                options={[
                  ["purchase", "Purchase"],
                  ["refinance", "Rate/Term Refi"],
                  ["cashout", "Cash-Out Refi"],
                ]}
                onChange={(v) => u("purpose", v)}
              />
            </Field>
            <Grid>
              <CurField
                label="Purchase Price / Appraised Value" required
                value={form.purchasePrice}
                onChange={(v) => u("purchasePrice", v)}
              />
              <CurField
                label="Loan Amount Requested" required
                value={form.loanAmt}
                onChange={(v) => u("loanAmt", v)}
              />
            </Grid>
            <Grid>
              <CurField
                label="Down Payment / Equity" required
                value={form.downPmt}
                onChange={(v) => u("downPmt", v)}
              />
              <Field label="Rate Type" required>
                <select
                  style={is} value={form.rateType}
                  onChange={(e) => u("rateType", e.target.value)}
                >
                  <option value="fixed30">30-Year Fixed</option>
                  <option value="arm51">5/1 ARM</option>
                  <option value="arm71">7/1 ARM</option>
                  <option value="fixed40">40-Year Fixed</option>
                </select>
              </Field>
            </Grid>
            <Sep />
            <Grid>
              <CurField
                label="Monthly Gross Rent" required
                hint="Actual rent or projected market rent"
                value={form.monthlyRent}
                onChange={(v) => u("monthlyRent", v)}
              />
              <Field label="Rental Type" required>
                <select
                  style={is} value={form.rentalType}
                  onChange={(e) => u("rentalType", e.target.value)}
                >
                  <option value="longterm">Long-Term (12+ mo lease)</option>
                  <option value="shortterm">Short-Term (Airbnb/VRBO)</option>
                  <option value="midterm">Mid-Term (1-11 months)</option>
                </select>
              </Field>
            </Grid>
            <Grid>
              <Field label="Rent Verification" required>
                <select
                  style={is} value={form.rentVerification}
                  onChange={(e) => u("rentVerification", e.target.value)}
                >
                  <option value="lease">Current Lease Agreement</option>
                  <option value="market">Market Rent Analysis</option>
                  <option value="both">Both — Lease + Comps</option>
                </select>
              </Field>
              <Field label="Vacancy Rate">
                <select
                  style={is} value={form.vacancyRate}
                  onChange={(e) => u("vacancyRate", e.target.value)}
                >
                  <option value="0">0% (Occupied)</option>
                  <option value="5">5% (Standard)</option>
                  <option value="10">10% (Conservative)</option>
                  <option value="15">15% (High Vacancy Area)</option>
                </select>
              </Field>
            </Grid>
            <Sep />
            <Grid>
              <CurField
                label="Annual Property Taxes" required
                value={form.annualTaxes}
                onChange={(v) => u("annualTaxes", v)}
              />
              <CurField
                label="Annual Insurance Premium" required
                value={form.annualInsurance}
                onChange={(v) => u("annualInsurance", v)}
              />
            </Grid>
            <Grid>
              <CurField
                label="Monthly HOA Fees"
                hint="Enter 0 if none"
                value={form.monthlyHOA}
                onChange={(v) => u("monthlyHOA", v)}
              />
              <Field label="Prepayment Preference">
                <select
                  style={is} value={form.prepayment}
                  onChange={(e) => u("prepayment", e.target.value)}
                >
                  <option value="none">No Prepayment Penalty</option>
                  <option value="3yr">3-Year Prepayment</option>
                  <option value="5yr">5-Year Prepayment</option>
                </select>
              </Field>
            </Grid>
          </>}

          {/* ═══ NO-DOC ═══ */}
          {form.loanType === "nodoc" && <>
            <Field label="No-Doc Program Type" required>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 10,
              }}>
                {[
                  ["bankstatement", "🏦", "Bank Statement"],
                  ["asset_depletion", "💎", "Asset Depletion"],
                  ["profit_loss", "📊", "P&L Only"],
                  ["nina", "🔒", "NINA"],
                ].map(([v, icon, label]) => (
                  <button
                    key={v}
                    onClick={() => u("noDocSubtype", v)}
                    style={{
                      padding: "14px 8px", borderRadius: 10,
                      border: `1.5px solid ${form.noDocSubtype === v ? "#6366f1" : B.slate200}`,
                      background: form.noDocSubtype === v
                        ? "rgba(99,102,241,0.06)" : "#fff",
                      cursor: "pointer", textAlign: "center",
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>
                      {icon}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      color: form.noDocSubtype === v
                        ? "#4338ca" : B.slate600,
                    }}>{label}</div>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Loan Purpose" required>
              <RadioGroup
                name="purpose" value={form.purpose}
                options={[
                  ["purchase", "Purchase"],
                  ["refinance", "Rate/Term Refi"],
                  ["cashout", "Cash-Out Refi"],
                ]}
                onChange={(v) => u("purpose", v)}
              />
            </Field>
            <Grid>
              <CurField
                label="Purchase Price / Value" required
                value={form.purchasePrice}
                onChange={(v) => u("purchasePrice", v)}
              />
              <CurField
                label="Loan Amount" required
                value={form.loanAmt}
                onChange={(v) => u("loanAmt", v)}
              />
            </Grid>
            <Grid>
              <CurField
                label="Down Payment / Equity" required
                value={form.downPmt}
                onChange={(v) => u("downPmt", v)}
              />
              <Field label="Loan Term">
                <select
                  style={is} value={form.loanTerm}
                  onChange={(e) => u("loanTerm", e.target.value)}
                >
                  <option value="360">30-Year Fixed</option>
                  <option value="180">15-Year Fixed</option>
                  <option value="arm">ARM</option>
                </select>
              </Field>
            </Grid>
            <Sep />
            <Grid>
              <Field label="Employment Status" required>
                <select
                  style={is} value={form.employmentStatus}
                  onChange={(e) => u("employmentStatus", e.target.value)}
                >
                  <option value="self_employed">Self-Employed</option>
                  <option value="1099">1099 Contractor</option>
                  <option value="business_owner">Business Owner</option>
                  <option value="retired">Retired</option>
                  <option value="w2">W-2 Employee</option>
                  <option value="none">Not Employed</option>
                </select>
              </Field>
              <Field label="Years in Business/Employment">
                <input
                  style={is} type="number"
                  value={form.yearsInBusiness}
                  onChange={(e) => u("yearsInBusiness", e.target.value)}
                  min="0" placeholder="Years"
                />
              </Field>
            </Grid>
            {["self_employed", "business_owner", "1099"].includes(
              form.employmentStatus
            ) && (
              <Grid>
                <Field label="Business Name">
                  <input
                    style={is} value={form.businessName}
                    onChange={(e) => u("businessName", e.target.value)}
                    placeholder="Company name"
                  />
                </Field>
                <Field label="Industry">
                  <input
                    style={is} value={form.industry}
                    onChange={(e) => u("industry", e.target.value)}
                    placeholder="e.g. Real Estate, Tech, Consulting"
                  />
                </Field>
              </Grid>
            )}
            <Sep />
            {/* Bank Statement subtype fields */}
            {form.noDocSubtype === "bankstatement" && <>
              <Grid>
                <Field label="Statement Period" required>
                  <select
                    style={is} value={form.statementPeriod}
                    onChange={(e) => u("statementPeriod", e.target.value)}
                  >
                    <option value="24">24 Months (Better Rates)</option>
                    <option value="12">12 Months</option>
                  </select>
                </Field>
                <Field label="Account Type" required>
                  <select
                    style={is} value={form.accountType}
                    onChange={(e) => u("accountType", e.target.value)}
                  >
                    <option value="business">Business Account</option>
                    <option value="personal">Personal Account</option>
                  </select>
                </Field>
              </Grid>
              <Grid>
                <CurField
                  label="Average Monthly Deposits" required
                  hint="Average across statement period"
                  value={form.avgMonthlyDeposits}
                  onChange={(v) => u("avgMonthlyDeposits", v)}
                />
                <Field label="CPA Letter Available?" required>
                  <select
                    style={is} value={form.cpaLetter}
                    onChange={(e) => u("cpaLetter", e.target.value)}
                  >
                    <option value="yes">Yes — CPA Letter Available</option>
                    <option value="no">No</option>
                  </select>
                </Field>
              </Grid>
            </>}
            {/* Asset Depletion subtype fields */}
            {form.noDocSubtype === "asset_depletion" && <>
              <Grid>
                <CurField
                  label="Total Liquid Assets" required
                  hint="Cash, savings, checking"
                  value={form.totalLiquidAssets}
                  onChange={(v) => u("totalLiquidAssets", v)}
                />
                <CurField
                  label="Investment / Brokerage"
                  hint="Stocks, bonds, mutual funds"
                  value={form.investAssets}
                  onChange={(v) => u("investAssets", v)}
                />
              </Grid>
              <Grid>
                <CurField
                  label="Retirement Accounts"
                  hint="IRA, 401k (60% counted)"
                  value={form.retirementAssets}
                  onChange={(v) => u("retirementAssets", v)}
                />
                <div></div>
              </Grid>
            </>}
            {/* P&L subtype fields */}
            {form.noDocSubtype === "profit_loss" && <>
              <Grid>
                <CurField
                  label="Average Monthly Revenue" required
                  value={form.avgMonthlyDeposits}
                  onChange={(v) => u("avgMonthlyDeposits", v)}
                />
                <Field label="CPA-Prepared P&L Available?" required>
                  <select
                    style={is} value={form.cpaLetter}
                    onChange={(e) => u("cpaLetter", e.target.value)}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No — Not Yet</option>
                  </select>
                </Field>
              </Grid>
            </>}
          </>}

          {/* ═══ CONSTRUCTION ═══ */}
          {form.loanType === "construction" && <>
            <Field label="Construction Type" required>
              <RadioGroup
                name="constType" value={form.constructionType}
                options={[
                  ["ground_up", "Ground-Up New Build"],
                  ["tear_down", "Tear-Down & Rebuild"],
                  ["major_reno", "Major Renovation"],
                ]}
                onChange={(v) => u("constructionType", v)}
              />
            </Field>
            <Grid>
              <CurField
                label="Land / Lot Value" required
                hint="Purchase price or appraised value of land"
                value={form.lotValue}
                onChange={(v) => u("lotValue", v)}
              />
              <CurField
                label="Total Loan Amount Requested" required
                value={form.loanAmt}
                onChange={(v) => u("loanAmt", v)}
              />
            </Grid>
            <Grid>
              <CurField
                label="Hard Costs" required
                hint="Materials, labor, subcontractors"
                value={form.hardCosts}
                onChange={(v) => u("hardCosts", v)}
              />
              <CurField
                label="Soft Costs" required
                hint="Permits, architecture, engineering, inspections"
                value={form.softCosts}
                onChange={(v) => u("softCosts", v)}
              />
            </Grid>
            <Grid>
              <CurField
                label="Total Construction Budget" required
                hint="Hard + soft costs combined"
                value={form.totalConstructionBudget}
                onChange={(v) => u("totalConstructionBudget", v)}
              />
              <CurField
                label="Completed / As-Built Value" required
                hint="Expected value upon completion"
                value={form.completedValue}
                onChange={(v) => u("completedValue", v)}
              />
            </Grid>
            <Grid>
              <CurField
                label="Interest Reserve"
                hint="Pre-funded interest during construction"
                value={form.interestReserve}
                onChange={(v) => u("interestReserve", v)}
              />
              <CurField
                label="Down Payment / Equity" required
                value={form.downPmt}
                onChange={(v) => u("downPmt", v)}
              />
            </Grid>
            <Sep />
            <Grid>
              <Field label="Construction Timeline" required>
                <select
                  style={is} value={form.constructionTimeline}
                  onChange={(e) => u("constructionTimeline", e.target.value)}
                >
                  <option value="6">6 Months</option>
                  <option value="9">9 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                </select>
              </Field>
              <Field label="Expected Draw Requests" required hint="Number of construction draws">
                <select
                  style={is} value={form.numDraws}
                  onChange={(e) => u("numDraws", e.target.value)}
                >
                  <option value="3">3 Draws</option>
                  <option value="4">4 Draws</option>
                  <option value="5">5 Draws</option>
                  <option value="6">6 Draws</option>
                  <option value="8">8 Draws</option>
                  <option value="10">10+ Draws</option>
                </select>
              </Field>
            </Grid>
            <Sep />
            <Grid>
              <Field label="Permit Status" required>
                <select
                  style={is} value={form.permitStatus}
                  onChange={(e) => u("permitStatus", e.target.value)}
                >
                  <option value="approved">Approved / In-Hand</option>
                  <option value="submitted">Submitted — Pending</option>
                  <option value="not_applied">Not Yet Applied</option>
                  <option value="not_required">Not Required</option>
                </select>
              </Field>
              <Field label="Architectural Plans" required>
                <select
                  style={is} value={form.plansStatus}
                  onChange={(e) => u("plansStatus", e.target.value)}
                >
                  <option value="complete">Complete & Stamped</option>
                  <option value="in_progress">In Progress</option>
                  <option value="preliminary">Preliminary / Conceptual</option>
                  <option value="none">None Yet</option>
                </select>
              </Field>
            </Grid>
            <Grid>
              <Field label="GC Contract Status" required>
                <select
                  style={is} value={form.gcContract}
                  onChange={(e) => u("gcContract", e.target.value)}
                >
                  <option value="signed">Signed Contract</option>
                  <option value="bidding">Bidding / Negotiating</option>
                  <option value="self">Self (Owner-Builder)</option>
                  <option value="none">No GC Yet</option>
                </select>
              </Field>
              <Field label="Loan Term" required>
                <select
                  style={is} value={form.loanTerm}
                  onChange={(e) => u("loanTerm", e.target.value)}
                >
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                </select>
              </Field>
            </Grid>
            <Sep />
            <Field label="Exit Strategy">
              <CheckGroup
                values={form.exitStrategy}
                options={[
                  ["sell", "Sell Upon Completion"],
                  ["refi", "Refi to Permanent Mortgage"],
                  ["rental", "Hold as Rental"],
                  ["other", "Other"],
                ]}
                onChange={(v) => u("exitStrategy", v)}
              />
            </Field>
            <Field label="Exit Strategy Details">
              <textarea
                style={{ ...is, minHeight: 70, resize: "vertical" }}
                value={form.exitNotes}
                onChange={(e) => u("exitNotes", e.target.value)}
                placeholder="Anticipated sale price, refinance plan, rental pro forma, comparable new builds…"
              />
            </Field>
          </>}
        </div>
      </Card>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 20,
      }}>
        <Btn variant="back" onClick={() => setStep(2)}>← Back</Btn>
        <Btn onClick={() => setStep(4)}>Continue → Plans & Documents</Btn>
      </div>
    </div>
  );
}
