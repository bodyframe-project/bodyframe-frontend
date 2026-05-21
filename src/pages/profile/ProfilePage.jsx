import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { StatCard } from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { calculateAge, toInputDate, translateGender } from "../../lib/formatters";
import { userService } from "../../services/userService";

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, refreshProfile, afterPasswordChange } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: "",
    lastName: "",
    nationalId: "",
    gender: "Male",
    dateOfBirth: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) {
      return;
    }

    setProfileForm({
      name: profile.name ?? "",
      lastName: profile.lastName ?? "",
      nationalId: profile.nationalId ?? "",
      gender: profile.gender ?? "Male",
      dateOfBirth: toInputDate(profile.dateOfBirth),
    });
  }, [profile]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSavingProfile(true);
    setMessage("");
    setError("");

    try {
      await userService.updateProfile({
        ...profileForm,
        dateOfBirth: profileForm.dateOfBirth || null,
        lastName: profileForm.lastName || null,
        nationalId: profileForm.nationalId || null,
      });
      await refreshProfile();
      setMessage("Profil bilgileri guncellendi.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setSavingPassword(true);
    setMessage("");
    setError("");

    try {
      const response = await userService.changePassword(passwordForm);
      await afterPasswordChange();
      navigate("/login", {
        replace: true,
        state: {
          notice: response.message ?? "Sifre degistirildi. Tekrar giris yapin.",
        },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="page-stack">
      {message ? <InlineMessage tone="success">{message}</InlineMessage> : null}
      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <section className="stat-grid">
        <StatCard label="Rol" value={profile?.role ?? "-"} />
        <StatCard
          label="Yas"
          value={profile?.dateOfBirth ? calculateAge(profile.dateOfBirth) : "-"}
        />
        <StatCard
          label="Cinsiyet"
          value={translateGender(profile?.gender)}
          tone="highlight"
        />
      </section>

      <div className="content-grid">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Profil</p>
              <h3>Hesap bilgilerini duzenle</h3>
            </div>
          </div>

          <form className="stack-form" onSubmit={handleProfileSubmit}>
            <div className="dual-grid">
              <label className="field">
                <span>Ad</span>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Soyad</span>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="dual-grid">
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
                />
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
                />
              </label>
            </div>

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
                <option value="Female">Kadin</option>
                <option value="Other">Diger</option>
              </select>
            </label>

            <button type="submit" className="button" disabled={savingProfile}>
              {savingProfile ? "Kaydediliyor..." : "Profili Kaydet"}
            </button>
          </form>
        </section>

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Guvenlik</p>
              <h3>Sifre degistir</h3>
            </div>
          </div>

          <form className="stack-form" onSubmit={handlePasswordSubmit}>
            <label className="field">
              <span>Mevcut Sifre</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Yeni Sifre</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
              />
            </label>

            <button type="submit" className="button button-secondary" disabled={savingPassword}>
              {savingPassword ? "Guncelleniyor..." : "Sifreyi Guncelle"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
