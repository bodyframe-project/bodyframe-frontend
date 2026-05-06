import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InlineMessage } from "../../components/ui/InlineMessage";
import { authService } from "../../services/authService";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await authService.forgotPassword({ email });
      setMessage(response.message ?? "Kod talebi alindi.");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`, {
        state: {
          notice: response.message,
          email,
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
          <p className="eyebrow">Sifre Sifirlama</p>
          <h2>Sifreni yenilemek icin kod iste</h2>
        </div>
        <p className="section-copy">
          Sistem e-posta adresi kayitliysa, sana 6 haneli bir sifirlama kodu gonderir.
        </p>
      </div>

      {message ? <InlineMessage tone="success">{message}</InlineMessage> : null}
      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>E-posta</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@bodyframe.app"
            required
          />
        </label>

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Kod isteniyor..." : "Kod Gonder"}
        </button>
      </form>
    </div>
  );
}
