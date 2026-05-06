import { NavLink, Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero-badge">BodyFrame</div>
        <h1>Frame index takibini modern ve temiz bir deneyime tasidik.</h1>
        <p>
          Kayit, giris, hesaplama, olcum gecmisi ve doktor-hasta akislarini tek
          panelde yonetin.
        </p>

        <div className="auth-hero-grid">
          <div className="auth-hero-card">
            <span>Hizli giris</span>
            <strong>JWT ve refresh token akisi</strong>
          </div>
          <div className="auth-hero-card">
            <span>Takip paneli</span>
            <strong>Chart.js ile trend analizi</strong>
          </div>
          <div className="auth-hero-card">
            <span>Doktor modu</span>
            <strong>Hasta atama ve olcum takibi</strong>
          </div>
          <div className="auth-hero-card">
            <span>Guvenlik</span>
            <strong>E-posta dogrulama ve sifre sifirlama</strong>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top">
          <NavLink to="/login" className="brand-link">
            BodyFrame
          </NavLink>
          <div className="auth-links">
            <NavLink to="/login">Giris</NavLink>
            <NavLink to="/register">Kayit Ol</NavLink>
          </div>
        </div>

        <Outlet />
      </section>
    </div>
  );
}
