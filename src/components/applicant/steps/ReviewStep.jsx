/**
 * @fileoverview Step 6: Review & Submit
 * @module components/applicant/steps/ReviewStep
 */
import { COLORS, INPUT_STYLE, LOAN_TYPES } from "../../../utils/constants.js";
import { uid } from "../../../utils/formatters.js";
import { supabase } from "../../../supabase.js";
import { Card, CardHead } from "../../shared/Card.jsx";
import { Btn } from "../../shared/Btn.jsx";
const B = COLORS;

/**
 * Application review and submit step
 * @param {Object} props
 * @param {Object} props.form - Form state
 * @param {Function} props.setStep - Step navigation
 * @param {Array} props.uploads - Uploaded files
 * @param {Array<boolean>} props.consentAll - Consent checkbox states
 * @param {Function} props.setConsentAll - Set consent state
 * @param {Function} props.setSubmitted - Set submitted state
 * @param {Object|null} props.user - Authenticated user
 * @returns {JSX.Element}
 */
export function ReviewStep({
  form, setStep, uploads, consentAll, setConsentAll, setSubmitted, user,
}) {
  const reviewBg = {
    hardmoney: B.slate50,
    construction: "rgba(245,158,11,0.08)",
    dscr: "rgba(16,185,129,0.06)",
    nodoc: "rgba(99,102,241,0.06)",
  }[form.loanType];

  const reviewBorder = {
    hardmoney: B.slate200,
    construction: B.orange + "40",
    dscr: "rgba(16,185,129,0.2)",
    nodoc: "rgba(99,102,241,0.2)",
  }[form.loanType];

  const headerLabel = {
    hardmoney: "🏠 Hard Money Loan Application",
    construction: "🏗️ Construction Loan Application",
    dscr: "📈 DSCR Rental Loan Application",
    nodoc: "📋 No-Doc Loan Application",
  }[form.loanType];

  const sections = [
    {
      icon: "👤", t: "Borrower",
      items: [
        ["Name", `${form.firstName} ${form.lastName}`],
        ["Email", form.email],
        ["Phone", form.phone],
        ["Entity", form.entityType === "individual"
          ? "Individual" : form.entityName],
      ],
    },
    {
      icon: "🏠", t: "Property",
      items: [
        ["Address", `${form.propAddr}, ${form.propCity}, ${form.propState} ${form.propZip}`],
        ["Type", form.propType.toUpperCase()],
        ["Condition", form.condition],
      ],
    },
    ...(form.loanType === "construction" ? [
      {
        icon: "🏗️", t: "Construction",
        items: [
          ["Type", {
            ground_up: "Ground-Up New Build",
            tear_down: "Tear-Down & Rebuild",
            major_reno: "Major Renovation",
          }[form.constructionType] || form.constructionType],
          ["Lot Value", form.lotValue ? `$${form.lotValue}` : "—"],
          ["Hard Costs", form.hardCosts ? `$${form.hardCosts}` : "—"],
          ["Soft Costs", form.softCosts ? `$${form.softCosts}` : "—"],
          ["Total Budget", form.totalConstructionBudget
            ? `$${form.totalConstructionBudget}` : "—"],
          ["Completed Value", form.completedValue
            ? `$${form.completedValue}` : "—"],
          ["Timeline", `${form.constructionTimeline} months`],
          ["Draws", form.numDraws],
        ],
      },
      {
        icon: "📋", t: "Readiness",
        items: [
          ["Permits", {
            approved: "Approved", submitted: "Submitted",
            not_applied: "Not Applied", not_required: "N/A",
          }[form.permitStatus] || form.permitStatus],
          ["Plans", {
            complete: "Complete & Stamped",
            in_progress: "In Progress",
            preliminary: "Preliminary",
            none: "None",
          }[form.plansStatus] || form.plansStatus],
          ["GC Contract", {
            signed: "Signed", bidding: "Bidding",
            self: "Owner-Builder", none: "None",
          }[form.gcContract] || form.gcContract],
        ],
      },
    ] : []),
    ...(form.loanType === "dscr" ? [{
      icon: "📈", t: "DSCR Analysis",
      items: [
        ["Monthly Rent", form.monthlyRent ? `$${form.monthlyRent}` : "—"],
        ["Rental Type", {
          longterm: "Long-Term",
          shortterm: "Short-Term",
          midterm: "Mid-Term",
        }[form.rentalType] || "—"],
        ["Annual Taxes", form.annualTaxes ? `$${form.annualTaxes}` : "—"],
        ["Annual Insurance", form.annualInsurance
          ? `$${form.annualInsurance}` : "—"],
        ["Monthly HOA", form.monthlyHOA ? `$${form.monthlyHOA}` : "$0"],
        ["Rate Type", {
          fixed30: "30yr Fixed", arm51: "5/1 ARM",
          arm71: "7/1 ARM", fixed40: "40yr Fixed",
        }[form.rateType] || "—"],
        ["Prepayment", form.prepayment],
        ["Verification", {
          lease: "Current Lease", market: "Market Analysis",
          both: "Lease + Comps",
        }[form.rentVerification] || "—"],
      ],
    }] : []),
    ...(form.loanType === "nodoc" ? [{
      icon: "📋", t: "No-Doc Program",
      items: [
        ["Program", {
          bankstatement: "Bank Statement",
          asset_depletion: "Asset Depletion",
          profit_loss: "P&L Only",
          stated_income: "Stated Income",
          nina: "NINA",
        }[form.noDocSubtype] || "—"],
        ["Employment", {
          self_employed: "Self-Employed",
          business_owner: "Business Owner",
          "1099": "1099 Contractor",
          retired: "Retired", w2: "W-2",
          none: "Not Employed",
        }[form.employmentStatus] || "—"],
        ...(form.noDocSubtype === "bankstatement" ? [
          ["Statement Period", `${form.statementPeriod} months`],
          ["Avg Deposits", form.avgMonthlyDeposits
            ? `$${form.avgMonthlyDeposits}/mo` : "—"],
          ["Account Type", form.accountType === "business"
            ? "Business" : "Personal"],
          ["CPA Letter", form.cpaLetter === "yes" ? "Yes" : "No"],
        ] : []),
        ...(form.noDocSubtype === "asset_depletion" ? [
          ["Liquid Assets", form.totalLiquidAssets
            ? `$${form.totalLiquidAssets}` : "—"],
          ["Investments", form.investAssets
            ? `$${form.investAssets}` : "—"],
          ["Retirement", form.retirementAssets
            ? `$${form.retirementAssets}` : "—"],
        ] : []),
        ...(form.businessName ? [["Business", form.businessName]] : []),
      ],
    }] : []),
    {
      icon: "💰", t: "Loan",
      items: [
        ...(form.loanType === "hardmoney"
          ? [["Purpose", form.purpose]] : []),
        ["Loan Amount", `$${form.loanAmt}`],
        ...(form.loanType === "hardmoney" ? [
          ["Price/Value", `$${form.purchasePrice}`],
          ["ARV", form.arv ? `$${form.arv}` : "—"],
        ] : []),
        ...(form.loanType === "dscr" || form.loanType === "nodoc" ? [
          ["Price/Value", `$${form.purchasePrice}`],
        ] : []),
        ["Term", form.loanType === "dscr" || form.loanType === "nodoc"
          ? ({
              fixed30: "30yr Fixed", arm51: "5/1 ARM",
              arm71: "7/1 ARM", fixed40: "40yr Fixed",
              "360": "30yr", "180": "15yr", arm: "ARM",
            }[form.rateType || form.loanTerm] || form.loanTerm)
          : `${form.loanTerm} mo`],
        ["Down Payment", form.downPmt ? `$${form.downPmt}` : "—"],
      ],
    },
    {
      icon: "📊", t: "Financials",
      items: [
        ["Experience", form.experience],
        ["Credit", form.creditScore],
        ["Liquid", `$${form.liquid}`],
        ["Uploads", `${uploads.length} files`],
      ],
    },
  ];

  return (
    <div>
      <Card>
        <CardHead title="Application Summary" sub="Verify before submitting" />
        <div style={{ padding: "8px 24px 24px" }}>
          <div style={{
            background: reviewBg, borderRadius: 10,
            padding: "10px 18px",
            border: `1px solid ${reviewBorder}`,
            marginBottom: 12, fontSize: 13,
            fontWeight: 600, color: B.navyDeep,
          }}>{headerLabel}</div>
          {sections.map((s) => (
            <div key={s.t} style={{
              background: B.slate50, borderRadius: 10,
              padding: 18,
              border: `1px solid ${B.slate200}`,
              marginBottom: 12,
            }}>
              <div style={{
                fontWeight: 700, color: B.navyDeep,
                marginBottom: 10, fontSize: 14,
              }}>{s.icon} {s.t}</div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 20px", fontSize: 13,
              }}>
                {s.items.map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: B.slate400 }}>{k}:</span>{" "}
                    <strong>{v || "—"}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ padding: "20px 24px" }}>
          {[
            "I authorize verification of information and credit reports.",
            "I acknowledge this does not guarantee approval.",
            "I certify all information is true and accurate.",
          ].map((t, i) => (
            <div key={i} style={{
              background: B.slate50,
              border: `1px solid ${B.slate200}`,
              borderRadius: 8, padding: "12px 14px",
              marginBottom: 10,
            }}>
              <label style={{
                display: "flex", gap: 10,
                cursor: "pointer", fontSize: 12,
                color: B.slate700,
              }}>
                <input
                  type="checkbox"
                  checked={consentAll[i]}
                  onChange={(e) => {
                    const c = [...consentAll];
                    c[i] = e.target.checked;
                    setConsentAll(c);
                  }}
                  style={{
                    accentColor: B.navy, width: 16,
                    height: 16, flexShrink: 0, marginTop: 1,
                  }}
                />{t}
              </label>
            </div>
          ))}
        </div>
      </Card>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 20,
      }}>
        <Btn variant="back" onClick={() => setStep(5)}>← Back</Btn>
        <Btn
          variant="orange"
          disabled={!consentAll.every(Boolean)}
          onClick={async () => {
            const refCode = "ZW-HM-" + uid();
            try {
              await supabase
                .from("loan_applications")
                .insert({
                  user_id: user?.id,
                  ref_code: refCode,
                  loan_type: form.loanType,
                  status: "pending",
                  form_data: form,
                  uploads_count: uploads.length,
                });
            } catch (e) {
              console.error("Save error:", e);
            }
            setSubmitted(true);
          }}
        >Submit Application & Documents</Btn>
      </div>
    </div>
  );
}
