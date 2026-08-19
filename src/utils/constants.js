export const CATEGORY_COLORS = {
  camisetas: "#00d4ff",
  sudaderas: "#a855f7",
  pantalones: "#22c55e",
  zapatos: "#f97316",
  gorras: "#ec4899"
};

export const SIZES_BY_CATEGORY = {
  camisetas: ["S", "M", "L", "XL", "XXL"],
  sudaderas: ["S", "M", "L", "XL", "XXL"],
  pantalones: ["28", "30", "32", "34", "36", "38", "40", "42"],
  gorras: ["Unitalla"],
  zapatos: ["24", "25", "26", "27", "28", "29", "30"]
};

export function mapProduct(p) {
  return {
    id: p.id,
    name: p.nombre,
    price: p.precio,
    sizes: p.tallas,
    description: p.descripcion,
    image: p.imagen,
    extraImages: p.imagenes_extras || [],
    category: p.categoria,
    agotada: p.agotada || false,
    cantidad: p.cantidad || 0
  };
}

export function formatPrice(price) {
  const num = parseFloat(String(price).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? price : `$${num.toLocaleString("es-MX")} MXN`;
}

export function getCatColor(category) {
  return CATEGORY_COLORS[category] || "#ffffff";
}
