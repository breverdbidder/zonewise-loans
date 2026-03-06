/**
 * @fileoverview Step 4: Document Upload
 * @module components/applicant/steps/DocsStep
 */
import { COLORS, INPUT_STYLE } from "../../../utils/constants.js";
import { uid } from "../../../utils/formatters.js";
import { Card, CardHead } from "../../shared/Card.jsx";
import { Btn } from "../../shared/Btn.jsx";
import { Field, Sep } from "../../shared/Field.jsx";
const B = COLORS;
const is = INPUT_STYLE;

/**
 * File upload step for plans, renderings, and project photos
 * @param {Object} props
 * @param {Object} props.form - Form state
 * @param {Function} props.u - Update function
 * @param {Function} props.setStep - Step navigation
 * @param {Array} props.uploads - Uploaded files array
 * @param {Function} props.setUploads - Set uploads state
 * @param {Object} props.fileRef - File input ref
 * @param {Function} props.handleFiles - File handler
 * @returns {JSX.Element}
 */
export function DocsStep({
  form, u, setStep, uploads, setUploads, fileRef, handleFiles,
}) {
  return (
    <div>
      <Card>
        <CardHead
          title="Plans, Renderings & Project Photos"
          sub="Upload construction plans, renderings, before/after photos, scope of work, comparable sales"
        />
        <div style={{ padding: "8px 24px 24px" }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${B.slate200}`,
              borderRadius: 14, padding: "36px 24px",
              textAlign: "center", cursor: "pointer",
              background: B.slate50, transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>&#x1F4D0;</div>
            <div style={{
              fontWeight: 700, fontSize: 14, color: B.navy,
            }}>Drop files here or click to browse</div>
            <div style={{
              fontSize: 12, color: B.slate400, marginTop: 4,
            }}>JPG, PNG, PDF — up to 10 files, 10 MB each</div>
            <input
              ref={fileRef} type="file" multiple
              accept="image/*,.pdf"
              onChange={handleFiles}
              style={{ display: "none" }}
            />
          </div>
          {uploads.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
              gap: 12, marginTop: 16,
            }}>
              {uploads.map((f) => (
                <div key={f.id} style={{
                  position: "relative", borderRadius: 10,
                  overflow: "hidden",
                  border: `1px solid ${B.slate200}`,
                  aspectRatio: "16/10", background: B.slate100,
                }}>
                  {f.type.startsWith("image") ? (
                    <img
                      src={f.url} alt={f.name}
                      style={{
                        width: "100%", height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      height: "100%", color: B.slate400,
                    }}>
                      <span style={{ fontSize: 28 }}>&#x1F4C4;</span>
                      <span style={{ fontSize: 11, marginTop: 4 }}>
                        PDF
                      </span>
                    </div>
                  )}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "6px 10px",
                    background: "linear-gradient(transparent,rgba(0,0,0,0.7))",
                    color: "#fff", fontSize: 10, fontWeight: 600,
                    whiteSpace: "nowrap", overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>{f.name}</div>
                  <button
                    onClick={() => setUploads((p) =>
                      p.filter((x) => x.id !== f.id)
                    )}
                    style={{
                      position: "absolute", top: 6, right: 6,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "rgba(0,0,0,0.5)", color: "#fff",
                      border: "none", cursor: "pointer", fontSize: 12,
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                    }}
                  >&times;</button>
                </div>
              ))}
            </div>
          )}
          <Sep />
          <Field label="Project Description">
            <textarea
              style={{ ...is, minHeight: 80, resize: "vertical" }}
              value={form.projectDesc}
              onChange={(e) => u("projectDesc", e.target.value)}
              placeholder="Scope of work, timeline, permits, contractor..."
            />
          </Field>
        </div>
      </Card>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 20,
      }}>
        <Btn variant="back" onClick={() => setStep(3)}>&larr; Back</Btn>
        <Btn onClick={() => setStep(5)}>Continue &rarr; Experience</Btn>
      </div>
    </div>
  );
}
