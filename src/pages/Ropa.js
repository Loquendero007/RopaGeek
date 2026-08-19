import {
  useNavigate
} from "react-router-dom";

import { useEffect, useState } from "react";

import { supabase } from "../supabase";
import { DisplayStars, getProductRating } from "./ProductComments";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { CATEGORY_COLORS, getCatColor, mapProduct } from "../utils/constants";

const CATEGORIES = [
  { key: "todos", label: "Todos", icon: "🔥" },
  { key: "camisetas", label: "Camisetas", icon: "👕" },
  { key: "sudaderas", label: "Sudaderas", icon: "🧥" },
  { key: "pantalones", label: "Pantalones", icon: "👖" },
  { key: "zapatos", label: "Zapatos", icon: "👟" },
  { key: "gorras", label: "Gorras", icon: "🧢" }
];

const styles = {
  page: {
    backgroundColor: "var(--bg-primary)",
    minHeight: "100vh",
    color: "var(--text-primary)",
    fontFamily: "'Inter', sans-serif"
  },
  categoriesBar: {
    display: "flex",
    gap: "10px",
    padding: "24px 40px 16px",
    overflowX: "auto",
    justifyContent: "center",
    flexWrap: "wrap",
    borderBottom: "1px solid var(--border-color)"
  },
  categoryPill: (active, color) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 22px",
    borderRadius: "50px",
    border: `1.5px solid ${active ? color : "var(--border-color)"}`,
    backgroundColor: active ? `${color}15` : "transparent",
    color: active ? color : "var(--text-secondary)",
    fontWeight: active ? 600 : 400,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.25s ease",
    whiteSpace: "nowrap"
  }),
  contentLayout: {
    display: "flex",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "24px 40px 60px",
    gap: "30px"
  },
  sidebar: {
    width: "240px",
    flexShrink: 0,
    position: "sticky",
    top: "94px",
    alignSelf: "flex-start"
  },
  sidebarCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "var(--radius-lg)",
    border: "2px solid #000",
    padding: "20px"
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "16px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  sidebarItem: (active, color) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "2px solid #000",
    backgroundColor: active ? "#00d4ff" : "transparent",
    color: active ? "#000000" : "var(--text-secondary)",
    fontWeight: active ? 600 : 400,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    textAlign: "left",
    marginBottom: "8px"
  }),
  sidebarCount: {
    marginLeft: "auto",
    fontSize: "12px",
    color: "var(--text-muted)",
    backgroundColor: "var(--bg-input)",
    padding: "2px 8px",
    borderRadius: "20px"
  },
  mainContent: {
    flex: 1,
    minWidth: 0
  },
  resultsInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  resultCount: {
    color: "var(--text-secondary)",
    fontSize: "14px"
  },
  sortSelect: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-input)",
    color: "var(--text-primary)",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer"
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px"
  },
  productCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    border: "1px solid var(--border-color)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    animation: "fadeInUp 0.5s ease forwards"
  },
  productImage: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
    transition: "transform 0.4s ease",
    display: "block"
  },
  favBtn: (active) => ({
    position: "absolute",
    top: "12px",
    left: "12px",
    background: active ? "rgba(41,128,185,0.2)" : "rgba(0,0,0,0.4)",
    border: "none",
    cursor: "pointer",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: active ? "#2980b9" : "#fff",
    backdropFilter: "blur(8px)",
    transition: "all 0.2s",
    zIndex: 2
  }),
  badge: (bg) => ({
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: bg,
    color: "#000",
    padding: "5px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    zIndex: 2
  }),
  productInfo: {
    padding: "14px 16px 18px"
  },
  productRating: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "6px"
  },
  ratingCount: {
    color: "var(--text-muted)",
    fontSize: "12px"
  },
  productName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "8px",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },
  sizesContainer: {
    display: "flex",
    gap: "6px",
    marginBottom: "12px",
    flexWrap: "wrap"
  },
  sizeTag: {
    backgroundColor: "var(--bg-input)",
    border: "1px solid var(--border-color)",
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: 500
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "14px"
  },
  currentPrice: (color) => ({
    fontSize: "20px",
    fontWeight: 800,
    color: color || "var(--text-primary)"
  }),
  detailsBtn: (color) => ({
    width: "100%",
    padding: "10px",
    backgroundColor: color || "#fff",
    color: "#000",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  }),
  detailsBtnDisabled: {
    width: "100%",
    padding: "10px",
    backgroundColor: "var(--border-color)",
    color: "var(--text-muted)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "not-allowed",
    textTransform: "uppercase"
  },
  skeletonCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    border: "1px solid var(--border-color)"
  },
  skeletonImage: {
    width: "100%",
    height: "260px",
    background: "linear-gradient(90deg, var(--bg-card) 25%, #222 50%, var(--bg-card) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite"
  },
  skeletonText: (width) => ({
    height: "12px",
    width: width,
    borderRadius: "6px",
    margin: "10px 16px",
    background: "linear-gradient(90deg, var(--bg-card) 25%, #222 50%, var(--bg-card) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite"
  }),
  noResults: {
    textAlign: "center",
    gridColumn: "1/-1",
    padding: "80px 0",
    color: "var(--text-muted)"
  },
  footer: {
    borderTop: "1px solid var(--border-color)",
    padding: "30px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "13px"
  }
};

