import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { SIZES_BY_CATEGORY } from "../utils/constants";

export default function NuevaPrenda() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState("");
  const [extraFiles, setExtraFiles] = useState([]);
  const [extraPreviews, setExtraPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categoria, setCategoria] = useState("camisetas");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [cantidad, setCantidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "owner"))) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    setSelectedSizes([]);
  }, [categoria]);

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleExtraFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (extraFiles.length + files.length > 5) {
      setError("Máximo 5 imágenes extra");
      return;
    }
    const newFiles = [...extraFiles, ...files].slice(0, 5);
    setExtraFiles(newFiles);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setExtraPreviews(newPreviews);
  };

  const removeExtraImage = (index) => {
    const updated = extraFiles.filter((_, i) => i !== index);
    setExtraFiles(updated);
    setExtraPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nombre || !precio || !imagenFile || !descripcion || cantidad === "") {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (selectedSizes.length === 0) {
      setError("Selecciona al menos una talla");
      return;
    }

    setUploading(true);

    const fileName = `${Date.now()}_${imagenFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("prendas")
      .upload(fileName, imagenFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setError("Error al subir la imagen: " + (uploadError.message || "Verifica que el bucket 'prendas' exista y sea público"));
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("prendas")
      .getPublicUrl(fileName);

    const imagenUrl = urlData.publicUrl;

    const extraUrls = [];
    for (const file of extraFiles) {
      const extraFileName = `${Date.now()}_${file.name}`;
      const { error: extraUploadError } = await supabase.storage
        .from("prendas")
        .upload(extraFileName, file);
      if (extraUploadError) {
        console.error("Extra upload error:", extraUploadError);
      } else {
        const { data: extraUrlData } = supabase.storage
          .from("prendas")
          .getPublicUrl(extraFileName);
        extraUrls.push(extraUrlData.publicUrl);
      }
    }

    const { error: insertError } = await supabase.from("prendas").insert([
      {
        nombre,
        precio,
        imagen: imagenUrl,
        imagenes_extras: extraUrls,
        categoria,
        tallas: selectedSizes,
        descripcion,
        cantidad: parseInt(cantidad) || 0
      }
    ]);

    setUploading(false);

    if (insertError) {
      console.error(insertError);
      setError("Error al guardar la prenda");
      return;
    }

    setSuccess("Prenda agregada correctamente");
    setNombre("");
    setPrecio("");
    setImagenFile(null);
    setImagenPreview("");
    setExtraFiles([]);
    setExtraPreviews([]);
    setCategoria("camisetas");
    setSelectedSizes([]);
    setCantidad("");
    setDescripcion("");
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>Cargando...</p>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    backgroundColor: "white",
    color: "black",
    fontSize: "15px",
    boxSizing: "border-box"
  };

  const btnPrimary = {
    width: "100%",
    padding: "16px",
    backgroundColor: "#00d4ff",
    color: "#000",
    border: "none",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "16px"
  };

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
      <Navbar user={user} activePage="nueva-prenda" extraLinks={[{to: "/nueva-prenda", label: "Nueva Prenda", key: "nueva-prenda"}, {to: "/lista", label: "Lista", key: "lista"}]} />

      <div style={{ display: "flex", justifyContent: "center", padding: "50px 20px" }}>
        <div style={{
          backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "20px",
          padding: "50px", width: "100%", maxWidth: "550px"
        }}>
          <h1 style={{ textAlign: "center", marginBottom: "30px", fontSize: "32px", color: "#000000" }}>Nueva Prenda</h1>

          <form onSubmit={handleSubmit}>
            <label style={{ color: "#555", fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Nombre</label>
            <input
              type="text" placeholder="Ej: Camisa Premium Blanca"
              value={nombre} onChange={(e) => setNombre(e.target.value)}
              required style={{ ...inputStyle, marginBottom: "18px" }}
            />

            <label style={{ color: "#555", fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Precio</label>
            <input
              type="text" placeholder="Ej: $899 MXN"
              value={precio} onChange={(e) => setPrecio(e.target.value)}
              required style={{ ...inputStyle, marginBottom: "18px" }}
            />

            <label style={{ color: "#555", fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Imagen de la prenda</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required style={{ ...inputStyle, marginBottom: "18px", padding: "10px" }}
            />

            {imagenPreview && (
              <div style={{ textAlign: "center", marginBottom: "18px" }}>
                <img src={imagenPreview} alt="Vista previa" style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "12px" }} />
              </div>
            )}

            <label style={{ color: "#555", fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Imágenes extra (máximo 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleExtraFilesChange}
              style={{ ...inputStyle, marginBottom: "10px", padding: "10px" }}
            />
            {extraPreviews.length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
                {extraPreviews.map((preview, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={preview} alt={`Extra ${i + 1}`} style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "10px" }} />
                    <button type="button" onClick={() => removeExtraImage(i)}
                      style={{ position: "absolute", top: "-6px", right: "-6px", width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#e74c3c", color: "white", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label style={{ color: "#555", fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={{ ...inputStyle, marginBottom: "18px", cursor: "pointer" }}
            >
              <option value="camisetas">Camisetas</option>
              <option value="sudaderas">Sudaderas</option>
              <option value="pantalones">Pantalones</option>
              <option value="gorras">Gorras</option>
              <option value="zapatos">Zapatos / Tennis</option>
            </select>

            <label style={{ color: "#555", fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Tallas</label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
              {(SIZES_BY_CATEGORY[categoria] || []).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: selectedSizes.includes(size) ? "2px solid #000" : "1px solid #e0e0e0",
                    backgroundColor: selectedSizes.includes(size) ? "#000" : "white",
                    color: selectedSizes.includes(size) ? "white" : "black",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "14px"
                  }}
                >
                  {size}
                </button>
              ))}
            </div>

            <label style={{ color: "#555", fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Descripción</label>
            <textarea
              placeholder="Describe la prenda..."
              value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              required rows={4}
              style={{ ...inputStyle, marginBottom: "18px", resize: "vertical" }}
            />

            <label style={{ color: "#555", fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Stock (cantidad)</label>
            <input
              type="number" placeholder="Ej: 50" min="0"
              value={cantidad} onChange={(e) => setCantidad(e.target.value)}
              required style={{ ...inputStyle, marginBottom: "18px" }}
            />

            {error && (
              <p style={{ color: "#e74c3c", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>{error}</p>
            )}
            {success && (
              <p style={{ color: "#2ecc71", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>{success}</p>
            )}

            <button type="submit" style={{ ...btnPrimary, opacity: uploading ? 0.6 : 1 }} disabled={uploading}>
              {uploading ? "Subiendo..." : "AGREGAR PRENDA"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
