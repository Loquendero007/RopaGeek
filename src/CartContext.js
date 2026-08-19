import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size) => {
    setCart((prev) => {
      const key = `${product.id}_${size}`;
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        if (existing.quantity >= 10) {
          setShowModal(true);
          return prev;
        }
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          size: size || "Unitalla",
          quantity: 1
        }
      ];
    });
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    if (quantity > 10) {
      setShowModal(true);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const price = parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#1a1a1a",
              border: "2px solid #333",
              borderRadius: "16px",
              padding: "40px",
              maxWidth: "420px",
              width: "90%",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>📦</div>
            <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
              Límite de 10 unidades
            </h3>
            <p style={{ color: "#aaaaaa", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
              Si necesita compras mayoristas, hable directamente al número de Contacto
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: "12px 32px",
                backgroundColor: "#00d4ff",
                color: "#000",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}
