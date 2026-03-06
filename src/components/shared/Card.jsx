/**
 * @fileoverview Card container and header components
 * @module components/shared/Card
 */
import { COLORS } from "../../utils/constants.js";
const B = COLORS;

/**
 * Card container with shadow and border
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} [props.style] - Additional styles
 * @returns {JSX.Element}
 */
export const Card = ({ children, style }) => (
  <div style={{
    background: "#fff", borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: `1px solid ${B.slate200}`,
    marginBottom: 16, overflow: "hidden",
    ...style,
  }}>{children}</div>
);

/**
 * Card header with title and optional subtitle
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} [props.sub] - Subtitle text
 * @param {React.ReactNode} [props.right] - Right-aligned content
 * @returns {JSX.Element}
 */
export const CardHead = ({ title, sub, right }) => (
  <div style={{
    padding: "20px 24px 4px",
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start",
  }}>
    <div>
      <h3 style={{
        fontFamily: "'Fraunces',Georgia,serif",
        fontSize: 19, fontWeight: 700,
        color: B.navyDeep, margin: 0,
      }}>{title}</h3>
      {sub && <p style={{
        color: B.slate600, fontSize: 12, marginTop: 2,
      }}>{sub}</p>}
    </div>
    {right}
  </div>
);
