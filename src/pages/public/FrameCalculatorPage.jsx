import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../../components/layout/SiteHeader";
import { MeasurementGuideCards } from "../../components/ui/MeasurementGuideCards";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { MeasurementResultCard } from "../../components/ui/MeasurementResultCard";
import { useAuth } from "../../context/AuthContext";
import {
  calculateElbowFrame,
  normalizeCalculationResponse,
} from "../../lib/frameAnalysis";
import { formatNumber } from "../../lib/formatters";
import { measurementService } from "../../services/measurementService";

const METHOD_CONTENT = {
  wrist: {
    badge: "Bilek cevresi",
    title: "Ana hesap",
    inputLabel: "Bilek cevresi (cm)",
    helper: "Ana sonuc bu olcuye gore uretilir.",
  },
  elbow: {
    badge: "Dirsek genisligi",
    title: "Ek yorum",
    inputLabel: "Dirsek genisligi (cm)",
    helper: "Destekleyici yorum icin kullanilir.",
  },
};

const THRESHOLD_TABLES = [
  {
    key: "male",
    title: "Erkekler icin yetiskin bilek orani",
    rows: [
      { range: "r > 10.4", category: "Ince cerceve" },
      { range: "r = 9.6 - 10.4", category: "Orta cerceve" },
      { range: "r < 9.6", category: "Iri cerceve" },
    ],
  },
  {
    key: "female",
    title: "Kadinlar icin yetiskin bilek orani",
    rows: [
      { range: "r > 11.0", category: "Ince cerceve" },
      { range: "r = 10.1 - 11.0", category: "Orta cerceve" },
      { range: "r < 10.1", category: "Iri cerceve" },
    ],
  },
];

function createInitialForm() {
  return {
    gender: "female",
    age: "28",
    height: "165",
    wristWidth: "15.8",
    elbowWidth: "6.4",
  };
}

function buildResultMeta(method, form, rawResult) {
  const content = METHOD_CONTENT[method];

  if (method === "wrist") {
    return {
      ...rawResult,
      method,
      methodLabel: content.badge,
      referenceRange: `${formatNumber(form.height, 1)} / ${formatNumber(form.wristWidth, 1)}`,
      note: "Yetiskin referans araliklari ile eslestirildi.",
    };
  }

  return {
    ...rawResult,
    method,
    methodLabel: content.badge,
    referenceRange: `${formatNumber(form.height, 1)} cm boy bandi`,
    note: "Destekleyici yorum olarak okunur.",
  };
}

