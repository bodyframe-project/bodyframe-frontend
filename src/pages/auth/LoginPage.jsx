import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { profile } = await signIn(form);
      const fallbackRoute = profile?.role === "Doctor" ? "/app/patients" : "/app";
      const from = location.state?.from?.pathname;
      navigate(from && from.startsWith("/app") ? from : fallbackRoute, {
        replace: true,
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
          <p className="eyebrow">Giris</p>
          <h2>BodyFrame hesabina giris yap</h2>
        </div>
        <p className="section-copy">
          Kayitli olcumlerini, grafiklerini ve doktor akislarini tek panelden ac.
        </p>
      </div>

      {location.state?.notice ? (
        <InlineMessage tone="success">{location.state.notice}</InlineMessage>
      ) : null}

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
            placeholder="ornek@bodyframe.app"
            required
          />
        </label>

        <label className="field">
          <span>Sifre</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Sifrenizi girin"
            required
          />
        </label>

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Giris yapiliyor..." : "Giris Yap"}
        </button>
      </form>

      <div className="split-links">
        <Link to="/forgot-password">Sifremi unuttum</Link>
        <Link to="/verify-email">E-posta dogrula</Link>
      </div>
    </div>
  );
}
