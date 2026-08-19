import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { SIZES_BY_CATEGORY } from "../utils/constants";

export default function Lista() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [prendas, setPrendas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchPrendas = async () => {
    const { data } = await supabase
      .from("prendas")
      .select("*")
      .order("created_at", { ascending: false });
    setPrendas(data || []);
  };

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "owner"))) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "owner")) {
      fetchPrendas();
    }
  }, [user]);

  const toggleStock = async (id, currentStatus) => {
    await supabase
      .from("prendas")
      .update({ agotada: !currentStatus })
      .eq("id", id);
    await fetchPrendas();
  };

  const deletePrenda = async (id) => {
    if (!window.confirm("¿Eliminar esta prenda?")) return;
    await supabase
      .from("prendas")
      .delete()
      .eq("id", id);
    await fetchPrendas();
  };

  const startEdit = (prenda) => {
    setEditingId(prenda.id);
    setEditForm({
      nombre: prenda.nombre,
      precio: prenda.precio,
      descripcion: prenda.descripcion || "",
      categoria: prenda.categoria,
      tallas: prenda.tallas || [],
      cantidad: prenda.cantidad || 0
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    setSaving(true);
    await supabase
      .from("prendas")
      .update({
        nombre: editForm.nombre,
        precio: editForm.precio,
        descripcion: editForm.descripcion,
        categoria: editForm.categoria,
        tallas: editForm.tallas,
        cantidad: parseInt(editForm.cantidad) || 0
      })
      .eq("id", id);
    await fetchPrendas();
    setEditingId(null);
    setEditForm({});
    setSaving(false);
  };

  const toggleEditSize = (size) => {
    setEditForm((prev) => ({
      ...prev,
      tallas: prev.tallas.includes(size)
        ? prev.tallas.filter((s) => s !== size)
        : [...prev.tallas, size]
    }));
  };

  const updateCantidad = async (id, cantidad) => {
    await supabase
      .from("prendas")
      .update({ cantidad: parseInt(cantidad) || 0 })
      .eq("id", id);
    const updated = prendas.map((p) =>
      p.id === id ? { ...p, cantidad: parseInt(cantidad) || 0 } : p
    );
    setPrendas(updated);
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>Cargando prendas...</p>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    backgroundColor: "white",
    color: "black",
    fontSize: "14px",
    boxSizing: "border-box"
  };

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
      <Navbar user={user} activePage="lista" extraLinks={[{to: "/nueva-prenda", label: "Nueva Prenda", key: "nueva-prenda"}, {to: "/lista", label: "Lista", key: "lista"}]} />

      <div style={{ padding: "50px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "40px", color: "#000000" }}>Lista de Prendas</h1>

        {prendas.length === 0 ? (
          <div style={{
            backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "16px",
            padding: "50px", textAlign: "center"
          }}>
            <p style={{ color: "#999999", fontSize: "16px" }}>No hay prendas agregadas aún.</p>
            <Link to="/nueva-prenda" style={{ color: "#000000", fontWeight: 700, textDecoration: "underline", fontSize: "15px" }}>
              Agregar primera prenda
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {prendas.map((prenda) => (
              <div key={prenda.id} style={{
                backgroundColor: prenda.agotada ? "#fef2f2" : "#ffffff",
                border: prenda.agotada ? "1px solid #fca5a5" : "1px solid #e0e0e0",
                borderRadius: "16px", padding: "20px 24px",
                opacity: prenda.agotada ? 0.7 : 1
              }}>
                {editingId === prenda.id ? (
                  <div>
                    <div style={{ display: "flex", gap: "16px", marginBottom: "14px", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "180px" }}>
                        <label style={{ color: "#555", fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Nombre</label>
                        <input value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} style={inputStyle} />
                      </div>
                      <div style={{ flex: 1, minWidth: "120px" }}>
                        <label style={{ color: "#555", fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Precio</label>
                        <input value={editForm.precio} onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })} style={inputStyle} />
                      </div>
                      <div style={{ flex: 1, minWidth: "120px" }}>
                        <label style={{ color: "#555", fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Cantidad</label>
                        <input type="number" min="0" value={editForm.cantidad} onChange={(e) => setEditForm({ ...editForm, cantidad: e.target.value })} style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ color: "#555", fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Descripción</label>
                      <textarea value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ color: "#555", fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Categoría</label>
                      <select value={editForm.categoria} onChange={(e) => { setEditForm({ ...editForm, categoria: e.target.value, tallas: [] }); }} style={inputStyle}>
                        <option value="camisetas">Camisetas</option>
                        <option value="sudaderas">Sudaderas</option>
                        <option value="pantalones">Pantalones</option>
                        <option value="gorras">Gorras</option>
                        <option value="zapatos">Zapatos / Tennis</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ color: "#555", fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Tallas</label>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {(SIZES_BY_CATEGORY[editForm.categoria] || []).map((size) => (
                          <button key={size} type="button" onClick={() => toggleEditSize(size)} style={{
                            padding: "8px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                            border: editForm.tallas.includes(size) ? "2px solid #000" : "1px solid #e0e0e0",
                            backgroundColor: editForm.tallas.includes(size) ? "#000" : "white",
                            color: editForm.tallas.includes(size) ? "white" : "black"
                          }}>
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => saveEdit(prenda.id)} disabled={saving} style={{
                        padding: "10px 20px", borderRadius: "10px", border: "none",
                        backgroundColor: "#2ecc71", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "13px"
                      }}>
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                      <button onClick={cancelEdit} style={{
                        padding: "10px 20px", borderRadius: "10px", border: "1px solid #e0e0e0",
                        backgroundColor: "white", color: "black", fontWeight: 700, cursor: "pointer", fontSize: "13px"
                      }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                    <img src={prenda.imagen} alt={prenda.nombre} style={{
                      width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px"
                    }} />

                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <h3 style={{ color: "#000000", fontSize: "18px", margin: 0 }}>{prenda.nombre}</h3>
                        {prenda.agotada && (
                          <span style={{
                            backgroundColor: "#fecaca", color: "#991b1b", borderRadius: "6px",
                            padding: "2px 10px", fontSize: "12px", fontWeight: "bold"
                          }}>
                            Fuera de stock
                          </span>
                        )}
                      </div>
                      <p style={{ color: "#666", fontSize: "14px", margin: "2px 0" }}>
                        {prenda.precio} · {prenda.categoria}
                      </p>
                      <p style={{ color: "#888", fontSize: "13px", margin: "2px 0" }}>
                        Tallas: {(prenda.tallas || []).join(", ")}
                      </p>
                      <p style={{ color: "#555", fontSize: "13px", margin: "2px 0", fontWeight: "bold" }}>
                        Cantidad: {prenda.cantidad || 0}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "13px", color: "#555" }}>Stock:</span>
                        <input
                          type="number" min="0"
                          defaultValue={prenda.cantidad || 0}
                          onBlur={(e) => updateCantidad(prenda.id, e.target.value)}
                          style={{ width: "60px", padding: "6px 8px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", textAlign: "center" }}
                        />
                      </div>
                      <button
                        onClick={() => startEdit(prenda)}
                        style={{
                          padding: "10px 16px", borderRadius: "10px", border: "none",
                          backgroundColor: "#2980b9", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "13px"
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleStock(prenda.id, prenda.agotada)}
                        style={{
                          padding: "10px 16px", borderRadius: "10px", border: "none",
                          backgroundColor: prenda.agotada ? "#2ecc71" : "#e67e22",
                          color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "13px"
                        }}
                      >
                        {prenda.agotada ? "Poner en stock" : "Sin stock"}
                      </button>
                      <button
                        onClick={() => deletePrenda(prenda.id)}
                        style={{
                          padding: "10px 16px", borderRadius: "10px", border: "none",
                          backgroundColor: "#e74c3c", color: "white", fontWeight: "bold",
                          cursor: "pointer", fontSize: "13px"
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
