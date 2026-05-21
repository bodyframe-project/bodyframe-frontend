import { NavLink, Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <h1>Olcumlerinizi kaydedin, yorumlayin ve takip edin.</h1>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top">
          <NavLink to="/" className="brand-link">
            BodyFrame
          </NavLink>
          <div className="auth-links">
            <NavLink to="/calculator">Hesaplayici</NavLink>
            <NavLink to="/login">Giris</NavLink>
            <NavLink to="/register">Kayit Ol</NavLink>
          </div>
        </div>

        <div className="auth-panel-shell">
          <div className="auth-panel-intro">
            <h2>Hesabiniza girin veya yeni bir profil olusturun</h2>
          </div>

          <Outlet />
        </div>
      </section>
    </div>
  );
}
