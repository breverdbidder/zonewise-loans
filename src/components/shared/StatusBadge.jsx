/**
 * @fileoverview Status badge and score color utility
 * @module components/shared/StatusBadge
 */
import { COLORS } from "../../utils/constants.js";
const B = COLORS;

/**
 * Get color for a numeric score
 * @param {number} s - Score value (0-100)
 * @returns {string} CSS color string
 */
export const scoreColor = (s) =>
  s >= 80 ? B.green : s >= 60 ? B.orange : B.red;

const statusMap = {
  pending: { bg: B.amberLight, color: "#92400e", l: "Pending" },
  reviewed: { bg: "#dbeafe", color: "#1e40af", l: "Under Review" },
  approved: { bg: B.greenLight, color: "#065f46", l: "Approved" },
  declined: { bg: B.redLight, color: "#991b1b", l: "Declined" },
};

/**
 * Pill-shaped status badge
 * @param {Object} props
 * @param {"pending"|"reviewed"|"approved"|"declined"} props.status
 * @returns {JSX.Element}
 */
export const StatusBadge = ({ status }) => {
  const s = statusMap[status] || statusMap.pending;
  return (
    <span
      role="status"
      aria-label={`Application status: ${s.l}`}
      style={{
        padding: "4px 12px", borderRadius: 100,
        fontSize: 11, fontWeight: 700,
        background: s.bg, color: s.color,
      }}
    >{s.l}</span>
  );
};
