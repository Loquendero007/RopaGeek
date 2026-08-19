import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { mapProduct } from "../utils/constants";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      const saved = JSON.parse(localStorage.getItem(`favorites_${user.id}`)) || [];
      setFavorites(saved);
    }
  }, [user]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (favorites.length === 0) {
        setFavoriteProducts([]);
        return;
      }
      const { data: prendasData } = await supabase
        .from("prendas")
        .select("*")
        .order("created_at", { ascending: false });
      const dynamicProducts = (prendasData || []).map(mapProduct);
      const allProducts = dynamicProducts;
      setFavoriteProducts(allProducts.filter((p) => favorites.includes(p.id)));
    };
    loadFavorites();
  }, [favorites]);

  const toggleFavorite = (productId) => {
    const key = `favorites_${user.id}`;
    let updated;
    if (favorites.includes(productId)) {
      updated = favorites.filter((id) => id !== productId);
    } else {
      updated = [...favorites, productId];
    }
    setFavorites(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
      <Navbar user={user} activePage="perfil" />

      <div style={{ padding: "50px 40px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "40px" }}>Mi Cuenta</h1>

        <div style={{
          backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "20px",
          padding: "40px", marginBottom: "40px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "25px", marginBottom: "25px" }}>
            <div style={{
              width: "70px", height: "70px", borderRadius: "50%",
              backgroundColor: "#e0e0e0", border: "1px solid #e0e0e0",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px"
            }}>
              👤
            </div>
            <div>
              <h2 style={{ color: "#000000", marginBottom: "4px", fontSize: "22px" }}>{user.name}</h2>
              <p style={{ color: "#666666", fontSize: "14px" }}>{user.email}</p>
            </div>
          </div>
          <span style={{
            backgroundColor: "#ffffff", border: `1px solid ${user.role === "owner" ? "#8e44ad" : user.role === "admin" ? "#2980b9" : "#ddd"}`,
            borderRadius: "8px", padding: "5px 14px", fontSize: "13px",
            color: user.role === "owner" ? "#8e44ad" : user.role === "admin" ? "#2980b9" : "#555",
            display: "inline-block", fontWeight: 700
          }}>
            {user.role === "owner" ? "Owner" : user.role === "admin" ? "Administrador" : "Usuario"}
          </span>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "20px" }}>Mis Favoritos ★</h2>
          {favoriteProducts.length === 0 ? (
            <div style={{
              backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "16px",
              padding: "40px", textAlign: "center"
            }}>
              <p style={{ color: "#999999", fontSize: "16px", marginBottom: "10px" }}>Aún no tienes prendas favoritas.</p>
              <Link to="/ropa" style={{ color: "#000000", fontWeight: 700, textDecoration: "underline", fontSize: "15px" }}>
                Ir a la tienda →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              {favoriteProducts.map((product) => (
                <div key={product.id} style={{ backgroundColor: "#ffffff", borderRadius: "14px", overflow: "hidden", border: "1px solid #e0e0e0", position: "relative" }}>
                  <img src={product.image} alt={product.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  <button onClick={() => toggleFavorite(product.id)}
                    style={{ position: "absolute", top: "10px", left: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "24px", color: "#2980b9", textShadow: "0 0 6px rgba(41,128,185,0.5)" }}>
                    ★
                  </button>
                  {product.agotada && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "#e74c3c", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                      Agotado
                    </div>
                  )}
                  <div style={{ padding: "16px" }}>
                    <h3 style={{ color: "#000000", fontSize: "16px", marginBottom: "4px" }}>{product.name}</h3>
                    <p style={{ color: "#333333", fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}>{product.price}</p>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                      <button style={{ width: "100%", padding: "10px", backgroundColor: "#00d4ff", color: "#000", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
                        VER DETALLES
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(user.role === "admin" || user.role === "owner") && (
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "20px" }}>Panel de Administración</h2>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <Link to="/nueva-prenda" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
                <div style={{
                  backgroundColor: "var(--bg-card)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: "16px",
                  padding: "30px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s"
                }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>👕</div>
                  <h3 style={{ color: "#ffffff", marginBottom: "5px", fontSize: "16px" }}>Nueva Prenda</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Agregar prendas al catálogo</p>
                </div>
              </Link>
              <Link to="/lista" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
                <div style={{
                  backgroundColor: "var(--bg-card)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: "16px",
                  padding: "30px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s"
                }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>📋</div>
                  <h3 style={{ color: "#ffffff", marginBottom: "5px", fontSize: "16px" }}>Lista de Prendas</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Gestionar prendas existentes</p>
                </div>
              </Link>
              {user.role === "owner" && (
                <Link to="/usuarios" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
                  <div style={{
                    backgroundColor: "var(--bg-card)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: "16px",
                    padding: "30px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s"
                  }}>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>👥</div>
                    <h3 style={{ color: "#ffffff", marginBottom: "5px", fontSize: "16px" }}>Usuarios</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Gestionar roles y usuarios</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: "40px", display: "flex", gap: "15px" }}>
          <Link to="/" style={{ textDecoration: "none", flex: 1 }}>
            <button style={{
              width: "100%", padding: "16px", backgroundColor: "#00d4ff", color: "#000",
              border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "16px"
            }}>
              Volver al Inicio
            </button>
          </Link>
          <button onClick={handleLogout} style={{
            padding: "16px 30px", backgroundColor: "transparent", color: "#ff4757",
            border: "2px solid #ff4757", borderRadius: "12px", fontWeight: 700,
            cursor: "pointer", fontSize: "16px"
          }}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
