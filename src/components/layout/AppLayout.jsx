import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getInitials, translateGender } from "../../lib/formatters";

export function AppLayout() {
  const { profile, session, signOut } = useAuth();

  const links = [
    { to: "/app", label: "Olcum Paneli", end: true },
    { to: "/app/profile", label: "Profil" },
  ];

  if ((profile?.role ?? session?.role) === "Doctor") {
    links.splice(1, 0, { to: "/app/patients", label: "Hastalar" });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">BF</div>
          <div>
            <strong>BodyFrame</strong>
            <p>Olcum ve takip merkezi</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {getInitials(profile?.name, profile?.lastName)}
          </div>
          <div className="profile-copy">
            <strong>
              {profile?.name} {profile?.lastName ?? ""}
            </strong>
            <span>
              {profile?.role ?? session?.role} · {translateGender(profile?.gender)}
            </span>
          </div>
        </div>

        <button type="button" className="button button-ghost" onClick={signOut}>
          Cikis Yap
        </button>
      </aside>

      <main className="page-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">BodyFrame Panel</p>
            <h2>Olcumlerinizi ve akislarinizi tek yerden yonetin</h2>
          </div>
          <div className="page-header-chip">
            {profile?.email ?? "Hesap bilgisi yukleniyor"}
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
