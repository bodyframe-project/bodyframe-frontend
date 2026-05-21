import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

const initialForm = {
  name: "",
  lastName: "",
  email: "",
  nationalId: "",
  password: "",
  gender: "Male",
  dateOfBirth: "",
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { handleRegistrationResult } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        dateOfBirth: form.dateOfBirth || null,
        lastName: form.lastName || null,
        nationalId: form.nationalId,
      };

      const response = await authService.register(payload);
      handleRegistrationResult(response, form.email);
      setMessage(response.message ?? "Kayit olusturuldu.");
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, {
        state: {
          notice: response.message,
          email: form.email,
        },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card wide">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Kayit</p>
          <h2>Yeni BodyFrame hesabi olustur</h2>
        </div>
      </div>

      {message ? <InlineMessage tone="success">{message}</InlineMessage> : null}
      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <form className="stack-form" onSubmit={handleSubmit}>
        <div className="dual-grid">
          <label className="field">
            <span>Ad</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Adiniz"
              required
            />
          </label>

          <label className="field">
            <span>Soyad</span>
            <input
              type="text"
              value={form.lastName}
              onChange={(event) =>
                setForm((current) => ({ ...current, lastName: event.target.value }))
              }
              placeholder="Soyadiniz"
            />
          </label>
        </div>

        <div className="dual-grid">
          <label className="field">
            <span>E-posta</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="ornek@bodyframe.app"
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
        </div>

        <div className="dual-grid">
          <label className="field">
            <span>Sifre</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Guclu bir sifre sec"
              required
            />
          </label>

          <label className="field">
            <span>Cinsiyet</span>
            <select
              value={form.gender}
              onChange={(event) =>
                setForm((current) => ({ ...current, gender: event.target.value }))
              }
            >
              <option value="Male">Erkek</option>
              <option value="Female">Kadin</option>
              <option value="Other">Diger</option>
            </select>
          </label>
        </div>

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
          />
        </label>

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Kayit olusturuluyor..." : "Kayit Ol"}
        </button>
      </form>

      <div className="split-links">
        <span>Zaten hesabin var mi?</span>
        <Link to="/login">Giris yap</Link>
      </div>
    </div>
  );
}
