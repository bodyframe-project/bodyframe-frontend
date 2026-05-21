import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { formatDate, translateGender } from "../../lib/formatters";
import { doctorService } from "../../services/doctorService";

const COUNTRY_OPTIONS = ["Turkiye", "Almanya", "Fransa", "Diger"];

function createPatientForm() {
  return {
    childName: "",
    childNationalId: "",
    gender: "Male",
    dateOfBirth: "",
    country: "Turkiye",
  };
}

export function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [familyNationalId, setFamilyNationalId] = useState("");
  const [familyLookup, setFamilyLookup] = useState(null);
  const [searchNationalId, setSearchNationalId] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [patientForm, setPatientForm] = useState(createPatientForm);
  const [loading, setLoading] = useState(true);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [lookingUpFamily, setLookingUpFamily] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyPatientId, setBusyPatientId] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setLoading(true);
    setError("");

    try {
      const myPatients = await doctorService.getMyPatients();
      setPatients(myPatients);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFamilyLookup(event) {
    event.preventDefault();

    if (familyNationalId.trim().length !== 11) {
      setError("Aile hesabini bulmak icin 11 haneli TC girin.");
      return;
    }

    setLookingUpFamily(true);
    setMessage("");
    setError("");

    try {
      const family = await doctorService.lookupFamilyByNationalId(familyNationalId);
      setFamilyLookup(family);
    } catch (lookupError) {
      setFamilyLookup(null);
      setError(lookupError.message);
    } finally {
      setLookingUpFamily(false);
    }
  }

  async function handleCreatePatient(event) {
    event.preventDefault();

    if (!familyLookup) {
      setError("Once aile hesabini TC ile bulun.");
      return;
    }

    setCreatingPatient(true);
    setError("");
    setMessage("");

    try {
      await doctorService.createPatientRecord({
        familyNationalId: familyLookup.nationalId,
        childName: patientForm.childName,
        childNationalId: patientForm.childNationalId,
        gender: patientForm.gender,
        dateOfBirth: patientForm.dateOfBirth,
        country: patientForm.country,
      });
      setPatientForm(createPatientForm());
      setMessage("Cocuk profili aile hesabina baglanarak olusturuldu.");
      await loadPatients();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setCreatingPatient(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();

    if (searchNationalId.trim().length < 3) {
      setSearchResults([]);
      setError("Arama icin en az 3 hane girin.");
      return;
    }

    setSearchingPatients(true);
    setMessage("");
    setError("");

    try {
      const response = await doctorService.searchAvailablePatients(searchNationalId);
      setSearchResults(response);
    } catch (searchError) {
      setSearchResults([]);
      setError(searchError.message);
    } finally {
      setSearchingPatients(false);
    }
  }

  async function handleAssign(patientId) {
    setBusyPatientId(patientId);
    setError("");
    setMessage("");

    try {
      const response = await doctorService.assignPatient(patientId);
      setMessage(response.message ?? "Hasta atandi.");
      setSearchResults((current) => current.filter((item) => item.id !== patientId));
      await loadPatients();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyPatientId("");
    }
  }

  async function handleRemove(patientId) {
    const confirmed = window.confirm(
      "Bu hastayi listenizden cikarmak istiyor musunuz?",
    );
    if (!confirmed) {
      return;
    }

    setBusyPatientId(patientId);
    setError("");
    setMessage("");

    try {
      const response = await doctorService.removePatient(patientId);
      setMessage(response.message ?? "Hasta listeden cikarildi.");
      await loadPatients();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyPatientId("");
    }
  }

  return (
    <div className="page-stack">
      {message ? <InlineMessage tone="success">{message}</InlineMessage> : null}
      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <section className="stat-grid">
        <StatCard label="Aktif Hasta" value={loading ? "..." : patients.length} />
        <StatCard
          label="Cocuk Profili"
          value={loading ? "..." : patients.filter((item) => item.isDependentProfile).length}
        />
        <StatCard
          label="Toplam Olcum"
          value={
            loading
              ? "..."
              : patients.reduce(
                  (total, patient) => total + patient.totalMeasurements,
                  0,
                )
          }
          tone="highlight"
        />
      </section>

      <div className="content-grid admin-top-grid">
        <section className="surface-card patient-search-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Aile Hesabi</p>
              <h3>TC ile cocuk bagla</h3>
            </div>
          </div>

          <form className="patient-search-row" onSubmit={handleFamilyLookup}>
            <label className="patient-search-input">
              <input
                type="search"
                inputMode="numeric"
                maxLength={11}
                value={familyNationalId}
                onChange={(event) => {
                  setFamilyNationalId(event.target.value.replace(/\D/g, "").slice(0, 11));
                  setFamilyLookup(null);
                }}
                placeholder="Aile hesabinin TC numarasi"
              />
            </label>
            <button type="submit" className="button button-secondary">
              {lookingUpFamily ? "Araniyor..." : "Bul"}
            </button>
          </form>

          {familyLookup ? (
            <div className="list-row">
              <div>
                <strong>{familyLookup.name}</strong>
                <p>
                  TC: {familyLookup.nationalId} / {familyLookup.email}
                </p>
              </div>
            </div>
          ) : null}

          <form className="form-grid" onSubmit={handleCreatePatient}>
            <div className="field field-full">
              <span>Cinsiyet</span>
              <div className="segmented-control doctor-segmented">
                <button
                  type="button"
                  className={patientForm.gender === "Male" ? "active" : ""}
                  onClick={() =>
                    setPatientForm((current) => ({
                      ...current,
                      gender: "Male",
                    }))
                  }
                >
                  Erkek
                </button>
                <button
                  type="button"
                  className={patientForm.gender === "Female" ? "active" : ""}
                  onClick={() =>
                    setPatientForm((current) => ({
                      ...current,
                      gender: "Female",
                    }))
                  }
                >
                  Kiz
                </button>
              </div>
            </div>

            <label className="field">
              <span>Cocugun Adi</span>
              <input
                type="text"
                value={patientForm.childName}
                onChange={(event) =>
                  setPatientForm((current) => ({
                    ...current,
                    childName: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="field">
              <span>Cocugun TC No</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={patientForm.childNationalId}
                onChange={(event) =>
                  setPatientForm((current) => ({
                    ...current,
                    childNationalId: event.target.value.replace(/\D/g, "").slice(0, 11),
                  }))
                }
                required
              />
            </label>

            <label className="field">
              <span>Dogum Tarihi</span>
              <input
                type="date"
                value={patientForm.dateOfBirth}
                onChange={(event) =>
                  setPatientForm((current) => ({
                    ...current,
                    dateOfBirth: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="field">
              <span>Ulke</span>
              <select
                value={patientForm.country}
                onChange={(event) =>
                  setPatientForm((current) => ({
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
              <button
                type="submit"
                className="button button-success"
                disabled={creatingPatient}
              >
                {creatingPatient ? "Olusturuluyor..." : "Cocuk Kaydini Ac"}
              </button>
            </div>
          </form>
        </section>

        <section className="surface-card patient-search-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Hasta Arama</p>
              <h3>TC ile mevcut kayit bul</h3>
            </div>
          </div>

          <form className="patient-search-row" onSubmit={handleSearch}>
            <label className="patient-search-input">
              <input
                type="search"
                inputMode="numeric"
                maxLength={11}
                value={searchNationalId}
                onChange={(event) =>
                  setSearchNationalId(event.target.value.replace(/\D/g, "").slice(0, 11))
                }
                placeholder="Cocuk, anne veya aile bireyi TC"
              />
            </label>
            <button type="submit" className="button button-secondary">
              {searchingPatients ? "Araniyor..." : "Ara"}
            </button>
          </form>

          {!searchResults.length ? (
            <div className="patient-search-hint">
              TC ile aradiginiz kisiyi veya bagli cocuk profilini burada goreceksiniz.
            </div>
          ) : (
            <div className="list-stack">
              {searchResults.map((patient) => (
                <div className="list-row" key={patient.id}>
                  <div>
                    <strong>{patient.name}</strong>
                    <p>
                      TC: {patient.nationalId ?? "-"} / {translateGender(patient.gender)}
                      {patient.isDependentProfile
                        ? ` / Aile: ${patient.parentDisplayName ?? "-"}`
                        : patient.email
                          ? ` / ${patient.email}`
                          : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => handleAssign(patient.id)}
                    disabled={busyPatientId === patient.id}
                  >
                    Ata
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Hasta Listesi</p>
            <h3>Takipteki hastalar</h3>
          </div>
        </div>

        {loading ? (
          <div className="screen-loader inline">Hasta listesi yukleniyor...</div>
        ) : !patients.length ? (
          <EmptyState
            title="Henuz hasta kaydi yok"
            description="Atanan veya aileye baglanan kayitlar burada gosterilir."
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table patients-table">
              <thead>
                <tr>
                  <th>Hasta</th>
                  <th>TC / Bag</th>
                  <th>Olcum</th>
                  <th>Durum</th>
                  <th>Son Tarih</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.patientId}>
                    <td>
                      <strong>{patient.name}</strong>
                      <div className="table-subcopy">
                        {translateGender(patient.gender)} / {patient.age} yas
                      </div>
                    </td>
                    <td>
                      <div>TC: {patient.nationalId ?? "-"}</div>
                      <div className="table-subcopy">
                        {patient.isDependentProfile
                          ? `Aile: ${patient.parentDisplayName ?? "-"} / ${patient.parentNationalId ?? "-"}`
                          : patient.email ?? "-"}
                      </div>
                    </td>
                    <td>{patient.totalMeasurements}</td>
                    <td>
                      <StatusPill value={patient.lastFrameCategory ?? "Kayit yok"} />
                    </td>
                    <td>{formatDate(patient.lastMeasurementDate)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="button button-secondary small"
                          onClick={() =>
                            navigate(`/app/patients/${patient.patientId}`, {
                              state: { patient },
                            })
                          }
                        >
                          Detay
                        </button>
                        <button
                          type="button"
                          className="button button-ghost small"
                          onClick={() => handleRemove(patient.patientId)}
                          disabled={busyPatientId === patient.patientId}
                        >
                          Cikar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
