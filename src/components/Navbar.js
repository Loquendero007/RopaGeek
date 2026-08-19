import { Link } from "react-router-dom";
import { useCart } from "../CartContext";

export default function Navbar({ user, searchQuery, setSearchQuery, activePage, extraLinks }) {
  const { totalItems } = useCart();

  const navLinkStyle = (active) => ({
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: active ? 600 : 400,
    fontSize: "14px",
    padding: "8px 18px",
    borderRadius: "10px",
    backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
    transition: "all 0.2s ease"
  });

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", height: "70px",
      position: "sticky", top: 0, backgroundColor: "rgba(10, 10, 10, 0.95)",
      backdropFilter: "blur(20px)", zIndex: 1000,
      borderBottom: "1px solid var(--border-color)"
    }}>
      <Link to="/"><img src="/logofrontal.png" alt="Logo" style={{ width: "130px", objectFit: "contain", cursor: "pointer", filter: "brightness(1.1)" }} /></Link>

      {searchQuery !== undefined && (
        <div style={{ flex: 1, maxWidth: "520px", margin: "0 40px", position: "relative" }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{
              width: "100%", padding: "12px 20px",
              borderRadius: "12px", border: "1px solid var(--border-color)",
              backgroundColor: "#ffffff", color: "#000000", fontSize: "14px", outline: "none",
              transition: "all 0.3s ease"
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <Link to="/" className="nav-link" style={navLinkStyle(activePage === "inicio")}>Inicio</Link>
        <Link to="/ropa" className="nav-link" style={navLinkStyle(activePage === "ropa")}>Ropa</Link>
        <Link to="/contact" className="nav-link" style={navLinkStyle(activePage === "contacto")}>Contacto</Link>
        {extraLinks && extraLinks.map((link) => (
          <Link key={link.to} to={link.to} className="nav-link" style={navLinkStyle(activePage === link.key)}>{link.label}</Link>
        ))}
        {user?.role === "owner" && !extraLinks?.some(l => l.to === "/usuarios") && (
          <Link to="/usuarios" className="nav-link" style={navLinkStyle(activePage === "usuarios")}>Usuarios</Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link to="/carrito" style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "12px",
            border: "2px solid #00d4ff", backgroundColor: "#00d4ff",
            color: "#000000", cursor: "pointer", fontSize: "14px"
          }}>
            <span style={{ fontSize: "18px" }}>🛒</span>
            <span style={{ fontWeight: 700, fontSize: "13px" }}>{totalItems}</span>
          </div>
        </Link>
        <Link to={user ? "/profile" : "/login"} style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 18px", borderRadius: "12px",
            border: "1px solid var(--border-color)", backgroundColor: "#ffffff",
            color: "#000000", cursor: "pointer", fontSize: "14px", transition: "all 0.2s"
          }}>
            <span style={{ fontSize: "18px" }}>👤</span>
            <span style={{ fontWeight: 600, fontSize: "13px" }}>{user ? user.name : "Iniciar sesión"}</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
