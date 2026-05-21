import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SiteHeader } from "./SiteHeader";

export function AppLayout() {
  const { profile, session, signOut } = useAuth();
  const role = profile?.role ?? session?.role;

  const links = [
    {
      to: "/app",
      label: "Genel Bakis",
      description: "Trendler ve son olcumler",
      shortLabel: "GB",
      end: true,
    },
    {
      to: "/app/profile",
      label: "Profil",
      description: "Hesap ayarlari",
      shortLabel: "PR",
    },
    {
      to: "/calculator",
      label: "Hesaplayici",
      description: "Genel hesap alani",
      shortLabel: "HS",
    },
  ];

  if (role === "Admin") {
    links.splice(1, 0, {
      to: "/app/admin",
      label: "Kullanicilar",
      description: "Yonetim paneli",
      shortLabel: "YN",
    });
  }

  if (role === "Doctor") {
    links.splice(1, 0, {
      to: "/app/patients",
      label: "Hastalar",
      description: "Takip ve atama",
      shortLabel: "HT",
    });
  }

  if (role === "User") {
    links.splice(1, 0, {
      to: "/app/children",
      label: "Cocuklarim",
      description: "Cocuk profilleri ve olcumler",
      shortLabel: "CK",
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">ERU</div>
          <div>
            <strong>BodyFrame</strong>
            <p>Erciyes Universitesi</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Uygulama menusu">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-link-mark">{link.shortLabel}</span>
              <span className="sidebar-link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="button button-ghost sidebar-signout" onClick={signOut}>
          Cikis Yap
        </button>
      </aside>

      <main className="page-shell">
        <SiteHeader
          variant="app"
          className="site-header-app"
          links={links}
        />

        <Outlet />
      </main>
    </div>
  );
}