export function FrameCalculatorPage() {
  const { isAuthenticated } = useAuth();
  const [method, setMethod] = useState("wrist");
  const [form, setForm] = useState(createInitialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const content = METHOD_CONTENT[method];

  function handleChange(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleMethodChange(nextMethod) {
    setMethod(nextMethod);
    setResult(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      let nextResult;

      if (method === "wrist") {
        const response = await measurementService.calculate({
          height: Number(form.height),
          wristWidth: Number(form.wristWidth),
          gender: form.gender,
          age: Number(form.age),
        });

        nextResult = buildResultMeta(
          method,
          form,
          normalizeCalculationResponse(response),
        );
      } else {
        nextResult = buildResultMeta(
          method,
          form,
          calculateElbowFrame({
            height: Number(form.height),
            elbowWidth: Number(form.elbowWidth),
            gender: form.gender,
          }),
        );
      }

      setResult(nextResult);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="public-shell">
      <SiteHeader
        links={[
          { label: "Hesaplayici", to: "/calculator" },
          { label: "Olcum rehberi", href: "#how-to-measure" },
          { label: "Yetiskin referansi", href: "#adult-reference" },
        ]}
      />

      <section className="surface-card medical-hero">
        <div className="medical-hero-copy">
          <p className="eyebrow">Vucut Cerceve Hesaplayici</p>
          <h1>Boy ve bilek cevresi ile vucut cerceve sonucunuzu gorun.</h1>
          <p>
            Ana sonuc bilek olcusunden uretilir. Dirsek olcusu ek yorum icin
            kullanilir.
          </p>

          <div className="hero-cta-row">
            <a href="#calculator" className="button">
              Hesaplamaya basla
            </a>
            <Link
              to={isAuthenticated ? "/app/profile" : "/login"}
              className="button button-secondary"
            >
              {isAuthenticated ? "Panelim" : "Giris yap"}
            </Link>
          </div>
        </div>

        <div className="hero-reference-card">
          <p className="eyebrow">Kisa Ozet</p>
          <h3>Yetiskin referansi</h3>

          <div className="hero-reference-list">
            <div>
              <span>Erkek</span>
              <strong>10.4 uzeri ince / 9.6 alti iri</strong>
            </div>
            <div>
              <span>Kadin</span>
              <strong>11.0 uzeri ince / 10.1 alti iri</strong>
            </div>
            <div>
              <span>Destek olcu</span>
              <strong>Dirsek genisligi ek yorum icin kullanilir</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator" className="surface-card calculator-workbench">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Hesaplama</p>
            <h2>Olculeri girin</h2>
          </div>
          <p className="section-copy">Sonuc tek ekranda hesaplanir ve gosterilir.</p>
        </div>

        <div className="method-toggle" role="tablist" aria-label="Olcum yontemi">
          {Object.entries(METHOD_CONTENT).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`method-tab${method === key ? " active" : ""}`}
              onClick={() => handleMethodChange(key)}
            >
              <span>{item.badge}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>

        {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

        <div className="calculator-grid">
          <form className="calculator-form" onSubmit={handleSubmit}>
            <div className="calculator-form-intro">
              <p className="eyebrow">{content.badge}</p>
              <h3>{content.title}</h3>
              <p>{content.helper}</p>
            </div>

            <div className="segmented-control" aria-label="Cinsiyet secimi">
              <button
                type="button"
                className={form.gender === "female" ? "active" : ""}
                onClick={() => handleChange("gender", "female")}
              >
                Kadin
              </button>
              <button
                type="button"
                className={form.gender === "male" ? "active" : ""}
                onClick={() => handleChange("gender", "male")}
              >
                Erkek
              </button>
            </div>

            <div className="form-grid calculator-field-grid">
              <label className="field">
                <span>Boy (cm)</span>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={form.height}
                  onChange={(event) => handleChange("height", event.target.value)}
                  placeholder="Orn. 170"
                  required
                />
              </label>

              <label className="field">
                <span>Yas</span>
                <input
                  type="number"
                  min="1"
                  value={form.age}
                  onChange={(event) => handleChange("age", event.target.value)}
                  placeholder="Orn. 28"
                  required={method === "wrist"}
                />
              </label>

              {method === "wrist" ? (
                <label className="field field-full">
                  <span>{content.inputLabel}</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={form.wristWidth}
                    onChange={(event) =>
                      handleChange("wristWidth", event.target.value)
                    }
                    placeholder="Orn. 15.8"
                    required
                  />
                </label>
              ) : (
                <label className="field field-full">
                  <span>{content.inputLabel}</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={form.elbowWidth}
                    onChange={(event) =>
                      handleChange("elbowWidth", event.target.value)
                    }
                    placeholder="Orn. 6.4"
                    required
                  />
                </label>
              )}
            </div>

            <button type="submit" className="button" disabled={loading}>
              {loading ? "Hesaplaniyor..." : "Sonucu hesapla"}
            </button>
          </form>

          <MeasurementResultCard
            result={result}
            title={method === "wrist" ? "Bilek sonucu" : "Dirsek yorumu"}
            description={
              method === "wrist"
                ? "Ana hesap sonucu"
                : "Destekleyici yorum sonucu"
            }
          />
        </div>
      </section>

      <MeasurementGuideCards id="how-to-measure" compact title="Olcum noktasi" />

      <section className="surface-card formula-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nasil Calisir?</p>
            <h2>Oran mantigi ile okunur.</h2>
          </div>
        </div>

        <div className="formula-grid">
          <article className="formula-card">
            <span>Formul</span>
            <strong>Boy / Bilek Cevresi</strong>
            <p>Ayni birimle girilen olculer oran mantigini korur.</p>
          </article>
          <article className="formula-card">
            <span>Ornek</span>
            <strong>183 / 14 = 13.07</strong>
            <p>Bu deger ince cerceveye yaklasir.</p>
          </article>
          <article className="formula-card">
            <span>Ek yorum</span>
            <strong>Dirsek genisligi</strong>
            <p>Bilek sonucunu destekleyen ikinci referanstir.</p>
          </article>
        </div>
      </section>

      <section id="adult-reference" className="criteria-grid">
        {THRESHOLD_TABLES.map((table) => (
          <article key={table.key} className="surface-card criteria-card">
            <p className="eyebrow">Yetiskin Referansi</p>
            <h3>{table.title}</h3>
            <div className="criteria-table-wrap">
              <table className="criteria-table">
                <thead>
                  <tr>
                    <th>Oran</th>
                    <th>Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr key={row.range}>
                      <td>{row.range}</td>
                      <td>{row.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
