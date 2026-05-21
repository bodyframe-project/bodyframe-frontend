import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { StatCard } from "../../components/ui/StatCard";
import { formatDate, translateGender } from "../../lib/formatters";
import { dependentService } from "../../services/dependentService";

const COUNTRY_OPTIONS = ["Turkiye", "Almanya", "Fransa", "Diger"];

function createChildForm() {
  return {
    name: "",
    nationalId: "",
    gender: "Male",
    dateOfBirth: "",
    country: "Turkiye",
  };
}

export function ChildrenPage() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [form, setForm] = useState(createChildForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    setLoading(true);
    setError("");

    try {
      const response = await dependentService.getDependents();
      setChildren(response);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setCreating(true);
    setMessage("");
    setError("");

    try {
      await dependentService.createDependent({
        ...form,
        dateOfBirth: form.dateOfBirth,
      });
      setForm(createChildForm());
      setMessage("Cocuk profili olusturuldu.");
      await loadChildren();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page-stack">
      {message ? <InlineMessage tone="success">{message}</InlineMessage> : null}
      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <section className="stat-grid">
        <StatCard
          label="Kayitli Cocuk"
          value={loading ? "..." : children.length}
        />
        <StatCard
          label="Doktor Kaydi"
          value={loading ? "..." : children.filter((item) => item.isDoctorManagedPatient).length}
        />
        <StatCard
          label="Aile Kaydi"
          value={loading ? "..." : children.filter((item) => !item.isDoctorManagedPatient).length}
          tone="highlight"
        />
      </section>

      <div className="content-grid admin-top-grid">
        <section className="surface-card patient-search-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Yeni Cocuk</p>
              <h3>Cocuk profili ekle</h3>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field field-full">
              <span>Cinsiyet</span>
              <div className="segmented-control doctor-segmented">
                <button
                  type="button"
                  className={form.gender === "Male" ? "active" : ""}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      gender: "Male",
                    }))
                  }
                >
                  Erkek
                </button>
                <button
                  type="button"
                  className={form.gender === "Female" ? "active" : ""}
                  onClick={() =>
                    setForm((current) => ({
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
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
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
                value={form.nationalId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nationalId: event.target.value.replace(/\D/g, "").slice(0, 11),
                  }))
                }
                placeholder="11 haneli TC"
                required
              />
            </label>

            <label className="field">
              <span>Dogum Tarihi</span>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) =>
                  setForm((current) => ({
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
                value={form.country}
                onChange={(event) =>
                  setForm((current) => ({
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
              <button type="submit" className="button button-success" disabled={creating}>
                {creating ? "Olusturuluyor..." : "Cocugu Kaydet"}
              </button>
            </div>
          </form>
        </section>

        <section className="surface-card patient-search-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Cocuklarim</p>
              <h3>Profiller</h3>
            </div>
          </div>

          {loading ? (
            <div className="screen-loader inline">Cocuk profilleri yukleniyor...</div>
          ) : !children.length ? (
            <EmptyState
              title="Henuz cocuk profili yok"
              description="Ilk kayit sonrasi cocuk olcumleri bu alan uzerinden yonetilebilir."
            />
          ) : (
            <div className="list-stack">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  className="list-row list-row-button"
                  onClick={() =>
                    navigate(`/app/children/${child.id}`, {
                      state: { child },
                    })
                  }
                >
                  <div>
                    <strong>{child.name}</strong>
                    <p>
                      TC: {child.nationalId ?? "-"} / {translateGender(child.gender)} /{" "}
                      {formatDate(child.dateOfBirth)}
                    </p>
                  </div>
                  <span className="button button-secondary small">
                    Detay
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Tum Profiller</p>
            <h3>Cocuk listesi</h3>
          </div>
        </div>

        {loading ? (
          <div className="screen-loader inline">Liste yukleniyor...</div>
        ) : !children.length ? (
          <EmptyState
            title="Liste henuz bos"
            description="Cocuk kaydi eklediginizde burada gosterilecek."
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table patients-table">
              <thead>
                <tr>
                  <th>Cocuk</th>
                  <th>TC</th>
                  <th>Durum</th>
                  <th>Dogum Tarihi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {children.map((child) => (
                  <tr key={child.id}>
                    <td>
                      <strong>{child.name}</strong>
                      <div className="table-subcopy">
                        {translateGender(child.gender)}
                      </div>
                    </td>
                    <td>{child.nationalId ?? "-"}</td>
                    <td>
                      {child.isDoctorManagedPatient ? "Doktor kaydi" : "Aile kaydi"}
                    </td>
                    <td>{formatDate(child.dateOfBirth)}</td>
                    <td>
                      <button
                        type="button"
                        className="button button-secondary small"
                        onClick={() =>
                          navigate(`/app/children/${child.id}`, {
                            state: { child },
                          })
                        }
                      >
                        Ac
                      </button>
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
