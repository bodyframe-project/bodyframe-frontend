import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../lib/formatters";

function HeaderNavLink({ item, onNavigate }) {
  if (item.href) {
    return (
      <a href={item.href} className="site-nav-link" onClick={onNavigate}>
        {item.label}
      </a>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `site-nav-link${isActive ? " active" : ""}`
      }
      onClick={onNavigate}
    >
      {item.label}
    </NavLink>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M8.5 3a5.5 5.5 0 1 0 3.46 9.77l3.63 3.63 1.41-1.41-3.63-3.63A5.5 5.5 0 0 0 8.5 3Zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SiteHeader({ links = [], className = "", variant = "default" }) {
  const { isAuthenticated, profile, session, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const role = profile?.role ?? session?.role;
  const displayName =
    [profile?.name, profile?.lastName].filter(Boolean).join(" ") || "Hesabim";
  const searchResults = links.filter(
    (item) =>
      item.to &&
      query.trim() &&
      item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }

      if (!searchRef.current?.contains(event.target)) {
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <header className={`site-header ${className}`.trim()}>
      <Link to="/" className="site-brand">
        <span className="site-brand-mark">BF</span>
        <span className="site-brand-copy">
          <strong>BodyFrame</strong>
          <small>Olcum takip sistemi</small>
        </span>
      </Link>

      {variant === "app" ? (
        <div className="site-search-shell" ref={searchRef}>
          <label className="site-search-field" aria-label="Sayfa arama">
            <span className="site-search-icon">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Sayfa ara"
            />
          </label>

          {query.trim() ? (
            <div className="site-search-results">
              {searchResults.length ? (
                searchResults.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="site-search-result"
                    onClick={() => setQuery("")}
                  >
                    <strong>{item.label}</strong>
                    {item.description ? <small>{item.description}</small> : null}
                  </Link>
                ))
              ) : (
                <div className="site-search-empty">Eslesen sayfa bulunamadi.</div>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <nav className="site-nav" aria-label="Ana menu">
          {links.map((item) => (
            <HeaderNavLink
              key={`${item.label}-${item.to ?? item.href ?? "link"}`}
              item={item}
              onNavigate={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      )}

      <div className="site-actions">
        {isAuthenticated ? (
          <>
            <div className="account-menu-shell" ref={menuRef}>
              <button
                type="button"
                className="account-trigger"
                onClick={() => setMenuOpen((current) => !current)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="account-avatar">
                  {getInitials(profile?.name, profile?.lastName)}
                </span>
                <span className="account-copy">
                  <small>
                    {role === "Admin"
                      ? "Admin"
                      : role === "Doctor"
                        ? "Doktor"
                        : "Kullanici"}
                  </small>
                  <strong>{displayName}</strong>
                </span>
              </button>

              {menuOpen ? (
                <div className="account-menu" role="menu">
                  <Link
                    to="/app/profile"
                    className="account-menu-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profil ayarlari
                  </Link>
                  <Link
                    to="/app"
                    className="account-menu-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Olcum paneli
                  </Link>
                  {role === "User" ? (
                    <Link
                      to="/app/children"
                      className="account-menu-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      Cocuklarim
                    </Link>
                  ) : null}
                  {role === "Admin" ? (
                    <Link
                      to="/app/admin"
                      className="account-menu-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      Kullanicilar
                    </Link>
                  ) : null}
                  {role === "Doctor" ? (
                    <Link
                      to="/app/patients"
                      className="account-menu-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      Hastalar
                    </Link>
                  ) : null}
                  <Link
                    to="/calculator"
                    className="account-menu-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Genel hesaplayici
                  </Link>
                  <button
                    type="button"
                    className="account-menu-link danger"
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                    }}
                  >
                    Cikis yap
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="site-text-action">
              Giris yap
            </Link>
            <Link to="/register" className="button small">
              Kayit ol
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
