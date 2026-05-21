import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { MeasurementChart } from "../../components/charts/MeasurementChart";
import { MeasurementForm } from "../../components/forms/MeasurementForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { MeasurementHistoryTable } from "../../components/ui/MeasurementHistoryTable";
import { MeasurementResultCard } from "../../components/ui/MeasurementResultCard";
import { StatCard } from "../../components/ui/StatCard";
import { formatDate, toApiDateTime, translateGender } from "../../lib/formatters";
import { doctorService } from "../../services/doctorService";
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

export function PatientDetailPage() {
  const { patientId } = useParams();
  const location = useLocation();
  const [patient, setPatient] = useState(location.state?.patient ?? null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState(createInitialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError("");

      try {
        const [patients, patientHistory] = await Promise.all([
          doctorService.getMyPatients(),
          doctorService.getPatientHistory(patientId),
        ]);

        if (!cancelled) {
          setPatient(
            location.state?.patient ??
              patients.find((item) => item.patientId === patientId) ??
              null,
          );
          setHistory(patientHistory);
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

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [location.state?.patient, patientId]);

  function handleChange(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function runPreview() {
    if (!patient) {
      throw new Error("Hasta bilgisi bulunamadi.");
    }

    const response = await measurementService.calculate({
      height: Number(form.height),
      wristWidth: Number(form.wristWidth),
      gender: patient.gender,
      age: patient.age,
    });
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
      await doctorService.createPatientMeasurement(patientId, {
        userId: patientId,
        height: Number(form.height),
        weight: Number(form.weight),
        elbowWidth: Number(form.elbowWidth),
        wristWidth: Number(form.wristWidth),
        measurementDate: toApiDateTime(form.measurementDate),
      });
      const patientHistory = await doctorService.getPatientHistory(patientId);
      setHistory(patientHistory);
      setResult(nextResult);
      setMessage("Olcum kaydedildi.");
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

      <section className="surface-card patient-spotlight">
        <div className="patient-spotlight-copy">
          <p className="eyebrow">Hasta Detayi</p>
          <h1>{patient?.name ?? "Hasta bilgisi yukleniyor"}</h1>
          <p>
            {patient?.isDependentProfile
              ? `Aile: ${patient?.parentDisplayName ?? "-"} / ${patient?.parentNationalId ?? "-"}`
              : patient?.isDoctorManagedPatient
                ? `Anne: ${patient?.motherName ?? "-"} / ${patient?.country ?? "-"}`
                : patient?.email ?? "Atanmis hasta kaydi"}{" "}
            / {translateGender(patient?.gender)} / {patient?.age ?? "-"} yas
          </p>
        </div>

        <div className="patient-spotlight-meta">
          <span className="patient-spotlight-tag">
            {patient?.totalMeasurements ?? history.length} olcum
          </span>
          <span className="patient-spotlight-tag">
            {patient?.lastMeasurementDate
              ? formatDate(patient.lastMeasurementDate)
              : "Tarih yok"}
          </span>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard label="Toplam Kayit" value={loading ? "..." : history.length} />
        <StatCard
          label="Son Kategori"
          value={history[0]?.frameCategory ?? patient?.lastFrameCategory ?? "-"}
        />
        <StatCard
          label="Yas / Cinsiyet"
          value={`${patient?.age ?? "-"} / ${translateGender(patient?.gender)}`}
          tone="highlight"
        />
      </section>

      <div className="content-grid">
        <MeasurementForm
          title="Yeni olcum ekle"
          description="Secili hasta icin yeni kayit olusturun."
          values={form}
          onChange={handleChange}
          onPreview={handlePreview}
          onSubmit={handleSubmit}
          previewing={previewing}
          submitting={submitting}
          submitLabel="Hesapla ve Kaydet"
          previewLabel="Sonucu Onizle"
        />

        <MeasurementResultCard result={result} title="Son olcum sonucu" />
      </div>

      <MeasurementChart
        measurements={history}
        title="Olcum egisi"
        description="Kayitlar zaman sirasiyla gosterilir."
      />

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Tum Olcumler</p>
            <h3>Olcum kayitlari</h3>
          </div>
        </div>

        {loading ? (
          <div className="screen-loader inline">Hasta olcumleri yukleniyor...</div>
        ) : history.length ? (
          <MeasurementHistoryTable
            measurements={history}
            emptyText="Yeni olcum eklediginizde burada listelenecek."
          />
        ) : (
          <EmptyState
            title="Bu hasta icin olcum bulunmuyor"
            description="Ilk kayittan sonra grafik ve tablo otomatik dolacak."
          />
        )}
      </section>
    </div>
  );
}
