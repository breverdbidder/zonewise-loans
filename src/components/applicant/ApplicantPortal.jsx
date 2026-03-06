/**
 * @fileoverview Applicant loan application portal with 6-step form wizard
 * @module components/applicant/ApplicantPortal
 */
import { useState, useRef } from "react";
import { useAuth } from "../../Auth.jsx";
import { supabase } from "../../supabase.js";
import { COLORS, INPUT_STYLE, LOAN_TYPES } from "../../utils/constants.js";
import { uid } from "../../utils/formatters.js";
import { Logo } from "../shared/Logo.jsx";
import { Badge } from "../shared/Badge.jsx";
import { Card } from "../shared/Card.jsx";
import { Btn } from "../shared/Btn.jsx";
import { BorrowerStep } from "./steps/BorrowerStep.jsx";
import { PropertyStep } from "./steps/PropertyStep.jsx";
import { LoanStep } from "./steps/LoanStep.jsx";
import { DocsStep } from "./steps/DocsStep.jsx";
import { ExperienceStep } from "./steps/ExperienceStep.jsx";
import { ReviewStep } from "./steps/ReviewStep.jsx";
import { SubmittedScreen } from "./SubmittedScreen.jsx";
const B = COLORS;

/**
 * Applicant portal with multi-step form wizard
 * @param {Object} props
 * @param {Function|null} props.onSwitch - Callback to switch to admin portal
 * @returns {JSX.Element}
 */
