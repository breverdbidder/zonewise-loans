/**
 * @fileoverview Inline badge component for feature tags
 * @module components/shared/Badge
 */

/**
 * Small inline badge with icon and text
 * @param {Object} props
 * @param {string} props.icon - Emoji or icon
 * @param {string} props.text - Badge label text
 * @returns {JSX.Element}
 */
export const Badge = ({ icon, text }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "5px 14px", borderRadius: 100,
    color: "rgba(255,255,255,0.8)",
    fontSize: 11, fontWeight: 600,
  }}>{icon} {text}</span>
);
