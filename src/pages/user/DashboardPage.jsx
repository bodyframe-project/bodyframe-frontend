import { useEffect, useState } from "react";
import { MeasurementChart } from "../../components/charts/MeasurementChart";
import { MeasurementForm } from "../../components/forms/MeasurementForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { MeasurementHistoryTable } from "../../components/ui/MeasurementHistoryTable";
import { MeasurementResultCard } from "../../components/ui/MeasurementResultCard";
import { StatCard } from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import {
  calculateAge,
  formatDate,
  formatNumber,
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

function normalizeCalculationResponse(payload) {
  return payload?.data ?? payload?.Data ?? payload;
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
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Kisisel Takip</p>
          <h1>
            {profile?.name ? `${profile.name}, olcum trendlerin hazir.` : "Olcum paneli"}
          </h1>
          <p>
            Yas {age} · {translateGender(profile?.gender)} · son kayitlarin API
            uzerinden canli olarak listeleniyor.
          </p>
        </div>
        <div className="hero-chip-group">
          <span className="hero-chip">Chart.js trend analizi</span>
          <span className="hero-chip">Frame index + z-score</span>
          <span className="hero-chip">Backend ile tam uyumlu</span>
        </div>
      </section>

      {message ? <InlineMessage tone="success">{message}</InlineMessage> : null}
      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <section className="stat-grid">
        <StatCard
          label="Toplam Kayit"
          value={loading ? "..." : history.length}
          hint="Hesabina bagli tum olcumler"
        />
        <StatCard
          label="Son Kategori"
          value={latestMeasurement?.frameCategory ?? "-"}
          hint={
            latestMeasurement
              ? `${formatDate(latestMeasurement.measurementDate)} tarihli son kayit`
              : "Henuz olcum eklenmedi"
          }
        />
        <StatCard
          label="Son Frame Index"
          value={
            latestMeasurement ? formatNumber(latestMeasurement.frameIndex) : "-"
          }
          hint="Son kayit icin hesaplanan oran"
          tone="highlight"
        />
      </section>

      <div className="content-grid">
        <MeasurementForm
          title="Frame index hesapla ve kaydet"
          description="Onizleme frame index hesabini boy ve bilek genisligi ile yapar; kayit asamasinda tum olcumler backend tarafina gonderilir."
          values={form}
          onChange={handleChange}
          onPreview={handlePreview}
          onSubmit={handleSubmit}
          previewing={previewing}
          submitting={submitting}
          submitLabel="Hesapla ve Kaydet"
          previewLabel="Sonucu Onizle"
          footerNote="Cocuk kullanicilarda yas ve cinsiyet bilgisi profilinden, yetiskinlerde ise eriskin stratejisinden otomatik alinir."
        />

        <MeasurementResultCard
          result={result}
          title="Son onizleme sonucu"
          description="Bu kart backend calculate endpoint'inden donen sonuc ile uretilir."
        />
      </div>

      <MeasurementChart
        measurements={history}
        title="Frame index ve z-score trendi"
        description="Mavi cizgi frame index, turkuaz cizgi ise z-score degisimini gosterir."
      />

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Olcum Gecmisi</p>
            <h3>Kayitli olcumler</h3>
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
