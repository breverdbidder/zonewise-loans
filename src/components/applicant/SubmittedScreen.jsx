/**
 * @fileoverview Post-submission confirmation screen
 * @module components/applicant/SubmittedScreen
 */
import { COLORS } from "../../utils/constants.js";
import { uid } from "../../utils/formatters.js";
import { Logo } from "../shared/Logo.jsx";
import { Card } from "../shared/Card.jsx";
const B = COLORS;

/**
 * Confirmation screen shown after successful form submission
 * @returns {JSX.Element}
 */
export function SubmittedScreen() {
  return (
    <div style={{ minHeight: "100vh", background: B.slate50 }}>
      <header style={{
        background: `linear-gradient(145deg,${B.navyDeep},${B.navy})`,
        padding: "20px 32px",
      }}>
        <Logo />
      </header>
      <div style={{
        maxWidth: 600, margin: "60px auto",
        textAlign: "center", padding: "0 20px",
      }}>
        <Card>
          <div style={{ padding: "48px 32px" }}>
            <div style={{
              width: 72, height: 72,
              background: `linear-gradient(135deg,${B.green},#059669)`,
              borderRadius: "50%",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 32, color: "#fff",
              boxShadow: "0 8px 28px rgba(16,185,129,0.3)",
            }}>&#x2713;</div>
            <h2 style={{
              fontFamily: "'Fraunces',Georgia,serif",
              fontSize: 26, color: B.navyDeep, marginBottom: 8,
            }}>Application Submitted!</h2>
            <p style={{
              color: B.slate600, fontSize: 14, marginBottom: 20,
            }}>
              Your loan application and project documents have been received.
              Our AI underwriting engine will analyze your deal and a loan
              officer will contact you within 24 hours.
            </p>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 18, fontWeight: 700, color: B.navy,
              background: B.slate50,
              border: `1px solid ${B.slate200}`,
              padding: "10px 24px", borderRadius: 8,
              display: "inline-block", letterSpacing: 1,
            }}>ZW-HM-{uid()}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
