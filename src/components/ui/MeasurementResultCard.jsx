import { formatNumber, getCategoryTone } from "../../lib/formatters";
import { StatCard } from "./StatCard";
import { StatusPill } from "./StatusPill";

export function MeasurementResultCard({ result, title, description }) {
  if (!result) {
    return null;
  }

  return (
    <section className={`surface-card result-card ${getCategoryTone(result.category)}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Son Hesaplama</p>
          <h3>{title}</h3>
        </div>
        <StatusPill value={result.category} />
      </div>

      {description ? <p className="section-copy">{description}</p> : null}

      <div className="stat-grid">
        <StatCard
          label="Frame Index"
          value={formatNumber(result.frameIndex)}
          hint="Boy / bilek genisligi oranindan uretilir."
          tone="highlight"
        />
        <StatCard
          label="Z-Score"
          value={formatNumber(result.zScore)}
          hint="Yas ve cinsiyete gore normalize edilir."
        />
        <StatCard
          label="Kategori"
          value={result.category}
          hint="Backend stratejisi ile hesaplandi."
        />
      </div>
    </section>
  );
}
