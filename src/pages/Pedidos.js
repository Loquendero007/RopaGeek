import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

export default function Pedidos() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "owner"))) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "owner")) {
      const fetchPedidos = async () => {
        const { data: orders } = await supabase
          .from("pedidos")
          .select("*")
          .order("created_at", { ascending: false });
        setPedidos(orders || []);
      };
      fetchPedidos();
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
      <Navbar user={user} activePage="pedidos" extraLinks={[{to: "/pedidos", label: "Pedidos", key: "pedidos"}]} />

      <div style={{ padding: "50px 50px", maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "40px", color: "#000000" }}>Todos los Pedidos</h1>

        {pedidos.length === 0 ? (
          <div style={{
            backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "16px",
            padding: "50px", textAlign: "center"
          }}>
            <p style={{ color: "#999999", fontSize: "16px" }}>No hay pedidos registrados aún.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {pedidos.map((pedido) => (
              <div key={pedido.id} style={{
                backgroundColor: "#ffffff", border: "1px solid #e0e0e0",
                borderRadius: "16px", padding: "24px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <span style={{ color: "#666", fontSize: "14px" }}>Pedido #{pedido.id}</span>
                    <span style={{ color: "#999", fontSize: "14px", marginLeft: "15px" }}>{pedido.fecha}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#000000", fontWeight: 700, fontSize: "14px" }}>{pedido.usuario_nombre}</p>
                    <p style={{ color: "#666666", fontSize: "13px" }}>{pedido.usuario_email}</p>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "15px" }}>
                  {(pedido.items || []).map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "15px",
                      padding: "10px 0", borderTop: i > 0 ? "1px solid #eee" : "none"
                    }}>
                      <img src={item.image} alt={item.name} style={{
                        width: "55px", height: "55px", objectFit: "cover", borderRadius: "10px"
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#000000", fontWeight: 700, fontSize: "14px" }}>{item.name}</p>
                        <p style={{ color: "#666666", fontSize: "13px" }}>Talla: {item.size}</p>
                      </div>
                      <span style={{ color: "#333", fontWeight: "bold" }}>{item.price}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #e0e0e0",
                  textAlign: "right"
                }}>
                  <span style={{ color: "#000000", fontWeight: 700, fontSize: "18px" }}>
                    Total: ${pedido.total} MXN
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
