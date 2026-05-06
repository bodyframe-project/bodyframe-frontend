import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { InlineMessage } from "../../components/ui/InlineMessage";
import {
  clearPendingEmail,
  getPendingEmail,
  savePendingEmail,
} from "../../lib/session";
import { authService } from "../../services/authService";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialEmail =
    location.state?.email ?? searchParams.get("email") ?? getPendingEmail();
  const [form, setForm] = useState({
    email: initialEmail,
    code: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState(location.state?.notice ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await authService.verifyEmail(form);
      clearPendingEmail();
      navigate("/login", {
        replace: true,
        state: {
          notice: response.message ?? "E-posta dogrulandi. Giris yapabilirsiniz.",
        },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError("");

    try {
      const response = await authService.resendVerification({
        email: form.email,
      });
      savePendingEmail(form.email);
      setMessage(response.message ?? "Dogrulama kodu tekrar gonderildi.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">E-posta Dogrulama</p>
          <h2>6 haneli kod ile hesabini etkinlestir</h2>
        </div>
        <p className="section-copy">
          Kayit tamamlandiysa, panele girebilmek icin e-posta dogrulamasini bitir.
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

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Dogrulaniyor..." : "E-postayi Dogrula"}
        </button>
      </form>

      <div className="split-links">
        <button
          type="button"
          className="inline-button"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? "Tekrar gonderiliyor..." : "Kodu yeniden gonder"}
        </button>
        <Link to="/login">Giris ekranina don</Link>
      </div>
    </div>
  );
}
