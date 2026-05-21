import {
  formatFrameCategory,
  formatNumber,
  getCategorySummary,
  getCategoryTone,
} from "../../lib/formatters";
import { StatusPill } from "./StatusPill";

function getResultMeterPosition(category) {
  const tone = getCategoryTone(category);

  if (tone === "info") {
    return 18;
  }

  if (tone === "warn") {
    return 84;
  }

  if (tone === "good") {
    return 50;
  }

  return 34;
}

export function MeasurementResultCard({ result, title, description }) {
  if (!result) {
    return (
      <section className="surface-card result-card-placeholder">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Onizleme</p>
            <h3>{title}</h3>
          </div>
        </div>

        <p className="section-copy">
          {description ?? "Sonuc hesaplandiginda bu alanda kategori ve oran bilgisi gosterilir."}
        </p>
      </section>
    );
  }

  const tone = getCategoryTone(result.category);
  const meterPosition = getResultMeterPosition(result.category);

  return (
    <section className={`surface-card result-card result-card-${tone}`}>
      <div className="section-heading result-card-header">
        <div>
          <p className="eyebrow">Son Olcum Sonucu</p>
          <h3>{title}</h3>
        </div>
      </div>

      {description ? <p className="result-card-copy">{description}</p> : null}

      <div className={`result-hero-panel ${tone}`}>
        <span className="result-hero-label">Frame Index</span>
        <strong>{formatNumber(result.frameIndex)}</strong>
        <StatusPill value={result.category} />
      </div>

      <div className="result-scale">
        <div className="result-scale-labels">
          <span>Ince</span>
          <span>Orta</span>
          <span>Iri</span>
        </div>
        <div className="result-scale-track">
          <span
            className="result-scale-thumb"
            style={{ left: `${meterPosition}%` }}
          />
        </div>
      </div>

      <div className="result-metric-grid">
        <div className="result-metric-card">
          <span>Yapi tipi</span>
          <strong>{formatFrameCategory(result.category)}</strong>
        </div>
        <div className="result-metric-card">
          <span>Z-Score</span>
          <strong>{formatNumber(result.zScore)}</strong>
        </div>
        <div className="result-metric-card">
          <span>Referans</span>
          <strong>{result.referenceRange ?? "-"}</strong>
        </div>
      </div>

      <div className={`result-note-panel ${tone}`}>
        <p>{getCategorySummary(result.category)}</p>
        {result.note ? <p>{result.note}</p> : null}
      </div>
    </section>
  );
}