export default function Ropa() {
  const navigate = useNavigate();
  const { user: loginUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    if (loginUser) {
      const saved = JSON.parse(localStorage.getItem(`favorites_${loginUser.id}`)) || [];
      setFavorites(saved);
    }
  }, [loginUser]);

  const toggleFavorite = (productId) => {
    const userId = loginUser?.id;
    if (!userId) return;
    const key = `favorites_${userId}`;
    let updated;
    if (favorites.includes(productId)) {
      updated = favorites.filter((id) => id !== productId);
    } else {
      updated = [...favorites, productId];
    }
    setFavorites(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    const loadProducts = async () => {
      setTimeout(async () => {
        const { data: prendasData } = await supabase
          .from("prendas")
          .select("*")
          .order("created_at", { ascending: false });

        const dynamicProducts = (prendasData || []).map(mapProduct);

        setProducts(dynamicProducts);
        setLoading(false);
      }, 800);
    };
    loadProducts();
  }, []);

  const getCategoryCount = (catKey) => {
    if (catKey === "todos") return products.length;
    return products.filter(p => p.category === catKey).length;
  };

  const parsePrice = (priceStr) => {
    const cleaned = String(priceStr).replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  };

  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = filter.length === 0 || filter.includes(p.category);
      const matchesSearch = searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = maxPrice === "" || parsePrice(p.price) <= parseFloat(maxPrice);
      const matchesStock = stockFilter === "all" ||
        (stockFilter === "inStock" && !p.agotada) ||
        (stockFilter === "outOfStock" && p.agotada);
      return matchesCategory && matchesSearch && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return parsePrice(a.price) - parsePrice(b.price);
      if (sortBy === "price-high") return parsePrice(b.price) - parsePrice(a.price);
      return 0;
    });

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .ropa-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.5); border-color: var(--border-hover); }
        .ropa-card:hover .ropa-img { transform: scale(1.05); }
        .ropa-card:hover .ropa-details-btn { opacity: 1; transform: translateY(0); }
        .ropa-search:focus { border-color: #555 !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.05); }
        .ropa-fav:hover { transform: scale(1.15); }
        .ropa-nav-link:hover { color: #fff !important; background: rgba(255,255,255,0.05) !important; }
        .ropa-cart:hover { background: rgba(255,255,255,0.08); }
        .ropa-cat-pill:hover { border-color: var(--border-hover) !important; color: #fff !important; }
        .ropa-details-btn { opacity: 0.9; transform: translateY(2px); }
        .ropa-details-btn:hover { filter: brightness(1.1); transform: translateY(0) !important; }
        .sidebar-item:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      {/* NAVBAR */}
      <Navbar user={loginUser} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activePage="ropa" />

      {/* CONTENT */}
      <div style={styles.contentLayout}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Filtros</h3>
            {CATEGORIES.map((cat) => {
              const color = cat.key === "todos" ? "#000000" : CATEGORY_COLORS[cat.key];
              const count = getCategoryCount(cat.key);
              const active = cat.key === "todos" ? filter.length === 0 : filter.includes(cat.key);
              return (
                <button
                  key={cat.key}
                  className="sidebar-item"
                  onClick={() => {
                    if (cat.key === "todos") {
                      setFilter([]);
                    } else {
                      setFilter((prev) =>
                        prev.includes(cat.key)
                          ? prev.filter((k) => k !== cat.key)
                          : [...prev, cat.key]
                      );
                    }
                  }}
                  style={styles.sidebarItem(active, color)}
                >
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "4px",
                    border: "2px solid " + (active ? "#000000" : "var(--text-secondary)"),
                    backgroundColor: active ? "#000000" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.2s"
                  }}>
                    {active && <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 700 }}>✓</span>}
                  </div>
                  {cat.label}
                  <span style={styles.sidebarCount}>{count}</span>
                </button>
              );
            })}

            <div style={{ borderTop: "2px solid #000", margin: "16px 0", paddingTop: "16px" }}>
              <h3 style={{ ...styles.sidebarTitle, marginBottom: "10px", fontSize: "13px" }}>Precio máximo</h3>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 700 }}>$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={7}
                  placeholder="Sin límite"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setMaxPrice(val.length > 7 ? val.slice(0, 7) : val);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 10px 8px 24px",
                    borderRadius: "8px",
                    border: "2px solid #000",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              {maxPrice && (
                <button
                  onClick={() => setMaxPrice("")}
                  style={{
                    marginTop: "8px",
                    padding: "5px 10px",
                    borderRadius: "8px",
                    border: "2px solid #000",
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: "11px",
                    cursor: "pointer",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                >
                  Limpiar precio
                </button>
              )}
            </div>

            <div style={{ borderTop: "2px solid #000", margin: "16px 0", paddingTop: "16px" }}>
              <h3 style={{ ...styles.sidebarTitle, marginBottom: "10px", fontSize: "13px" }}>Disponibilidad</h3>
              {[
                { key: "all", label: "Todos" },
                { key: "inStock", label: "En stock" },
                { key: "outOfStock", label: "Agotados" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  className="sidebar-item"
                  onClick={() => setStockFilter(opt.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 14px", borderRadius: "10px",
                    border: "2px solid #000",
                    backgroundColor: stockFilter === opt.key ? "#00d4ff" : "transparent",
                    color: stockFilter === opt.key ? "#000000" : "var(--text-secondary)",
                    fontWeight: stockFilter === opt.key ? 600 : 400,
                    fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
                    width: "100%", textAlign: "left", marginBottom: "8px"
                  }}
                >
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "4px",
                    border: "2px solid " + (stockFilter === opt.key ? "#000000" : "var(--text-secondary)"),
                    backgroundColor: stockFilter === opt.key ? "#000000" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.2s"
                  }}>
                    {stockFilter === opt.key && <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 700 }}>✓</span>}
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={styles.mainContent}>
          <div style={styles.resultsInfo}>
            <span style={styles.resultCount}>
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="newest">Más recientes</option>
              <option value="price-low">Menor precio</option>
              <option value="price-high">Mayor precio</option>
            </select>
          </div>

          {loading ? (
            <div style={styles.productGrid}>
              {[1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} style={styles.skeletonCard}>
                  <div style={styles.skeletonImage} />
                  <div style={styles.skeletonText("60%")} />
                  <div style={styles.skeletonText("40%")} />
                  <div style={{ padding: "0 16px 16px" }}>
                    <div style={{ ...styles.skeletonText("100%"), margin: 0, height: "34px" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.productGrid}>
              {filteredProducts.map((product) => {
                const catColor = getCatColor(product.category);
                const r = getProductRating(product.id);
                return (
                  <div
                    key={product.id}
                    className="ropa-card"
                    style={styles.productCard}
                    onClick={() => handleViewDetails(product.id)}
                  >
                    <div style={{ overflow: "hidden", position: "relative" }}>
                      <img
                        className="ropa-img"
                        src={product.image}
                        alt={product.name}
                        style={styles.productImage}
                      />

                      {loginUser && (
                        <button
                          className="ropa-fav"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                          style={styles.favBtn(favorites.includes(product.id))}
                        >
                          {favorites.includes(product.id) ? "★" : "☆"}
                        </button>
                      )}

                      {product.agotada ? (
                        <div style={styles.badge("var(--danger)")}>Agotado</div>
                      ) : (
                        <div style={styles.badge(catColor)}>
                          {product.category}
                        </div>
                      )}
                    </div>

                    <div style={styles.productInfo}>
                      {r.count > 0 && (
                        <div style={styles.productRating}>
                          <DisplayStars rating={r.avg} size={12} />
                          <span style={styles.ratingCount}>({r.count})</span>
                        </div>
                      )}

                      <h3 style={styles.productName}>{product.name}</h3>

                      {product.sizes && product.sizes.length > 0 && (
                        <div style={styles.sizesContainer}>
                          {product.sizes.slice(0, 4).map((size) => (
                            <span key={size} style={styles.sizeTag}>{size}</span>
                          ))}
                          {product.sizes.length > 4 && (
                            <span style={styles.sizeTag}>+{product.sizes.length - 4}</span>
                          )}
                        </div>
                      )}

                      <div style={styles.priceContainer}>
                        <span style={styles.currentPrice(catColor)}>
                          {product.price}
                        </span>
                      </div>

                      <button
                        className="ropa-details-btn"
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(product.id); }}
                        disabled={product.agotada}
                        style={product.agotada ? styles.detailsBtnDisabled : styles.detailsBtn(catColor)}
                      >
                        {product.agotada ? "Agotado" : "Ver detalles →"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div style={styles.noResults}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                  <p style={{ fontSize: "18px" }}>No se encontraron prendas</p>
                  <button
                    onClick={() => { setFilter([]); setSearchQuery(""); }}
                    style={{
                      marginTop: "16px",
                      padding: "10px 24px",
                      borderRadius: "10px",
    border: "2px solid #000000",
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer style={styles.footer}>
        © 2026 @Rogeek
      </footer>
    </div>
  );
}