export function ApplicantPortal({ onSwitch }) {
  const { user, signOut } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    loanType: "hardmoney",
    firstName: "", lastName: "", email: "", phone: "",
    entityType: "llc", entityName: "", entityState: "FL",
    mailAddr: "", mailCity: "", mailState: "FL", mailZip: "",
    citizenship: "us",
    propAddr: "", propCity: "", propState: "FL", propZip: "",
    propType: "sfr", occupancy: "investment",
    beds: "", baths: "", sqft: "", yearBuilt: "",
    condition: "fair",
    purpose: "purchase", purchasePrice: "", loanAmt: "",
    arv: "", repairBudget: "",
    loanTerm: "12", downPmt: "",
    exitStrategy: [], exitNotes: "", projectDesc: "",
    experience: "4-10", propsOwned: "",
    creditScore: "720+", liquid: "",
    bkHist: "none", liens: "none", gc: "self", addNotes: "",
    // Construction
    constructionType: "ground_up", lotValue: "",
    hardCosts: "", softCosts: "", totalConstructionBudget: "",
    numDraws: "5", permitStatus: "not_applied",
    plansStatus: "in_progress", gcContract: "signed",
    constructionTimeline: "12", interestReserve: "",
    completedValue: "",
    // DSCR
    monthlyRent: "", vacancyRate: "5",
    annualTaxes: "", annualInsurance: "",
    monthlyHOA: "", rateType: "fixed30",
    prepayment: "3yr", rentalType: "longterm",
    rentVerification: "lease",
    // No-Doc
    noDocSubtype: "bankstatement",
    employmentStatus: "self_employed",
    businessName: "", industry: "", yearsInBusiness: "",
    statementPeriod: "24", accountType: "business",
    avgMonthlyDeposits: "", cpaLetter: "no",
    totalLiquidAssets: "", retirementAssets: "",
    investAssets: "",
  });
  const [uploads, setUploads] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [consentAll, setConsentAll] = useState([false, false, false]);
  const fileRef = useRef();

  /** @param {string} k - Form field key @param {*} v - New value */
  const u = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /**
   * Handles file selection, previews locally, and uploads to Supabase Storage.
   * Skips files exceeding 10 MB.
   * @param {Event} e - File input change event
   * @returns {Promise<void>}
   */
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) continue;
      const fileId = uid();
      const filePath = `${user?.id || "anon"}/${fileId}-${f.name}`;

      // Show local preview immediately
      const localUrl = URL.createObjectURL(f);
      setUploads((p) => [
        ...p,
        { id: fileId, name: f.name, type: f.type, url: localUrl, uploading: true },
      ]);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("loan-documents")
        .upload(filePath, f, { upsert: false });

      if (!error && data?.path) {
        const { data: pub } = supabase.storage
          .from("loan-documents")
          .getPublicUrl(data.path);
        setUploads((p) =>
          p.map((u) =>
            u.id === fileId
              ? { ...u, url: pub?.publicUrl || localUrl, uploading: false, storagePath: data.path }
              : u
          )
        );
      } else {
        // Keep local preview on upload failure
        setUploads((p) =>
          p.map((u) =>
            u.id === fileId ? { ...u, uploading: false } : u
          )
        );
      }
    }
  };

  if (submitted) return <SubmittedScreen />;

  const labels = [
    "Borrower", "Property",
    LOAN_TYPES[form.loanType]?.stepLabel || "Loan Details",
    "Plans & Docs", "Experience", "Review",
  ];

  return (
    <div style={{ minHeight: "100vh", background: B.slate50 }}>
      {/* Header */}
      <header style={{
        background: `linear-gradient(145deg,${B.navyDeep},${B.navy})`,
        borderBottom: `3px solid ${B.orange}`,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "14px 28px",
        }}>
          <Logo />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              color: B.slate400, fontSize: 11, maxWidth: 150,
              overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>{user?.email}</span>
            <Btn
              variant="ghost" onClick={signOut}
              style={{
                color: B.slate400,
                borderColor: "rgba(255,255,255,0.15)",
                fontSize: 11,
              }}
            >Sign Out</Btn>
            {onSwitch && (
              <Btn
                variant="ghost" onClick={onSwitch}
                style={{
                  color: B.slate400,
                  borderColor: "rgba(255,255,255,0.15)",
                  fontSize: 11,
                }}
              >🔐 Admin</Btn>
            )}
          </div>
        </div>
        <div style={{ padding: "0 28px 20px" }}>
          <h1 style={{
            fontFamily: "'Fraunces',Georgia,serif",
            fontSize: 28, fontWeight: 800,
            color: "#fff", margin: 0,
          }}>
            {LOAN_TYPES[form.loanType]?.headerTitle
              || "Loan Application"}
          </h1>
          <div style={{
            display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap",
          }}>
            <Badge icon="🤖" text="AI Underwriting" />
            <Badge icon="📊" text="Auto Pitch Deck" />
            <Badge icon="🔒" text="Bank-Grade Security" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        maxWidth: 820, margin: "0 auto", padding: "24px 20px 60px",
      }}>
        {/* Loan Type Selector */}
        <div style={{
          display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap",
        }}>
          {Object.entries(LOAN_TYPES).map(([v, lt]) => (
            <button
              key={v}
              onClick={() => { u("loanType", v); setStep(1); }}
              style={{
                flex: 1, minWidth: 140, padding: "14px 12px",
                borderRadius: 12,
                border: `2px solid ${form.loanType === v
                  ? B.navy : B.slate200}`,
                background: form.loanType === v
                  ? `linear-gradient(135deg,${B.navy},${B.navyMid})`
                  : "#fff",
                color: form.loanType === v ? "#fff" : B.slate600,
                cursor: "pointer", textAlign: "center",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>
                {lt.icon}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 700,
              }}>{lt.label}</div>
              <div style={{
                fontSize: 10,
                color: form.loanType === v
                  ? "rgba(255,255,255,0.7)" : B.slate400,
              }}>{lt.description}</div>
            </button>
          ))}
        </div>

        {/* Step Navigation */}
        <div style={{
          display: "flex", borderBottom: `2px solid ${B.slate200}`,
          marginBottom: 24, overflowX: "auto",
        }}>
          {labels.map((l, i) => {
            const n = i + 1;
            const ac = step === n;
            const dn = step > n;
            return (
              <button
                key={n}
                onClick={() => n <= step && setStep(n)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 16px",
                  cursor: n <= step ? "pointer" : "default",
                  whiteSpace: "nowrap",
                  borderBottom: `3px solid ${ac
                    ? B.orange : "transparent"}`,
                  background: "none", border: "none",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: 12,
                  fontWeight: ac ? 700 : 500,
                  color: dn ? B.green : ac ? B.navy : B.slate400,
                  transition: "all 0.2s",
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: dn ? B.green : ac ? B.navy : B.slate200,
                  color: dn || ac ? "#fff" : B.slate400,
                }}>
                  {dn ? "✓" : n}
                </span>
                {l}
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <BorrowerStep form={form} u={u} setStep={setStep} />
        )}
        {step === 2 && (
          <PropertyStep form={form} u={u} setStep={setStep} />
        )}
        {step === 3 && (
          <LoanStep form={form} u={u} setStep={setStep} />
        )}
        {step === 4 && (
          <DocsStep
            form={form} u={u} setStep={setStep}
            uploads={uploads} setUploads={setUploads}
            fileRef={fileRef} handleFiles={handleFiles}
          />
        )}
        {step === 5 && (
          <ExperienceStep form={form} u={u} setStep={setStep} />
        )}
        {step === 6 && (
          <ReviewStep
            form={form} setStep={setStep}
            uploads={uploads}
            consentAll={consentAll}
            setConsentAll={setConsentAll}
            setSubmitted={setSubmitted}
            user={user}
          />
        )}
      </div>
    </div>
  );
}
