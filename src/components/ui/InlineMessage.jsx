export function InlineMessage({ tone = "neutral", children }) {
  return <div className={`inline-message ${tone}`}>{children}</div>;
}
