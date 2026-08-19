import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import { supabase } from "../supabase";
import { DisplayStars, getProductRating } from "./ProductComments";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { getCatColor, mapProduct } from "../utils/constants";

const BANNERS = ["/banner1.png", "/banner2.png"];

const styles = {
  page: {
    backgroundColor: "var(--bg-primary)",
    minHeight: "100vh",
    color: "var(--text-primary)",
    fontFamily: "'Inter', sans-serif"
  },
  heroCarousel: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto 40px",
    position: "relative",
    overflow: "hidden",
    borderRadius: "16px"
  },
  heroImage: (anim) => ({
    width: "100%",
    height: "380px",
    objectFit: "cover",
    display: "block",
    animation: anim
  }),
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    background: "linear-gradient(transparent, rgba(10,10,10,0.8))",
    pointerEvents: "none"
  },
  carouselBtn: (side) => ({
    position: "absolute",
    top: "50%",
    [side]: "16px",
    transform: "translateY(-50%)",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(10px)",
    color: "#fff",
    fontSize: "22px",
    cursor: "pointer",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  }),
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "24px",
    paddingLeft: "40px"
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
    padding: "0 40px 60px",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  productCard: (color) => ({
    backgroundColor: "var(--bg-card)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    border: "1px solid var(--border-color)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    animation: "fadeInUp 0.5s ease forwards"
  }),
  productImage: {
    width: "100%",
    height: "280px",
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
    color: "#fff",
    padding: "5px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    zIndex: 2
  }),
  productInfo: {
    padding: "16px 18px 20px"
  },
  productRating: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px"
  },
  ratingCount: {
    color: "var(--text-muted)",
    fontSize: "12px"
  },
  productName: {
    fontSize: "15px",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "10px",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "14px"
  },
  currentPrice: (color) => ({
    fontSize: "22px",
    fontWeight: 800,
    color: color || "var(--text-primary)"
  }),
  originalPrice: {
    fontSize: "14px",
    color: "var(--text-muted)",
    textDecoration: "line-through"
  },
  detailsBtn: (color) => ({
    width: "100%",
    padding: "11px",
    backgroundColor: color || "#fff",
    color: "#000",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  }),
  detailsBtnDisabled: {
    width: "100%",
    padding: "11px",
    backgroundColor: "var(--border-color)",
    color: "var(--text-muted)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "not-allowed",
    textTransform: "uppercase"
  },
  contactSection: {
    backgroundColor: "var(--bg-secondary)",
    padding: "60px 20px",
    textAlign: "center",
    borderTop: "1px solid var(--border-color)"
  },
  contactBtn: {
    padding: "14px 36px",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-card)",
    color: "var(--text-primary)",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "15px",
    transition: "all 0.2s"
  },
  footer: {
    borderTop: "1px solid var(--border-color)",
    marginTop: "20px",
    padding: "30px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "13px"
  },
  loadingContainer: {
    textAlign: "center",
    gridColumn: "1/-1",
    padding: "80px 0"
  },
  loadingSkeleton: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
    padding: "0 40px 60px",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  skeletonCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    border: "1px solid var(--border-color)"
  },
  skeletonImage: {
    width: "100%",
    height: "280px",
    background: "linear-gradient(90deg, var(--bg-card) 25%, #222 50%, var(--bg-card) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite"
  },
  skeletonText: (width) => ({
    height: "14px",
    width: width,
    borderRadius: "6px",
    margin: "12px 18px",
    background: "linear-gradient(90deg, var(--bg-card) 25%, #222 50%, var(--bg-card) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite"
  })
};

