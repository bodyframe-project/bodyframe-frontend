import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { MeasurementChart } from "../../components/charts/MeasurementChart";
import { MeasurementForm } from "../../components/forms/MeasurementForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { MeasurementHistoryTable } from "../../components/ui/MeasurementHistoryTable";
import { MeasurementResultCard } from "../../components/ui/MeasurementResultCard";
import { StatCard } from "../../components/ui/StatCard";
import { normalizeCalculationResponse } from "../../lib/frameAnalysis";
import {
  calculateAge,
  formatDate,
  toApiDateTime,
  toInputDate,
  translateGender,
} from "../../lib/formatters";
import { dependentService } from "../../services/dependentService";
import { measurementService } from "../../services/measurementService";

const COUNTRY_OPTIONS = ["Turkiye", "Almanya", "Fransa", "Diger"];

function createMeasurementForm() {
  return {
    height: "",
    weight: "",
    elbowWidth: "",
    wristWidth: "",
    measurementDate: new Date().toISOString().split("T")[0],
  };
}

function createProfileForm(child) {
  return {
    name: child?.name ?? "",
    nationalId: child?.nationalId ?? "",
    gender: child?.gender ?? "Male",
    dateOfBirth: toInputDate(child?.dateOfBirth),
    country: child?.country ?? "Turkiye",
  };
}

export function ChildDetailPage() {
  const { childId } = useParams();
  const location = useLocation();
  const [child, setChild] = useState(location.state?.child ?? null);
  const [profileForm, setProfileForm] = useState(createProfileForm(location.state?.child));
  const [measurementForm, setMeasurementForm] = useState(createMeasurementForm);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!child) {
      return;
    }

    setProfileForm(createProfileForm(child));
  }, [child]);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError("");

      try {
        const [childProfile, childHistory] = await Promise.all([
          dependentService.getDependent(childId),
          dependentService.getDependentHistory(childId),
        ]);

        if (!cancelled) {
          setChild(childProfile);
          setHistory(childHistory);
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
  }, [childId]);

  function handleMeasurementChange(field, value) {
    setMeasurementForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function runPreview() {
    if (!child) {
      throw new Error("Cocuk profili bulunamadi.");
    }

    const response = await measurementService.calculate({
      height: Number(measurementForm.height),
      wristWidth: Number(measurementForm.wristWidth),
      gender: child.gender,
      age: calculateAge(child.dateOfBirth),
    });

    const nextResult = normalizeCalculationResponse(response);
    setResult(nextResult);
    return nextResult;
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSavingProfile(true);
    setMessage("");
    setError("");

    try {
      const updatedChild = await dependentService.updateDependent(childId, {
        ...profileForm,
        dateOfBirth: profileForm.dateOfBirth,
      });
      setChild(updatedChild);
      setMessage("Cocuk profili guncellendi.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePreview() {
    setPreviewing(true);
    setMessage("");
    setError("");

    try {
      await runPreview();
    } catch (previewError) {
      setError(previewError.message);
    } finally {
      setPreviewing(false);
    }
  }

  async function handleMeasurementSubmit() {
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const nextResult = await runPreview();
      await dependentService.createDependentMeasurement(childId, {
        userId: childId,
        height: Number(measurementForm.height),
        weight: Number(measurementForm.weight),
        elbowWidth: Number(measurementForm.elbowWidth),
        wristWidth: Number(measurementForm.wristWidth),
        measurementDate: toApiDateTime(measurementForm.measurementDate),
      });
      const childHistory = await dependentService.getDependentHistory(childId);
      setHistory(childHistory);
      setResult(nextResult);
      setMessage("Olcum cocuk profiline kaydedildi.");
      setMeasurementForm(createMeasurementForm());
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
          <p className="eyebrow">Cocuk Profili</p>
          <h1>{child?.name ?? "Cocuk bilgisi yukleniyor"}</h1>
          <p>
            {child?.parentDisplayName ? `${child.parentDisplayName} / ` : ""}
            TC: {child?.nationalId ?? "-"} / {translateGender(child?.gender)} /{" "}
            {child ? calculateAge(child.dateOfBirth) : "-"} yas
          </p>
        </div>

        <div className="patient-spotlight-meta">
          <span className="patient-spotlight-tag">
            {history.length} olcum
          </span>
          <span className="patient-spotlight-tag">
            {child?.isDoctorManagedPatient ? "Doktor kaydi" : "Aile kaydi"}
          </span>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard label="Toplam Kayit" value={loading ? "..." : history.length} />
        <StatCard
          label="Son Kategori"
          value={history[0]?.frameCategory ?? "-"}
        />
        <StatCard
          label="Bagli Hesap"
          value={child?.parentDisplayName ?? "-"}
          tone="highlight"
        />
      </section>

      <div className="content-grid">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Profil</p>
              <h3>Cocuk bilgilerini duzenle</h3>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleProfileSubmit}>
            <label className="field">
              <span>Cocugun Adi</span>
              <input
                type="text"
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="field">
              <span>TC Kimlik No</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={profileForm.nationalId}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    nationalId: event.target.value.replace(/\D/g, "").slice(0, 11),
                  }))
                }
                required
              />
            </label>

            <label className="field">
              <span>Cinsiyet</span>
              <select
                value={profileForm.gender}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    gender: event.target.value,
                  }))
                }
              >
                <option value="Male">Erkek</option>
                <option value="Female">Kiz</option>
                <option value="Other">Diger</option>
              </select>
            </label>

            <label className="field">
              <span>Dogum Tarihi</span>
              <input
                type="date"
                value={profileForm.dateOfBirth}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    dateOfBirth: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="field field-full">
              <span>Ulke</span>
              <select
                value={profileForm.country}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    country: event.target.value,
                  }))
                }
              >
                {COUNTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="field field-full">
              <button type="submit" className="button button-secondary" disabled={savingProfile}>
                {savingProfile ? "Kaydediliyor..." : "Profili Kaydet"}
              </button>
            </div>
          </form>
        </section>

        <MeasurementForm
          title="Yeni olcum ekle"
          values={measurementForm}
          onChange={handleMeasurementChange}
          onPreview={handlePreview}
          onSubmit={handleMeasurementSubmit}
          previewing={previewing}
          submitting={submitting}
          submitLabel="Hesapla ve Kaydet"
          previewLabel="Sonucu Onizle"
        />
      </div>

      <MeasurementResultCard result={result} title="Son olcum sonucu" />

      <MeasurementChart
        measurements={history}
        title="Olcum egisi"
        description="Kayitlar zaman sirasiyla gosterilir."
      />

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
            emptyText="Ilk kayittan sonra burada listelenecek."
          />
        ) : (
          <EmptyState
            title="Bu profil icin olcum yok"
            description="Yeni hesaplama girdiginizde gecmis otomatik olusur."
          />
        )}
      </section>
    </div>
  );
}
