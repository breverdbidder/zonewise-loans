/**
 * @fileoverview Step 1: Borrower Information
 * @module components/applicant/steps/BorrowerStep
 */
import { COLORS, INPUT_STYLE, US_STATES } from "../../../utils/constants.js";
import { fP } from "../../../utils/formatters.js";
import { Card, CardHead } from "../../shared/Card.jsx";
import { Btn } from "../../shared/Btn.jsx";
import { Field } from "../../shared/Field.jsx";
import { RadioGroup, Grid } from "../../shared/Field.jsx";
const B = COLORS;
const is = INPUT_STYLE;

/**
 * Borrower information form step
 * @param {Object} props
 * @param {Object} props.form - Form state
 * @param {Function} props.u - Update function (key, value)
 * @param {Function} props.setStep - Step navigation
 * @returns {JSX.Element}
 */
export function BorrowerStep({ form, u, setStep }) {
  return (
    <div>
      <Card>
        <CardHead
          title="Borrower Information"
          sub="Primary contact and entity details"
        />
        <div style={{ padding: "8px 24px 24px" }}>
          <Grid>
            <Field label="First Name" required>
              <input
                style={is} value={form.firstName}
                onChange={(e) => u("firstName", e.target.value)}
                placeholder="First name"
              />
            </Field>
            <Field label="Last Name" required>
              <input
                style={is} value={form.lastName}
                onChange={(e) => u("lastName", e.target.value)}
                placeholder="Last name"
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="Email" required>
              <input
                style={is} type="email" value={form.email}
                onChange={(e) => u("email", e.target.value)}
                placeholder="email@company.com"
              />
            </Field>
            <Field label="Phone" required>
              <input
                style={is} value={form.phone}
                onChange={(e) => u("phone", fP(e.target.value))}
                placeholder="(555) 123-4567"
              />
            </Field>
          </Grid>
          <Field label="Entity Type" required>
            <RadioGroup
              name="et" value={form.entityType}
              options={[
                ["individual", "Individual"],
                ["llc", "LLC"],
                ["corp", "Corporation"],
                ["trust", "Trust"],
              ]}
              onChange={(v) => u("entityType", v)}
            />
          </Field>
          {form.entityType !== "individual" && (
            <Grid>
              <Field label="Entity Name">
                <input
                  style={is} value={form.entityName}
                  onChange={(e) => u("entityName", e.target.value)}
                  placeholder="LLC / Corp name"
                />
              </Field>
              <Field label="State of Formation">
                <select
                  style={is} value={form.entityState}
                  onChange={(e) => u("entityState", e.target.value)}
                >
                  {US_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </Grid>
          )}
          <Grid>
            <Field label="Address" required>
              <input
                style={is} value={form.mailAddr}
                onChange={(e) => u("mailAddr", e.target.value)}
                placeholder="123 Main St"
              />
            </Field>
            <Field label="City" required>
              <input
                style={is} value={form.mailCity}
                onChange={(e) => u("mailCity", e.target.value)}
              />
            </Field>
          </Grid>
          <Grid cols={3}>
            <Field label="State" required>
              <select
                style={is} value={form.mailState}
                onChange={(e) => u("mailState", e.target.value)}
              >
                {US_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="ZIP" required>
              <input
                style={is} value={form.mailZip}
                onChange={(e) => u("mailZip", e.target.value)}
                maxLength={10}
              />
            </Field>
            <Field label="Citizenship">
              <select
                style={is} value={form.citizenship}
                onChange={(e) => u("citizenship", e.target.value)}
              >
                <option value="us">US Citizen</option>
                <option value="pr">Permanent Resident</option>
                <option value="fn">Foreign National</option>
              </select>
            </Field>
          </Grid>
        </div>
      </Card>
      <div style={{
        display: "flex", justifyContent: "flex-end", marginTop: 20,
      }}>
        <Btn onClick={() => setStep(2)}>
          Continue &rarr; Property Details
        </Btn>
      </div>
    </div>
  );
}