export default function Home() {
  const navigate = useNavigate();
  const { user: loginUser } = useAuth();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [slideDir, setSlideDir] = useState("none");
  const [animKey, setAnimKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDir("left");
      setAnimKey((k) => k + 1);
      setCurrentImage((prev) => (prev >= BANNERS.length - 1 ? 0 : prev + 1));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: prendasData } = await supabase
          .from("prendas")
          .select("*")
          .order("created_at", { ascending: false });

        const dynamicProducts = (prendasData || []).map(mapProduct);

        setProducts(dynamicProducts);
        setLoadingProducts(false);
      } catch (error) {
        console.error("Error inicializando datos:", error);
      }
    };

    loadData();
  }, []);

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

  const nextSlide = () => {
    setSlideDir("left");
    setAnimKey((k) => k + 1);
    setCurrentImage(currentImage === BANNERS.length - 1 ? 0 : currentImage + 1);
  };

  const prevSlide = () => {
    setSlideDir("right");
    setAnimKey((k) => k + 1);
    setCurrentImage(currentImage === 0 ? BANNERS.length - 1 : currentImage - 1);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes slideLeft { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideNone { from { opacity: 1; } to { opacity: 1; } }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.5); border-color: var(--border-hover); }
        .product-card:hover .product-img { transform: scale(1.05); }
        .product-card:hover .details-btn { opacity: 1; transform: translateY(0); }
        .search-input:focus { border-color: #555 !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.05); }
        .fav-btn:hover { transform: scale(1.15); }
        .nav-link:hover { color: #fff !important; background: rgba(255,255,255,0.05) !important; }
        .cart-btn:hover { background: rgba(255,255,255,0.08); }
        .details-btn { opacity: 0.9; transform: translateY(2px); }
        .details-btn:hover { filter: brightness(1.1); transform: translateY(0) !important; }
        .contact-btn:hover { border-color: #555; background: var(--bg-card-hover); }
        .carousel-btn:hover { background: rgba(0,0,0,0.8); transform: translateY(-50%) scale(1.1); }
      `}</style>

      {/* NAVBAR */}
      <Navbar user={loginUser} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activePage="inicio" />

      {/* HERO CAROUSEL */}
      <section style={styles.heroCarousel}>
        <img
          key={animKey}
          src={BANNERS[currentImage]}
          alt="Banner"
          style={styles.heroImage(
            slideDir === "left" ? "slideLeft 0.6s ease" :
            slideDir === "right" ? "slideRight 0.6s ease" :
            "slideNone 0.6s ease"
          )}
        />
        <div style={styles.heroOverlay} />
        <button className="carousel-btn" onClick={prevSlide} style={styles.carouselBtn("left")}>‹</button>
        <button className="carousel-btn" onClick={nextSlide} style={styles.carouselBtn("right")}>›</button>
      </section>

      {/* PRODUCTS GRID */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 40px 60px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", textAlign: "center" }}>
          Todos los productos
        </h2>

        {loadingProducts ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={styles.skeletonImage} />
                <div style={styles.skeletonText("60%")} />
                <div style={styles.skeletonText("40%")} />
                <div style={{ padding: "0 18px 18px" }}>
                  <div style={{ ...styles.skeletonText("100%"), margin: 0, height: "36px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {filteredProducts.map((product) => {
              const catColor = getCatColor(product.category);
              const r = getProductRating(product.id);
              return (
                <div
                  key={product.id}
                  className="product-card"
                  style={styles.productCard(catColor)}
                  onClick={() => handleViewDetails(product.id)}
                >
                  <div style={{ overflow: "hidden", position: "relative" }}>
                    <img
                      className="product-img"
                      src={product.image}
                      alt={product.name}
                      style={styles.productImage}
                    />

                    {loginUser && (
                      <button
                        className="fav-btn"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                        style={styles.favBtn(favorites.includes(product.id))}
                      >
                        {favorites.includes(product.id) ? "★" : "☆"}
                      </button>
                    )}

                    {product.agotada && (
                      <div style={styles.badge("var(--danger)")}>Agotado</div>
                    )}
                    {!product.agotada && product.category && (
                      <div style={{ ...styles.badge(catColor), color: "#000" }}>
                        {product.category}
                      </div>
                    )}
                  </div>

                  <div style={styles.productInfo}>
                    {r.count > 0 && (
                      <div style={styles.productRating}>
                        <DisplayStars rating={r.avg} size={13} />
                        <span style={styles.ratingCount}>({r.count})</span>
                      </div>
                    )}

                    <h3 style={styles.productName}>{product.name}</h3>

                    <div style={styles.priceContainer}>
                      <span style={styles.currentPrice(catColor)}>
                        {product.price}
                      </span>
                    </div>

                    <button
                      className="details-btn"
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
            {filteredProducts.length === 0 && !loadingProducts && (
              <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "80px 0", color: "var(--text-muted)" }}>
                <p style={{ fontSize: "18px" }}>No se encontraron productos</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* CONTACT */}
      <section style={styles.contactSection}>
        <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>¿Te interesa algo?</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "28px" }}>
          Contáctanos por WhatsApp o correo electrónico
        </p>
        <Link to="/contact">
          <button className="contact-btn" style={styles.contactBtn}>
            Ir a Contacto →
          </button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © 2026 @Rogeek
      </footer>
    </div>
  );
}
