import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import {
  formatDate,
  translateGender,
} from "../../lib/formatters";
import { doctorService } from "../../services/doctorService";

export function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyPatientId, setBusyPatientId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [myPatients, available] = await Promise.all([
        doctorService.getMyPatients(),
        doctorService.getAvailablePatients(),
      ]);
      setPatients(myPatients);
      setAvailablePatients(available);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(patientId) {
    setBusyPatientId(patientId);
    setError("");
    setMessage("");

    try {
      const response = await doctorService.assignPatient(patientId);
      setMessage(response.message ?? "Hasta atandi.");
      await loadData();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyPatientId("");
    }
  }

  async function handleRemove(patientId) {
    const confirmed = window.confirm("Bu hastayi listenizden cikarmak istiyor musunuz?");
    if (!confirmed) {
      return;
    }

    setBusyPatientId(patientId);
    setError("");
    setMessage("");

    try {
      const response = await doctorService.removePatient(patientId);
      setMessage(response.message ?? "Hasta listeden cikarildi.");
      await loadData();
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
        <StatCard
          label="Aktif Hasta"
          value={loading ? "..." : patients.length}
          hint="Size atanmis kullanicilar"
        />
        <StatCard
          label="Uygun Hasta"
          value={loading ? "..." : availablePatients.length}
          hint="Atanabilir kullanicilar"
        />
        <StatCard
          label="Toplam Olcum"
          value={
            loading
              ? "..."
              : patients.reduce((total, patient) => total + patient.totalMeasurements, 0)
          }
          hint="Tum hastalarinizdaki kayit sayisi"
          tone="highlight"
        />
      </section>

      <div className="content-grid">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Atanabilir Hastalar</p>
              <h3>Yeni hasta ekle</h3>
            </div>
            <p className="section-copy">
              Doktor panelindeki atama endpoint'i ile dogrudan iliskilendirilir.
            </p>
          </div>

          {!availablePatients.length ? (
            <EmptyState
              title="Su an atanabilir hasta yok"
              description="Tum kullanicilar zaten size atanmis olabilir."
            />
          ) : (
            <div className="list-stack">
              {availablePatients.map((patient) => (
                <div className="list-row" key={patient.id}>
                  <div>
                    <strong>{patient.name}</strong>
                    <p>
                      {patient.email} · {translateGender(patient.gender)}
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

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Hasta Listesi</p>
              <h3>Takip ettigin hastalar</h3>
            </div>
            <p className="section-copy">
              Detay sayfasinda hasta adina olcum ekleyebilir ve gecmisini gorebilirsin.
            </p>
          </div>

          {loading ? (
            <div className="screen-loader inline">Hasta listesi yukleniyor...</div>
          ) : !patients.length ? (
            <EmptyState
              title="Henuz hasta atanmadi"
              description="Saga yeni hasta ekleyerek takip akisina baslayabilirsin."
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hasta</th>
                    <th>Yas</th>
                    <th>Olcum</th>
                    <th>Son Kategori</th>
                    <th>Son Tarih</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.patientId}>
                      <td>
                        <strong>{patient.name}</strong>
                        <div className="table-subcopy">{patient.email}</div>
                      </td>
                      <td>{patient.age}</td>
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
    </div>
  );
}
