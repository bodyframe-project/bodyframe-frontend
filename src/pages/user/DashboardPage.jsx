import { useEffect, useState } from "react";
import { MeasurementChart } from "../../components/charts/MeasurementChart";
import { MeasurementForm } from "../../components/forms/MeasurementForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { MeasurementGuideCards } from "../../components/ui/MeasurementGuideCards";
import { MeasurementHistoryTable } from "../../components/ui/MeasurementHistoryTable";
import { MeasurementResultCard } from "../../components/ui/MeasurementResultCard";
import { StatCard } from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { normalizeCalculationResponse } from "../../lib/frameAnalysis";
import {
  calculateAge,
  formatDate,
  formatFrameCategory,
  toApiDateTime,
  translateGender,
} from "../../lib/formatters";
import { measurementService } from "../../services/measurementService";

function createInitialForm() {
  return {
    height: "",
    weight: "",
    elbowWidth: "",
    wristWidth: "",
    measurementDate: new Date().toISOString().split("T")[0],
  };
}

function normalizeMeasurementPayload(form, userId) {
  return {
    userId,
    height: Number(form.height),
    weight: Number(form.weight),
    elbowWidth: Number(form.elbowWidth),
    wristWidth: Number(form.wristWidth),
    measurementDate: toApiDateTime(form.measurementDate),
  };
}

export function DashboardPage() {
  const { profile } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [form, setForm] = useState(createInitialForm);

  const age = calculateAge(profile?.dateOfBirth);
  const latestMeasurement = history[0];

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!profile?.id) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await measurementService.getHistory();
        if (!cancelled) {
          setHistory(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  function handleChange(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function runPreview() {
    if (!profile?.gender) {
      throw new Error("Profil bilgileri yuklenemedi.");
    }

    const payload = {
      height: Number(form.height),
      wristWidth: Number(form.wristWidth),
      gender: profile.gender,
      age,
    };

    const response = await measurementService.calculate(payload);
    const nextResult = normalizeCalculationResponse(response);
    setResult(nextResult);
    return nextResult;
  }

  async function handlePreview() {
    setPreviewing(true);
    setError("");
    setMessage("");

    try {
      await runPreview();
    } catch (previewError) {
      setError(previewError.message);
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const nextResult = await runPreview();
      await measurementService.create(
        normalizeMeasurementPayload(form, profile.id),
      );
      const response = await measurementService.getHistory();
      setHistory(response);
      setResult(nextResult);
      setMessage("Olcum basariyla kaydedildi.");
      setForm(createInitialForm());
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      {message ? <InlineMessage tone="success">{message}</InlineMessage> : null}
      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <MeasurementChart
        featured
        eyebrow="Genel Bakis"
        measurements={history}
        title={
          profile?.name
            ? `${profile.name} icin olcum trendi`
            : "Olcum trendi"
        }
        description="Kayitlariniz zaman sirasiyla gosterilir."
      />

      <section className="stat-grid">
        <StatCard
          label="Toplam Kayit"
          value={loading ? "..." : history.length}
        />
        <StatCard
          label="Son Kategori"
          value={
            latestMeasurement
              ? formatFrameCategory(latestMeasurement.frameCategory)
              : "-"
          }
        />
        <StatCard
          label="Profil Ozeti"
          value={`${age ?? "-"} / ${translateGender(profile?.gender)}`}
          tone="highlight"
        />
      </section>

      <div className="content-grid">
        <MeasurementForm
          title="Yeni olcum gir"
          description="Boy, kilo, bilek ve dirsek bilgilerini ekleyin."
          values={form}
          onChange={handleChange}
          onPreview={handlePreview}
          onSubmit={handleSubmit}
          previewing={previewing}
          submitting={submitting}
          submitLabel="Hesapla ve Kaydet"
          previewLabel="Sonucu Onizle"
        />

        <MeasurementResultCard
          result={result}
          title="Son olcum sonucu"
        />
      </div>

      <MeasurementGuideCards compact title="Olcum rehberi" />

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Olcum Gecmisi</p>
            <h3>Tum kayitlar</h3>
          </div>
        </div>

        {loading ? (
          <div className="screen-loader inline">Olcumler yukleniyor...</div>
        ) : history.length ? (
          <MeasurementHistoryTable
            measurements={history}
            emptyText="Olcum ekledikten sonra burada kayitlar listelenecek."
          />
        ) : (
          <EmptyState
            title="Takip listesi henuz bos"
            description="Ilk olcumu ekledikten sonra grafik ve tablo otomatik dolacak."
          />
        )}
      </section>
    </div>
  );
}
