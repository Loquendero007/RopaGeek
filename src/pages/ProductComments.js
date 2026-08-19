import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";

function DisplayStars({ rating, size }) {
  const s = size || 16;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fillFull = rating >= i;
    const fillHalf = rating >= i - 0.5 && rating < i;
    stars.push(
      <span key={i} style={{ position: "relative", display: "inline-block", width: s + 2, height: s + 2 }}>
        <span style={{ position: "absolute", left: 0, top: 0, fontSize: s + 2, lineHeight: 1, color: "#ccc" }}>★</span>
        {fillFull && (
          <span style={{ position: "absolute", left: 0, top: 0, fontSize: s + 2, lineHeight: 1, color: "#2980b9" }}>★</span>
        )}
        {fillHalf && (
          <span style={{ position: "absolute", left: 0, top: 0, fontSize: s + 2, lineHeight: 1, color: "#2980b9", clipPath: "inset(0 50% 0 0)" }}>★</span>
        )}
      </span>
    );
  }
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>{stars}</span>;
}

function StarRating({ rating, onRate, disabled, size }) {
  const s = size || 22;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fillHalf = rating >= i - 0.5 && rating < i;
    const fillFull = rating >= i;
    stars.push(
      <span key={i} style={{ position: "relative", display: "inline-block", width: s + 4, height: s + 4, cursor: disabled ? "default" : "pointer" }}>
        <span style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", zIndex: 2 }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.parentElement.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => !disabled && (e.currentTarget.parentElement.style.transform = "scale(1)")}
          onClick={() => !disabled && onRate && onRate(i - 0.5)} />
        <span style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", zIndex: 2 }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.parentElement.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => !disabled && (e.currentTarget.parentElement.style.transform = "scale(1)")}
          onClick={() => !disabled && onRate && onRate(i)} />
        <span style={{
          position: "absolute", left: 0, top: 0, fontSize: s + 4, lineHeight: 1,
          color: fillFull || fillHalf ? "#2980b9" : "#ccc",
          pointerEvents: "none"
        }}>★</span>
        {fillHalf && (
          <span style={{
            position: "absolute", left: 0, top: 0, fontSize: s + 4, lineHeight: 1,
            color: "#2980b9", clipPath: "inset(0 50% 0 0)", pointerEvents: "none"
          }}>★</span>
        )}
      </span>
    );
  }
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>{stars}</span>;
}

function getProductRating(productId) {
  const ratings = JSON.parse(localStorage.getItem(`product_ratings_${productId}`)) || [];
  if (ratings.length === 0) return { avg: 0, count: 0 };
  const avg = ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;
  return { avg, count: ratings.length };
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export { DisplayStars, getProductRating };

export default function ProductComments({ productId }) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [hasRatedToday, setHasRatedToday] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`product_ratings_${productId}`)) || [];
    setRatings(stored);
  }, [productId]);

  useEffect(() => {
    if (!user) return;
    const key = `product_rating_${productId}_${user.id}`;
    const data = JSON.parse(localStorage.getItem(key));
    if (data && data.date === getTodayKey()) {
      setHasRatedToday(true);
      setNewRating(data.rating);
    } else {
      setHasRatedToday(false);
      setNewRating(0);
    }
  }, [user, productId]);

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length)
    : 0;

  const handleRate = () => {
    if (!user) {
      setMessage({ text: "Debes iniciar sesión para calificar.", type: "error" });
      return;
    }
    if (hasRatedToday) {
      setMessage({ text: "Ya calificaste hoy. Intenta mañana.", type: "error" });
      return;
    }
    if (newRating === 0) {
      setMessage({ text: "Selecciona una calificación.", type: "error" });
      return;
    }

    const ratingEntry = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      rating: newRating,
      date: new Date().toLocaleString("es-MX")
    };

    const updated = [ratingEntry, ...ratings];
    setRatings(updated);
    localStorage.setItem(`product_ratings_${productId}`, JSON.stringify(updated));
    localStorage.setItem(`product_rating_${productId}_${user.id}`, JSON.stringify({ rating: newRating, date: getTodayKey() }));

    setHasRatedToday(true);
    setMessage({ text: "Calificación enviada.", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  return (
    <div style={{ backgroundColor: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: "16px", padding: "30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "24px", color: "black", margin: 0 }}>Calificación</h2>
        {ratings.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DisplayStars rating={avgRating} size={18} />
            <span style={{ color: "#999", fontSize: "13px" }}>({ratings.length})</span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        {user ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ color: "#555", fontSize: "14px", fontWeight: "bold" }}>Tu calificación:</span>
              <StarRating rating={newRating} onRate={hasRatedToday ? null : setNewRating} disabled={hasRatedToday} size={24} />
              {!hasRatedToday && newRating > 0 && (
                <button
                  onClick={handleRate}
                  style={{
                    padding: "8px 20px", backgroundColor: "black", color: "white",
                    border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px"
                  }}
                >
                  Calificar
                </button>
              )}
            </div>
            {hasRatedToday && (
              <p style={{ color: "#999", fontSize: "13px", marginTop: "8px" }}>Ya calificaste hoy. Vuelve mañana.</p>
            )}
          </>
        ) : (
          <p style={{ color: "#999", fontSize: "15px", textAlign: "center", padding: "10px" }}>
            Inicia sesión para calificar.
          </p>
        )}
        {message.text && (
          <p style={{
            marginTop: "10px", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold",
            backgroundColor: message.type === "error" ? "#fdecea" : "#e8f5e9",
            color: message.type === "error" ? "#c0392b" : "#27ae60"
          }}>
            {message.text}
          </p>
        )}
      </div>

      {ratings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {ratings.slice(0, 20).map((r) => (
            <div key={r.id} style={{ backgroundColor: "white", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>👤</div>
                <span style={{ fontWeight: "bold", color: "black", fontSize: "14px" }}>{r.userName}</span>
                <DisplayStars rating={r.rating} size={13} />
              </div>
              <span style={{ color: "#999", fontSize: "12px" }}>{r.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
