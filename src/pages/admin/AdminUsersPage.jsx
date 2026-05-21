import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { StatCard } from "../../components/ui/StatCard";
import { formatDate, toInputDate, translateRole } from "../../lib/formatters";
import { userService } from "../../services/userService";

const COUNTRY_OPTIONS = ["Turkiye", "Almanya", "Fransa", "Diger"];

function createDoctorForm() {
  return {
    name: "",
    lastName: "",
    email: "",
    nationalId: "",
    password: "",
    gender: "Other",
    dateOfBirth: "",
  };
}

function createEditForm(user) {
  if (!user) {
    return {
      name: "",
      lastName: "",
      motherName: "",
      country: "Turkiye",
      email: "",
      nationalId: "",
      gender: "Other",
      dateOfBirth: "",
      role: "User",
      emailVerified: false,
    };
  }

  return {
    name: user.name ?? "",
    lastName: user.lastName ?? "",
    motherName: user.motherName ?? "",
    country: user.country ?? "Turkiye",
    email: user.email ?? "",
    nationalId: user.nationalId ?? "",
    gender: user.gender ?? "Other",
    dateOfBirth: toInputDate(user.dateOfBirth),
    role: user.role ?? "User",
    emailVerified: Boolean(user.emailVerified),
  };
}

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [doctorForm, setDoctorForm] = useState(createDoctorForm);
  const [editForm, setEditForm] = useState(createEditForm());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [
        user.name,
        user.lastName,
        user.email,
        user.nationalId,
        user.motherName,
        user.country,
        user.role,
        user.parentDisplayName,
        user.parentNationalId,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [search, users]);

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const totalDoctors = users.filter((user) => user.role === "Doctor").length;
  const totalPatientRecords = users.filter(
    (user) => user.isDependentProfile,
  ).length;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId && users.length) {
      setSelectedUserId(users[0].id);
      return;
    }

    if (selectedUser) {
      setEditForm(createEditForm(selectedUser));
    }
  }, [selectedUser, selectedUserId, users]);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await userService.getUsers();
      setUsers(response);

      if (!selectedUserId && response.length) {
        setSelectedUserId(response[0].id);
      }
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDoctor(event) {
    event.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");

    try {
      await userService.createUser({
        ...doctorForm,
        lastName: doctorForm.lastName || null,
        dateOfBirth: doctorForm.dateOfBirth || null,
        nationalId: doctorForm.nationalId,
        role: "Doctor",
      });
      setDoctorForm(createDoctorForm());
      setMessage("Doktor hesabi olusturuldu.");
      await loadUsers();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateUser(event) {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await userService.updateUser(selectedUser.id, {
        ...editForm,
        lastName: editForm.lastName || null,
        motherName: editForm.motherName || null,
        country: editForm.country || null,
        nationalId: editForm.nationalId || null,
        dateOfBirth: editForm.dateOfBirth || null,
      });
      setMessage("Kullanici bilgileri guncellendi.");
      await loadUsers();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack admin-shell">
      {message ? <InlineMessage tone="success">{message}</InlineMessage> : null}
      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <section className="stat-grid">
        <StatCard label="Toplam Kullanici" value={loading ? "..." : users.length} />
        <StatCard label="Doktor" value={loading ? "..." : totalDoctors} />
        <StatCard
          label="Hasta Kaydi"
          value={loading ? "..." : totalPatientRecords}
          tone="highlight"
        />
      </section>

      <div className="content-grid admin-top-grid">
        <section className="surface-card admin-section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Doktor Hesabi</p>
              <h3>Yeni doktor ekle</h3>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleCreateDoctor}>
            <label className="field">
              <span>Ad</span>
              <input
                type="text"
                value={doctorForm.name}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="field">
              <span>Soyad</span>
              <input
                type="text"
                value={doctorForm.lastName}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>E-posta</span>
              <input
                type="email"
                value={doctorForm.email}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    email: event.target.value,
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
                value={doctorForm.nationalId}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    nationalId: event.target.value.replace(/\D/g, "").slice(0, 11),
                  }))
                }
                required
              />
            </label>

            <label className="field">
              <span>Gecici Sifre</span>
              <input
                type="password"
                value={doctorForm.password}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="field">
              <span>Cinsiyet</span>
              <select
                value={doctorForm.gender}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    gender: event.target.value,
                  }))
                }
              >
                <option value="Male">Erkek</option>
                <option value="Female">Kadin</option>
                <option value="Other">Diger</option>
              </select>
            </label>

            <label className="field">
              <span>Dogum Tarihi</span>
              <input
                type="date"
                value={doctorForm.dateOfBirth}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    dateOfBirth: event.target.value,
                  }))
                }
              />
            </label>

            <div className="field field-full">
              <button type="submit" className="button" disabled={creating}>
                {creating ? "Olusturuluyor..." : "Doktoru Olustur"}
              </button>
            </div>
          </form>
        </section>

        <section className="surface-card admin-section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Kullanici Duzenle</p>
              <h3>{selectedUser ? selectedUser.name : "Kullanici secin"}</h3>
            </div>
          </div>

          {!selectedUser ? (
            <EmptyState
              title="Duzenlenecek kullanici yok"
              description="Listeden bir kullanici secerek detaylarini guncelleyebilirsiniz."
            />
          ) : (
            <form className="form-grid" onSubmit={handleUpdateUser}>
              <label className="field">
                <span>Ad</span>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="field">
                <span>Soyad</span>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Cinsiyet</span>
                <select
                  value={editForm.gender}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      gender: event.target.value,
                    }))
                  }
                >
                  <option value="Male">Erkek</option>
                  <option value="Female">Kadin</option>
                  <option value="Other">Diger</option>
                </select>
              </label>

              <label className="field">
                <span>TC Kimlik No</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={editForm.nationalId}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      nationalId: event.target.value.replace(/\D/g, "").slice(0, 11),
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Dogum Tarihi</span>
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      dateOfBirth: event.target.value,
                    }))
                  }
                />
              </label>

              {selectedUser.isDependentProfile ? (
                <>
                  <label className="field">
                    <span>Bagli Hesap</span>
                    <input
                      type="text"
                      value={selectedUser.parentDisplayName ?? selectedUser.motherName ?? "-"}
                      disabled
                    />
                  </label>

                  <label className="field">
                    <span>Ulke</span>
                    <select
                      value={editForm.country}
                      onChange={(event) =>
                        setEditForm((current) => ({
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
                </>
              ) : selectedUser.isDoctorManagedPatient ? (
                <>
                  <label className="field">
                    <span>Anne Adi</span>
                    <input
                      type="text"
                      value={editForm.motherName}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          motherName: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="field">
                    <span>Ulke</span>
                    <select
                      value={editForm.country}
                      onChange={(event) =>
                        setEditForm((current) => ({
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
                </>
              ) : (
                <label className="field field-full">
                  <span>E-posta</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              )}

              <label className="field">
                <span>Rol</span>
                <select
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                  disabled={selectedUser.isDependentProfile || selectedUser.isDoctorManagedPatient}
                >
                  <option value="User">Kullanici</option>
                  <option value="Doctor">Doktor</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>

              <label className="field admin-checkbox">
                <span>E-posta Durumu</span>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={editForm.emailVerified}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        emailVerified: event.target.checked,
                      }))
                    }
                  />
                  <strong>
                    {editForm.emailVerified ? "Dogrulandi" : "Bekliyor"}
                  </strong>
                </label>
              </label>

              <div className="field field-full">
                <button type="submit" className="button" disabled={saving}>
                  {saving ? "Kaydediliyor..." : "Degisiklikleri Kaydet"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      <section className="surface-card admin-section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Tum Kullanicilar</p>
            <h3>Kullanici listesi</h3>
          </div>
        </div>

        <div className="patient-search-row">
          <label className="patient-search-input">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ad, TC, e-posta veya rol ile ara"
            />
          </label>
        </div>

        {loading ? (
          <div className="screen-loader inline">Kullanicilar yukleniyor...</div>
        ) : !filteredUsers.length ? (
          <EmptyState
            title="Eslesen kullanici bulunamadi"
            description="Farkli bir arama terimi deneyin."
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table admin-users-table">
              <thead>
                <tr>
                  <th>Kullanici</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Dogum Tarihi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                      <div className="table-subcopy">
                        {user.isDependentProfile
                          ? `Aile: ${user.parentDisplayName ?? "-"} / TC: ${user.nationalId ?? "-"}`
                          : user.isDoctorManagedPatient
                            ? `Anne: ${user.motherName ?? "-"} / ${user.country ?? "-"}`
                            : user.email}
                      </div>
                    </td>
                    <td>{translateRole(user.role)}</td>
                    <td>
                      {user.isDependentProfile
                        ? "Cocuk profili"
                        : user.emailVerified
                          ? "Dogrulandi"
                          : "Bekliyor"}
                    </td>
                    <td>{formatDate(user.dateOfBirth)}</td>
                    <td>
                      <button
                        type="button"
                        className="button button-secondary small"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        Duzenle
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
