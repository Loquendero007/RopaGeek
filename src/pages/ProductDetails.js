import { useParams, Link } from "react-router-dom";

import { useState, useEffect } from "react";

import { supabase } from "../supabase";
import ProductComments from "./ProductComments";
import { DisplayStars, getProductRating } from "./ProductComments";
import { useCart } from "../CartContext";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { getCatColor, mapProduct } from "../utils/constants";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user: loginUser } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    if (loginUser) {
      const saved = JSON.parse(localStorage.getItem(`favorites_${loginUser.id}`)) || [];
      setFavorites(saved);
    }
  }, [loginUser]);

  useEffect(() => {
    const fetchDynamic = async () => {
      const { data: prendasData } = await supabase
        .from("prendas")
        .select("*")
        .order("created_at", { ascending: false });
      const mapped = (prendasData || []).map(mapProduct);
      setDynamicProducts(mapped);
    };
    fetchDynamic();
  }, []);

  const toggleFavorite = () => {
    const userId = loginUser?.id;
    if (!userId) return;
    const key = `favorites_${userId}`;
    const productId = product.id;
    let updated;
    if (favorites.includes(productId)) {
      updated = favorites.filter((id) => id !== productId);
    } else {
      updated = [...favorites, productId];
    }
    setFavorites(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const product = dynamicProducts.find(
    (p) => p.id === parseInt(id)
  );

  if (!product) {
    return (
      <div style={{
        backgroundColor: "var(--bg-primary)",
        minHeight: "100vh",
        color: "var(--text-primary)",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", marginBottom: "16px" }}>Producto no encontrado</h1>
          <Link to="/ropa" style={{ color: "var(--text-secondary)", textDecoration: "underline", fontSize: "16px" }}>Volver a Ropa</Link>
        </div>
      </div>
    );
  }

  const catColor = getCatColor(product.category);

  return (
    <div style={{
      backgroundColor: "var(--bg-primary)",
      minHeight: "100vh",
      color: "var(--text-primary)",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style>{`
        .fav-btn-detail:hover { transform: scale(1.2); }
        .back-btn:hover { border-color: #555; background: var(--bg-card-hover); }
        .thumb-btn:hover { border-color: #555 !important; }
        .size-tag:hover { border-color: #555; }
      `}</style>

      {/* NAVBAR */}
      <Navbar user={loginUser} activePage="ropa" />

      {/* CONTENT */}
      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>

        <Link to="/ropa" style={{ textDecoration: "none", display: "inline-block", marginBottom: "30px" }}>
          <button className="back-btn" style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
            padding: "10px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.2s"
          }}>
            ← Volver
          </button>
        </Link>

        <div style={{
          display: "flex",
          gap: "50px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start"
        }}>

          {/* IMAGEN */}
          <div>
            <img
              src={selectedImage || product.image}
              alt={product.name}
              style={{
                width: "480px",
                maxWidth: "100%",
                borderRadius: "16px",
                objectFit: "cover",
                border: "1px solid var(--border-color)"
              }}
            />
            {product.extraImages && product.extraImages.length > 0 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                <button
                  className="thumb-btn"
                  onClick={() => setSelectedImage(null)}
                  style={{
                    width: "68px", height: "68px", borderRadius: "10px", overflow: "hidden",
                    border: !selectedImage ? `2px solid ${catColor}` : "1px solid var(--border-color)",
                    cursor: "pointer", padding: 0, background: "none", transition: "border 0.2s"
                  }}
                >
                  <img src={product.image} alt="Principal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
                {product.extraImages.map((url, i) => (
                  <button
                    key={i}
                    className="thumb-btn"
                    onClick={() => setSelectedImage(url)}
                    style={{
                      width: "68px", height: "68px", borderRadius: "10px", overflow: "hidden",
                      border: selectedImage === url ? `2px solid ${catColor}` : "1px solid var(--border-color)",
                      cursor: "pointer", padding: 0, background: "none", transition: "border 0.2s"
                    }}
                  >
                    <img src={url} alt={`Extra ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETALLES */}
          <div style={{ maxWidth: "500px", flex: 1, minWidth: "280px" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
              <h1 style={{ fontSize: "32px", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {product.name}
              </h1>
              {loginUser && (
                <button className="fav-btn-detail" onClick={toggleFavorite}
                  style={{
                    background: favorites.includes(product.id) ? "rgba(41,128,185,0.2)" : "var(--bg-card)",
                    border: `1px solid ${favorites.includes(product.id) ? "#2980b9" : "var(--border-color)"}`,
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "22px",
                    color: favorites.includes(product.id) ? "#2980b9" : "var(--text-muted)",
                    padding: "6px 12px",
                    transition: "all 0.2s"
                  }}>
                  {favorites.includes(product.id) ? "★" : "☆"}
                </button>
              )}
            </div>

            {product.category && (
              <span style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "6px",
                backgroundColor: `${catColor}20`,
                color: catColor,
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "16px"
              }}>
                {product.category}
              </span>
            )}

            <h2 style={{
              color: catColor,
              marginBottom: "10px",
              fontSize: "30px",
              fontWeight: 800
            }}>
              {product.price}
            </h2>

            {product.cantidad > 0 ? (
              <p style={{ color: "#22c55e", fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
                ✓ {product.cantidad} disponibles
              </p>
            ) : (
              <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
                Sin stock
              </p>
            )}

            {(() => { const r = getProductRating(product.id); return r.count > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <DisplayStars rating={r.avg} size={18} />
                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>({r.count} calificaciones)</span>
              </div>
            ) : null; })()}

            <p style={{
              color: "var(--text-secondary)",
              lineHeight: "1.8",
              marginBottom: "28px",
              fontSize: "15px"
            }}>
              {product.description}
            </p>

            <h3 style={{ marginBottom: "14px", fontSize: "16px", fontWeight: 700 }}>
              Tallas disponibles
            </h3>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
              {product.sizes.map((size) => (
                <button key={size} onClick={() => setSelectedSize(size)} style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "2px solid #000",
                  backgroundColor: selectedSize === size ? "#00d4ff" : "transparent",
                  color: selectedSize === size ? "#000" : "var(--text-primary)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}>
                  {size}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!selectedSize && product.sizes.length > 0) {
                  alert("Selecciona una talla");
                  return;
                }
                addToCart(product, selectedSize || product.sizes[0] || "Unitalla");
              }}
              disabled={product.agotada || product.cantidad <= 0}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: product.agotada || product.cantidad <= 0 ? "#555" : "#00d4ff",
                color: product.agotada || product.cantidad <= 0 ? "#999" : "#000",
                border: "none",
                borderRadius: "12px",
                fontWeight: 700,
                cursor: product.agotada || product.cantidad <= 0 ? "not-allowed" : "pointer",
                fontSize: "16px",
                marginBottom: "30px"
              }}
            >
              {product.agotada || product.cantidad <= 0 ? "Agotado" : "Agregar al carrito 🛒"}
            </button>

          </div>

        </div>

        <div style={{ marginTop: "50px" }}>
          <ProductComments productId={product.id} />
        </div>

      </div>

    </div>
  );
}
