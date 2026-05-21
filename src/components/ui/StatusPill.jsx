import { formatFrameCategory, getCategoryTone } from "../../lib/formatters";

export function StatusPill({ value }) {
  const tone = getCategoryTone(value);
  return (
    <span className={`status-pill ${tone}`}>
      {formatFrameCategory(value)}
    </span>
  );
}
