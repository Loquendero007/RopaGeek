import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

export default function Usuarios() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsuarios = async () => {
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .order("email", { ascending: true });
    setUsuarios(data || []);
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "owner")) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user && user.role === "owner") {
      fetchUsuarios();
    }
  }, [user]);

  const changeRole = async (userId, newRole) => {
    await supabase
      .from("usuarios")
      .update({ rol: newRole })
      .eq("id", userId);
    await fetchUsuarios();
  };

  const roleLabel = (rol) => {
    if (rol === "owner") return "Owner";
    if (rol === "admin") return "Administrador";
    return "Usuario";
  };

  const roleColor = (rol) => {
    if (rol === "owner") return "#8e44ad";
    if (rol === "admin") return "#2980b9";
    return "#555";
  };

  const filteredUsuarios = usuarios.filter((u) =>
    searchQuery === "" ||
    (u.nombre && u.nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>

      {/* NAVBAR */}
      <Navbar user={user} activePage="usuarios" />

      {/* CONTENT */}
      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "24px" }}>Gestionar Usuarios</h1>

        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%", padding: "14px 20px", marginBottom: "28px",
            borderRadius: "12px", border: "1px solid #e0e0e0",
            backgroundColor: "#ffffff", color: "#000000", fontSize: "15px", outline: "none",
            boxSizing: "border-box"
          }}
        />

        {filteredUsuarios.length === 0 ? (
          <div style={{
            backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "16px",
            padding: "50px", textAlign: "center"
          }}>
            <p style={{ color: "#999999", fontSize: "16px" }}>
              {usuarios.length === 0 ? "No hay usuarios registrados." : "No se encontraron usuarios."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredUsuarios.map((u) => (
              <div key={u.id} style={{
                backgroundColor: "#ffffff", border: "1px solid #e0e0e0",
                borderRadius: "14px", padding: "20px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "15px",
                transition: "border-color 0.2s"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "46px", height: "46px", borderRadius: "50%",
                    backgroundColor: "#e0e0e0", border: "1px solid #e0e0e0",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "20px"
                  }}>
                    👤
                  </div>
                  <div>
                    <p style={{ color: "#000000", fontWeight: 700, fontSize: "15px", margin: 0 }}>{u.nombre}</p>
                    <p style={{ color: "#666666", fontSize: "13px", margin: 0 }}>{u.email}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{
                    backgroundColor: "transparent", border: `2px solid ${roleColor(u.rol)}`,
                    borderRadius: "8px", padding: "5px 14px", fontSize: "13px",
                    color: roleColor(u.rol), fontWeight: 700
                  }}>
                    {roleLabel(u.rol)}
                  </span>

                  <select
                    value={u.rol}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    style={{
                      padding: "8px 12px", borderRadius: "8px", border: "2px solid #000",
                      backgroundColor: "var(--bg-input)", color: "var(--text-primary)", fontSize: "13px",
                      cursor: "pointer", outline: "none"
                    }}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
