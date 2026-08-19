import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { formatPrice } from "../utils/constants";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
      <Navbar user={user} activePage="carrito" />

      <div style={{ padding: "50px 40px", maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "32px" }}>Mi Carrito</h1>

        {cart.length === 0 ? (
          <div style={{
            backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "16px",
            padding: "60px", textAlign: "center"
          }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>🛒</div>
            <p style={{ color: "#666666", fontSize: "18px", marginBottom: "20px" }}>Tu carrito está vacío</p>
            <Link to="/ropa" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "14px 32px", backgroundColor: "#00d4ff", color: "#000",
                border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "16px"
              }}>
                Ir a la tienda →
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

            {/* IZQUIERDA: prendas */}
            <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "12px" }}>
              {cart.map((item) => (
                <div key={item.key} style={{
                  backgroundColor: "#ffffff", border: "1px solid #e0e0e0",
                  borderRadius: "14px", padding: "20px 24px",
                  display: "flex", alignItems: "center", gap: "20px"
                }}>
                  <img src={item.image} alt={item.name} style={{
                    width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px"
                  }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: "#000000", fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>{item.name}</h3>
                    <p style={{ color: "#666666", fontSize: "13px", margin: 0 }}>Talla: {item.size} · {item.category}</p>
                    <p style={{ color: "#000000", fontWeight: 700, fontSize: "15px", margin: "6px 0 0" }}>{formatPrice(item.price)}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        border: "1px solid #e0e0e0", backgroundColor: "#ffffff",
                        color: "#000000", fontWeight: 700, cursor: "pointer", fontSize: "16px"
                      }}
                    >−</button>
                    <span style={{ color: "#000000", fontWeight: 700, fontSize: "16px", minWidth: "24px", textAlign: "center" }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        border: "1px solid #e0e0e0", backgroundColor: "#ffffff",
                        color: "#000000", fontWeight: 700, cursor: "pointer", fontSize: "16px"
                      }}
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.key)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#e74c3c", fontSize: "20px", padding: "4px 8px"
                    }}
                  >✕</button>
                </div>
              ))}

              <div style={{
                backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "14px",
                padding: "24px", textAlign: "center", marginTop: "4px"
              }}>
                <p style={{ color: "#666666", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
                  Por ahora manejamos envíos por todo <strong style={{ color: "#000000" }}>Morelia, Michoacán</strong>, esperamos pronto poder llevar nuestras prendas a todos lados de México 🇲🇽
                </p>
              </div>
            </div>

            {/* DERECHA: resumen */}
            <div style={{
              flex: 1, backgroundColor: "#ffffff", border: "1px solid #e0e0e0",
              borderRadius: "16px", padding: "30px", position: "sticky", top: "90px"
            }}>
              <h3 style={{ color: "#000000", fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Resumen del pedido</h3>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#666666", fontSize: "14px" }}>Productos</span>
                <span style={{ color: "#000000", fontWeight: 700, fontSize: "14px" }}>{formatPrice(totalPrice)}</span>
              </div>

              <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "16px", marginTop: "12px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#000000", fontWeight: 700, fontSize: "20px" }}>Total</span>
                <span style={{ color: "#000000", fontWeight: 700, fontSize: "20px" }}>{formatPrice(totalPrice)}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
                <button
                  onClick={() => {
                    if (!user) {
                      setShowLoginModal(true);
                      return;
                    }
                    const name = user.name;
                    let msg = `*Hola, soy ${name} y quisiera pedir:*\n\n`;
                    cart.forEach((item) => {
                      const price = formatPrice(item.price);
                      msg += `• ${item.name} (Talla: ${item.size}) x${item.quantity} - ${price}\n`;
                    });
                    msg += `\n*Total: ${formatPrice(totalPrice)}*`;
                    const encoded = encodeURIComponent(msg);
                    window.open(`https://wa.me/5216531037700?text=${encoded}`, "_blank");
                  }}
                  style={{
                    width: "100%", padding: "14px", backgroundColor: "#00d4ff",
                    color: "#000", border: "none", borderRadius: "12px",
                    fontWeight: 700, cursor: "pointer", fontSize: "15px"
                  }}
                >
                  {user ? "Pedir por WhatsApp" : "Inicia sesión para pedir"}
                </button>
                <button
                  onClick={clearCart}
                  style={{
                    width: "100%", padding: "14px", backgroundColor: "transparent",
                    color: "#e74c3c", border: "2px solid #e74c3c", borderRadius: "12px",
                    fontWeight: 700, cursor: "pointer", fontSize: "15px"
                  }}
                >
                  Vaciar carrito
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 9999,
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#1a1a1a", border: "2px solid #333",
              borderRadius: "16px", padding: "40px", maxWidth: "420px",
              width: "90%", textAlign: "center"
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <img src="/Logo.png" alt="Logo" style={{ width: "140px", height: "140px", objectFit: "contain" }} />
            </div>
            <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
              Necesita crearse una cuenta para realizar este pedido
            </h3>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{
                  flex: 1, padding: "12px", backgroundColor: "transparent",
                  color: "#ffffff", border: "2px solid #555", borderRadius: "10px",
                  fontWeight: 700, cursor: "pointer", fontSize: "14px"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => navigate("/login")}
                style={{
                  flex: 1, padding: "12px", backgroundColor: "#00d4ff",
                  color: "#000", border: "none", borderRadius: "10px",
                  fontWeight: 700, cursor: "pointer", fontSize: "14px"
                }}
              >
                Crear/Logear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
