import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { authService } from "../../services/authService";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: location.state?.email ?? searchParams.get("email") ?? "",
    code: "",
    newPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(location.state?.notice ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await authService.resetPassword(form);
      navigate("/login", {
        replace: true,
        state: {
          notice: response.message ?? "Sifre basariyla guncellendi.",
        },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Yeni Sifre</p>
          <h2>Sifreyi kod ile yenile</h2>
        </div>
        <p className="section-copy">
          E-postana gelen 6 haneli kodu girip yeni sifreni kaydet.
        </p>
      </div>

      {message ? <InlineMessage tone="success">{message}</InlineMessage> : null}
      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>E-posta</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            required
          />
        </label>

        <label className="field">
          <span>Kod</span>
          <input
            type="text"
            value={form.code}
            onChange={(event) =>
              setForm((current) => ({ ...current, code: event.target.value }))
            }
            placeholder="6 haneli kod"
            required
          />
        </label>

        <label className="field">
          <span>Yeni Sifre</span>
          <input
            type="password"
            value={form.newPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                newPassword: event.target.value,
              }))
            }
            placeholder="Yeni sifreniz"
            required
          />
        </label>

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Guncelleniyor..." : "Sifreyi Guncelle"}
        </button>
      </form>

      <div className="split-links">
        <Link to="/forgot-password">Kodu tekrar iste</Link>
        <Link to="/login">Giris ekranina don</Link>
      </div>
    </div>
  );
}
