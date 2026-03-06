/**
 * @fileoverview Form field components: Field, CurField, RadioGroup, CheckGroup, Sep, Grid
 * @module components/shared/Field
 */
import { COLORS, INPUT_STYLE } from "../../utils/constants.js";
import { fC } from "../../utils/formatters.js";
const B = COLORS;

/**
 * Form field wrapper with label and optional hint
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {boolean} [props.required] - Show required asterisk
 * @param {React.ReactNode} props.children - Input element
 * @param {string} [props.hint] - Help text below input
 * @returns {JSX.Element}
 */
export const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{
      display: "block", fontSize: 12, fontWeight: 600,
      color: B.slate700, marginBottom: 5, letterSpacing: 0.2,
    }}>
      {label}
      {required && <span style={{ color: B.red }}> *</span>}
    </label>
    {children}
    {hint && (
      <div style={{ fontSize: 11, color: B.slate400, marginTop: 3 }}>
        {hint}
      </div>
    )}
  </div>
);

/**
 * Currency input field with $ prefix
 * @param {Object} props
 * @param {string} props.label
 * @param {boolean} [props.required]
 * @param {string} [props.hint]
 * @param {string} props.value
 * @param {Function} props.onChange
 * @returns {JSX.Element}
 */
export const CurField = ({ label, required, hint, value, onChange }) => (
  <Field label={label} required={required} hint={hint}>
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 13, top: "50%",
        transform: "translateY(-50%)",
        color: B.slate400, fontWeight: 600, fontSize: 13,
      }}>$</span>
      <input
        style={{ ...INPUT_STYLE, paddingLeft: 24 }}
        value={value}
        onChange={(e) => onChange(fC(e.target.value))}
      />
    </div>
  </Field>
);

/**
 * Radio button group rendered as styled cards
 * @param {Object} props
 * @param {string} props.name - Radio group name
 * @param {string} props.value - Selected value
 * @param {Array<[string, string]>} props.options - [value, label] pairs
 * @param {Function} props.onChange - Called with selected value
 * @returns {JSX.Element}
 */
export const RadioGroup = ({ name, value, options, onChange }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: `repeat(${options.length},1fr)`,
    gap: 8,
  }}>
    {options.map(([v, l]) => (
      <label key={v} style={{ cursor: "pointer" }}>
        <input
          type="radio" name={name}
          checked={value === v}
          onChange={() => onChange(v)}
          style={{ display: "none" }}
        />
        <div style={{
          padding: "10px", borderRadius: 8, fontSize: 13,
          fontWeight: value === v ? 600 : 500,
          border: `1.5px solid ${value === v ? B.navy : B.slate200}`,
          background: value === v ? "rgba(30,58,95,0.04)" : "#fff",
          color: value === v ? B.navy : B.slate700,
          textAlign: "center", transition: "all 0.2s",
        }}>{l}</div>
      </label>
    ))}
  </div>
);

/**
 * Checkbox group rendered as styled cards
 * @param {Object} props
 * @param {string[]} props.values - Currently selected values
 * @param {Array<[string, string]>} props.options - [value, label] pairs
 * @param {Function} props.onChange - Called with updated values array
 * @returns {JSX.Element}
 */
export const CheckGroup = ({ values, options, onChange }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: `repeat(${Math.min(options.length, 4)},1fr)`,
    gap: 8,
  }}>
    {options.map(([v, l]) => (
      <label key={v} style={{ cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={values.includes(v)}
          onChange={(e) => onChange(
            e.target.checked
              ? [...values, v]
              : values.filter((x) => x !== v)
          )}
          style={{ display: "none" }}
        />
        <div style={{
          padding: "10px", borderRadius: 8, fontSize: 13,
          fontWeight: values.includes(v) ? 600 : 500,
          border: `1.5px solid ${values.includes(v) ? B.navy : B.slate200}`,
          background: values.includes(v) ? "rgba(30,58,95,0.04)" : "#fff",
          color: values.includes(v) ? B.navy : B.slate700,
          textAlign: "center",
        }}>{l}</div>
      </label>
    ))}
  </div>
);

/**
 * Horizontal separator line
 * @returns {JSX.Element}
 */
export const Sep = () => (
  <div style={{ borderTop: `1px solid ${B.slate200}`, margin: "16px 0" }} />
);

/**
 * Grid layout helper
 * @param {Object} props
 * @param {number} [props.cols=2] - Number of columns
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export const Grid = ({ cols = 2, children }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: `repeat(${cols},1fr)`,
    gap: 14,
  }}>{children}</div>
);
